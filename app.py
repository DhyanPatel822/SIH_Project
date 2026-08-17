import os
import random

from .database import (
    init_db, fetch_all_bins, fetch_bin_by_id, update_bin_telemetry, 
    add_citizen_report, fetch_all_reports, update_report_status, delete_report, delete_resolved_reports, save_optimized_route
)
from .dsa_router import optimize_collection_route
from .ai_classifier import classify_waste_image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Initialize SQLite Database
init_db()

@app.route('/')
def serve_index():
    if os.path.exists(os.path.join(ROOT_DIR, 'index.html')):
        return send_from_directory(ROOT_DIR, 'index.html')
    return send_from_directory(FRONTEND_DIR, 'index.html')

# ==================== API ENDPOINTS ====================

@app.route('/api/bins', methods=['GET'])
def get_bins():
    bins = fetch_all_bins()
    return jsonify({'status': 'success', 'count': len(bins), 'bins': bins})

@app.route('/api/bin-hardware/<bin_id>', methods=['GET'])
def get_bin_hardware(bin_id):
    bin_data = fetch_bin_by_id(bin_id)
    if not bin_data:
        return jsonify({'status': 'error', 'message': 'Bin not found'}), 404
    
    hardware_info = {
        'bin_id': bin_data['id'],
        'location': bin_data['name'],
        'esp32_ip': bin_data['esp32_ip'],
        'firmware_status': 'ONLINE',
        'ultrasonic_sensor': {
            'model': 'HC-SR04 Dual Ultrasonic Sensor',
            'distance_cm': bin_data['sensor_distance_cm'],
            'fill_level_pct': bin_data['fill_level'],
            'status': 'OPERATIONAL'
        },
        'weight_sensor': {
            'model': 'HX711 200kg Load Cell',
            'current_weight_kg': bin_data['current_weight_kg'],
            'max_capacity_kg': bin_data['capacity_kg'],
            'status': 'CALIBRATED'
        },
        'environment_sensor': {
            'model': 'MQ-135 Air Quality / Gas Sensor',
            'gas_ppm': bin_data['gas_ppm'],
            'temperature_c': bin_data['temperature_c'],
            'status': 'NORMAL' if bin_data['gas_ppm'] < 250 else 'HAZARD_ALERT'
        }
    }
    return jsonify({'status': 'success', 'hardware': hardware_info})

@app.route('/api/iot/telemetry', methods=['POST'])
def receive_iot_telemetry():
    data = request.json or {}
    bin_id = data.get('bin_id')
    fill_level = data.get('fill_level')
    weight_kg = data.get('weight_kg', 50.0)
    battery_pct = data.get('battery_pct', 95)
    temperature_c = data.get('temperature_c', 28.0)
    gas_ppm = data.get('gas_ppm', 140.0)

    if not bin_id or fill_level is None:
        return jsonify({'status': 'error', 'message': 'Missing required fields'}), 400

    sensor_distance_cm = round(100.0 * (1.0 - (fill_level / 100.0)), 1)
    update_bin_telemetry(bin_id, fill_level, weight_kg, battery_pct, temperature_c, gas_ppm, sensor_distance_cm)

    return jsonify({
        'status': 'success',
        'message': f'ESP32 sensor telemetry for bin {bin_id} ingested into SQLite database successfully',
        'data': {
            'bin_id': bin_id,
            'fill_level': fill_level,
            'weight_kg': weight_kg,
            'battery_pct': battery_pct,
            'temperature_c': temperature_c,
            'gas_ppm': gas_ppm,
            'sensor_distance_cm': sensor_distance_cm
        }
    })

@app.route('/api/iot/simulate', methods=['POST'])
def simulate_iot_events():
    bins = fetch_all_bins()
    updated_bins = []
    
    for b in bins:
        if b['id'] in ['DEPOT-00', 'RECYCLE-99']:
            continue
        
        delta = random.choice([+5, +10, +15, -10, 0])
        new_fill = max(10, min(100, b['fill_level'] + delta))
        new_weight = round(b['capacity_kg'] * (new_fill / 100.0), 1)
        new_battery = max(10, b['battery_pct'] - random.choice([0, 1]))
        new_temp = round(26.0 + (new_fill * 0.1) + random.uniform(-1, 1), 1)
        new_gas = round(120.0 + (new_fill * 1.2) + random.uniform(-5, 5), 1)
        new_dist = round(100.0 * (1.0 - (new_fill / 100.0)), 1)

        update_bin_telemetry(b['id'], new_fill, new_weight, new_battery, new_temp, new_gas, new_dist)
        updated_bins.append({'bin_id': b['id'], 'new_fill': new_fill, 'status': 'OVERFLOW_CRITICAL' if new_fill>=85 else 'NORMAL'})

    return jsonify({'status': 'success', 'message': 'Simulated IoT telemetry update completed', 'updated': updated_bins})

@app.route('/api/optimize-route', methods=['POST'])
def optimize_route():
    data = request.json or {}
    threshold = float(data.get('fill_threshold', 75.0))

    bins = fetch_all_bins()
    optimization_result = optimize_collection_route(bins, fill_threshold=threshold)

    route_id = save_optimized_route(
        route_name=f"Ahmedabad Collection Route (Threshold {threshold}%)",
        total_distance=optimization_result['total_distance_km'],
        estimated_time=optimization_result['estimated_time_min'],
        bins_count=optimization_result['bins_collected'],
        fuel_saved=optimization_result['fuel_saved_liters'],
        co2_saved=optimization_result['co2_saved_kg'],
        waypoints=optimization_result['waypoints'],
        dsa_trace=optimization_result['dsa_trace']
    )

    optimization_result['route_id'] = route_id
    return jsonify({'status': 'success', 'data': optimization_result})

@app.route('/api/classify-waste', methods=['POST'])
def classify_waste():
    data = request.json or {}
    image_b64 = data.get('image_base64')
    sample_category = data.get('sample_category')

    result = classify_waste_image(image_base64=image_b64, sample_category=sample_category)
    return jsonify({'status': 'success', 'classification': result})

@app.route('/api/reports', methods=['GET', 'POST'])
def handle_reports():
    if request.method == 'POST':
        data = request.json or {}
        name = data.get('reporter_name', 'Anonymous Citizen')
        phone = data.get('reporter_phone', '')
        lat = float(data.get('latitude', 23.0225))
        lng = float(data.get('longitude', 72.5714))
        address = data.get('address', 'Navrangpura, Ahmedabad')
        category = data.get('waste_category', 'Overflowing Public Bin')
        desc = data.get('description', '')
        ward_zone = data.get('ward_zone', 'West Zone - Navrangpura')
        priority = data.get('priority', 'P1 - CRITICAL')
        assigned_unit = data.get('assigned_unit', 'QRV-04 (West Zone)')

        report_id = add_citizen_report(name, phone, lat, lng, address, category, desc, ward_zone=ward_zone, priority=priority, assigned_unit=assigned_unit)
        return jsonify({'status': 'success', 'report_id': report_id, 'message': 'Report submitted successfully'})
    else:
        reports = fetch_all_reports()
        return jsonify({'status': 'success', 'reports': reports})

@app.route('/api/reports/<int:report_id>/status', methods=['POST'])
def update_report_state(report_id):
    data = request.json or {}
    new_status = data.get('status', 'DISPATCHED')
    update_report_status(report_id, new_status)
    return jsonify({'status': 'success', 'message': f'Report #{report_id} status updated to {new_status}'})

@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
def remove_single_report(report_id):
    delete_report(report_id)
    return jsonify({'status': 'success', 'message': f'Report #{report_id} removed from AMC database'})

@app.route('/api/reports/resolved', methods=['DELETE'])
def clear_all_resolved():
    count = delete_resolved_reports()
    return jsonify({'status': 'success', 'message': f'Cleaned {count} resolved complaints from database', 'deleted_count': count})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    bins = fetch_all_bins()
    regular_bins = [b for b in bins if b['id'] not in ['DEPOT-00', 'RECYCLE-99']]

    total_bins = len(regular_bins)
    critical_bins = [b for b in regular_bins if b['fill_level'] >= 85]
    warning_bins = [b for b in regular_bins if 75 <= b['fill_level'] < 85]
    normal_bins = [b for b in regular_bins if b['fill_level'] < 75]

    total_capacity = sum(b['capacity_kg'] for b in regular_bins)
    current_weight = sum(b['current_weight_kg'] for b in regular_bins)
    avg_fill = sum(b['fill_level'] for b in regular_bins) / total_bins if total_bins > 0 else 0

    return jsonify({
        'status': 'success',
        'summary': {
            'total_bins': total_bins,
            'critical_overflow_count': len(critical_bins),
            'warning_count': len(warning_bins),
            'normal_count': len(normal_bins),
            'avg_fill_level_pct': round(avg_fill, 1),
            'total_waste_collected_kg': round(current_weight, 1),
            'total_capacity_kg': round(total_capacity, 1),
            'fleet_efficiency_score': '96.2%'
        }
    })

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(ROOT_DIR, path)):
        return send_from_directory(ROOT_DIR, path)
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return serve_index()

if __name__ == '__main__':
    print("Starting Smart Waste Management System Backend on http://127.0.0.1:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=True)
