import os
import json
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'waste_management.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bins (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            fill_level INTEGER NOT NULL DEFAULT 0,
            capacity_kg REAL NOT NULL DEFAULT 150.0,
            current_weight_kg REAL NOT NULL DEFAULT 0.0,
            waste_type TEXT NOT NULL,
            battery_pct INTEGER NOT NULL DEFAULT 100,
            temperature_c REAL NOT NULL DEFAULT 28.0,
            gas_ppm REAL NOT NULL DEFAULT 120.0,
            sensor_distance_cm REAL NOT NULL DEFAULT 85.0,
            camera_status TEXT NOT NULL DEFAULT 'ONLINE',
            camera_last_frame TEXT DEFAULT '',
            esp32_ip TEXT DEFAULT '192.168.1.100',
            status TEXT NOT NULL DEFAULT 'NORMAL',
            trigger_source TEXT NOT NULL DEFAULT 'Sensor',
            arrival_time TEXT DEFAULT '10:30',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telemetry_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bin_id TEXT NOT NULL,
            fill_level INTEGER NOT NULL,
            weight_kg REAL NOT NULL,
            battery_pct INTEGER NOT NULL,
            temperature_c REAL NOT NULL,
            gas_ppm REAL NOT NULL,
            sensor_distance_cm REAL NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bin_id) REFERENCES bins (id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_name TEXT NOT NULL,
            reporter_phone TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            address TEXT NOT NULL,
            waste_category TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_name TEXT NOT NULL,
            total_distance_km REAL NOT NULL,
            estimated_time_min INTEGER NOT NULL,
            bins_collected INTEGER NOT NULL,
            fuel_saved_liters REAL NOT NULL,
            co2_saved_kg REAL NOT NULL,
            waypoints_json TEXT NOT NULL,
            dsa_trace_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

    # Migration checks for reports table
    for col, col_def in [
        ('ward_zone', 'TEXT DEFAULT "West Zone - Navrangpura"'),
        ('priority', 'TEXT DEFAULT "P1 - CRITICAL"'),
        ('assigned_unit', 'TEXT DEFAULT "QRV-04 (West Zone)"')
    ]:
        try:
            cursor.execute(f'ALTER TABLE reports ADD COLUMN {col} {col_def}')
        except Exception:
            pass

    conn.commit()

    cursor.execute('SELECT COUNT(*) FROM bins')
    if cursor.fetchone()[0] == 0:
        seed_ahmedabad_bins(cursor)
        conn.commit()

    cursor.execute('SELECT COUNT(*) FROM reports')
    if cursor.fetchone()[0] == 0:
        seed_initial_reports(cursor)
        conn.commit()

    conn.close()

def seed_initial_reports(cursor):
    sample_reports = [
        ('Priya Sharma', '+91 98250 •••••', 'West Zone - Navrangpura', 23.0360, 72.5590, 'Commerce Six Roads, Navrangpura', 'Overflowing Public Bin', 'P1 - CRITICAL', 'QRV-04 (West Zone)', 'Commercial packaging and plastic waste overflow blocking footpath.', 'PENDING'),
        ('Rajesh Mehta', '+91 98980 •••••', 'Central Zone - Ashram Road', 23.0390, 72.5710, 'Near Income Tax Circle, Ashram Road', 'Hazardous Chemical Waste', 'P2 - HIGH HAZARD', 'QRV-01 (Hazmat Unit)', 'Discarded commercial solvent cans and lead-acid battery components.', 'DISPATCHED'),
        ('Kavita Shah', '+91 97240 •••••', 'North West Zone - Vastrapur', 23.0370, 72.5290, 'Vastrapur Lake Main Promenade Gate', 'Uncollected Commercial Waste', 'P3 - ROUTINE', 'QRV-07 (Mini Dumper)', 'Weekend market food peel and organic waste piles near service lane.', 'RESOLVED')
    ]
    try:
        cursor.executemany('''
            INSERT INTO reports (reporter_name, reporter_phone, ward_zone, latitude, longitude, address, waste_category, priority, assigned_unit, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_reports)
    except Exception:
        pass

def seed_ahmedabad_bins(cursor):
    sample_bins = [
        ('DEPOT-00', 'Sabarmati Fleet Dispatch Hub', 23.0300, 72.5780, 0, 500.0, 0.0, 'Municipal Dispatch Station', 100, 24.0, 50.0, 200.0, 'ONLINE', 'depot_cam.jpg', '192.168.1.1', 'DISPATCH_HUB', 'Static', '10:00'),
        ('RECYCLE-99', 'Pirana Waste Recovery Center', 22.9800, 72.5850, 0, 1000.0, 0.0, 'Materials Recovery Facility', 100, 24.0, 45.0, 300.0, 'ONLINE', 'recycle_cam.jpg', '192.168.1.2', 'RECOVERY_CENTER', 'Static', '12:45'),
        ('BIN-101', 'Navrangpura Commerce Six Roads', 23.0360, 72.5590, 88, 120.0, 105.6, 'Plastic & Recyclable', 92, 31.5, 185.0, 14.4, 'ONLINE', 'bin101_cam.jpg', '192.168.1.101', 'OVERFLOW_CRITICAL', 'Sensor', '10:15'),
        ('BIN-102', 'SG Highway Infocity Complex', 23.0300, 72.5070, 94, 150.0, 141.0, 'E-Waste & Metal', 85, 33.0, 210.0, 7.2, 'ONLINE', 'bin102_cam.jpg', '192.168.1.102', 'OVERFLOW_CRITICAL', 'Sensor', '10:28'),
        ('BIN-103', 'Satellite ISRO Circle Junction', 23.0270, 72.5180, 42, 100.0, 42.0, 'Organic & Wet Waste', 98, 28.0, 130.0, 69.6, 'ONLINE', 'bin103_cam.jpg', '192.168.1.103', 'NORMAL_LOW', 'Static', '10:40'),
        ('BIN-104', 'Vastrapur Lake Main Gate', 23.0370, 72.5290, 79, 200.0, 158.0, 'Paper & Cardboard', 76, 29.5, 145.0, 25.2, 'ONLINE', 'bin104_cam.jpg', '192.168.1.104', 'WARNING_HIGH', 'Sensor', '10:52'),
        ('BIN-105', 'Ashram Road Income Tax Circle', 23.0390, 72.5710, 86, 120.0, 103.2, 'Mixed Solid Waste', 90, 34.0, 195.0, 16.8, 'ONLINE', 'bin105_cam.jpg', '192.168.1.105', 'OVERFLOW_CRITICAL', 'Ticket', '11:05'),
        ('BIN-106', 'Maninagar Kankaria Gate 3', 23.0060, 72.6010, 35, 100.0, 35.0, 'Organic Waste', 95, 27.5, 115.0, 78.0, 'ONLINE', 'bin106_cam.jpg', '192.168.1.106', 'NORMAL_LOW', 'Static', '11:18'),
        ('BIN-107', 'CG Road Municipal Market Plaza', 23.0250, 72.5580, 92, 150.0, 138.0, 'Plastic & Dry Waste', 82, 32.0, 240.0, 9.6, 'ONLINE', 'bin107_cam.jpg', '192.168.1.107', 'OVERFLOW_CRITICAL', 'Sensor', '11:30'),
        ('BIN-108', 'Bodakdev Judges Bungalow Road', 23.0420, 72.5130, 65, 100.0, 65.0, 'Hazardous & Medical', 88, 28.5, 160.0, 42.0, 'ONLINE', 'bin108_cam.jpg', '192.168.1.108', 'MODERATE_FILL', 'Static', '11:42'),
        ('BIN-109', 'Paldi Cross Roads Station', 23.0120, 72.5620, 78, 120.0, 93.6, 'Paper & Cardboard', 89, 30.0, 175.0, 26.4, 'ONLINE', 'bin109_cam.jpg', '192.168.1.109', 'WARNING_HIGH', 'Sensor', '11:55'),
        ('BIN-110', 'Naroda Industrial Estate Gate 2', 23.0720, 72.6510, 96, 250.0, 240.0, 'E-Waste & Heavy Metal', 91, 35.5, 280.0, 4.8, 'ONLINE', 'bin110_cam.jpg', '192.168.1.110', 'OVERFLOW_CRITICAL', 'Sensor', '12:10'),
        ('BIN-111', 'Gota SG Highway Junction', 23.0850, 72.5310, 82, 150.0, 123.0, 'Plastic & Dry Waste', 87, 31.0, 180.0, 21.6, 'ONLINE', 'bin111_cam.jpg', '192.168.1.111', 'WARNING_HIGH', 'Sensor', '12:20'),
        ('BIN-112', 'Thaltej Shilaj Main Road', 23.0480, 72.5020, 58, 120.0, 69.6, 'Glass & Dry Bottles', 94, 27.0, 120.0, 50.4, 'ONLINE', 'bin112_cam.jpg', '192.168.1.112', 'MODERATE_FILL', 'Static', '12:35'),
        ('BIN-113', 'Science City Circle Junction', 23.0740, 72.5120, 52, 150.0, 78.0, 'Mixed Recyclables', 93, 26.5, 110.0, 57.6, 'ONLINE', 'bin113_cam.jpg', '192.168.1.113', 'MODERATE_FILL', 'Static', '12:48'),
        ('BIN-114', 'Chandkheda Bus Terminal Hub', 23.1090, 72.5850, 24, 120.0, 28.8, 'Paper & Cardboard', 96, 25.0, 95.0, 91.2, 'ONLINE', 'bin114_cam.jpg', '192.168.1.114', 'NORMAL_LOW', 'Static', '13:00'),
        ('BIN-115', 'Bopal Cross Road Junction', 23.0330, 72.4680, 15, 120.0, 18.0, 'Organic & Wet Waste', 99, 24.5, 80.0, 102.0, 'ONLINE', 'bin115_cam.jpg', '192.168.1.115', 'NORMAL_LOW', 'Static', '13:15')
    ]

    cursor.executemany('''
        INSERT INTO bins (id, name, latitude, longitude, fill_level, capacity_kg, current_weight_kg, waste_type, battery_pct, temperature_c, gas_ppm, sensor_distance_cm, camera_status, camera_last_frame, esp32_ip, status, trigger_source, arrival_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_bins)

def fetch_all_bins():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bins')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def fetch_bin_by_id(bin_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bins WHERE id = ?', (bin_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_bin_telemetry(bin_id, fill_level, weight_kg, battery_pct, temperature_c, gas_ppm=150.0, sensor_distance_cm=20.0):
    conn = get_db_connection()
    cursor = conn.cursor()

    if fill_level >= 85 or temperature_c > 45 or gas_ppm > 250:
        status = 'OVERFLOW_CRITICAL'
    elif fill_level >= 75:
        status = 'WARNING_HIGH'
    elif fill_level >= 50:
        status = 'MODERATE_FILL'
    else:
        status = 'NORMAL_LOW'

    cursor.execute('''
        UPDATE bins 
        SET fill_level = ?, current_weight_kg = ?, battery_pct = ?, temperature_c = ?, gas_ppm = ?, sensor_distance_cm = ?, status = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (fill_level, weight_kg, battery_pct, temperature_c, gas_ppm, sensor_distance_cm, status, bin_id))

    cursor.execute('''
        INSERT INTO telemetry_logs (bin_id, fill_level, weight_kg, battery_pct, temperature_c, gas_ppm, sensor_distance_cm)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (bin_id, fill_level, weight_kg, battery_pct, temperature_c, gas_ppm, sensor_distance_cm))

    conn.commit()
    conn.close()

def add_citizen_report(reporter_name, reporter_phone, lat, lng, address, waste_category, description, ward_zone='West Zone - Navrangpura', priority='P1 - CRITICAL', assigned_unit='QRV-04 (West Zone)'):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO reports (reporter_name, reporter_phone, ward_zone, latitude, longitude, address, waste_category, priority, assigned_unit, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (reporter_name, reporter_phone, ward_zone, lat, lng, address, waste_category, priority, assigned_unit, description))
    except Exception:
        cursor.execute('''
            INSERT INTO reports (reporter_name, reporter_phone, latitude, longitude, address, waste_category, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (reporter_name, reporter_phone, lat, lng, address, waste_category, description))
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id

def fetch_all_reports():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM reports ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_report_status(report_id, new_status='DISPATCHED'):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE reports SET status = ? WHERE id = ?', (new_status, report_id))
    conn.commit()
    conn.close()

def delete_report(report_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM reports WHERE id = ?', (report_id,))
    conn.commit()
    conn.close()

def delete_resolved_reports():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM reports WHERE status = "RESOLVED"')
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted_count

def save_optimized_route(route_name, total_distance, estimated_time, bins_count, fuel_saved, co2_saved, waypoints, dsa_trace):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO routes (route_name, total_distance_km, estimated_time_min, bins_collected, fuel_saved_liters, co2_saved_kg, waypoints_json, dsa_trace_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (route_name, total_distance, estimated_time, bins_count, fuel_saved, co2_saved, json.dumps(waypoints), json.dumps(dsa_trace)))
    conn.commit()
    route_id = cursor.lastrowid
    conn.close()
    return route_id
