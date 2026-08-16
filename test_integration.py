import urllib.request
import time
import threading
import json
import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import app

def run_test():
    server = threading.Thread(target=lambda: app.run(host='127.0.0.1', port=5055, debug=False))
    server.daemon = True
    server.start()
    time.sleep(1.5)

    print("[1/5] Testing Frontend HTML Delivery...")
    with urllib.request.urlopen('http://127.0.0.1:5055/') as res:
        assert res.status == 200
        html = res.read().decode('utf-8')
        assert '<title>SmartWaste IQ' in html
        print(" -> Index HTML served (Status: 200)")

    print("[2/5] Testing Static CSS & JS Assets...")
    with urllib.request.urlopen('http://127.0.0.1:5055/styles.css') as res:
        assert res.status == 200
        print(f" -> styles.css served ({len(res.read())} bytes)")
    with urllib.request.urlopen('http://127.0.0.1:5055/app.js') as res:
        assert res.status == 200
        print(f" -> app.js served ({len(res.read())} bytes)")

    print("[3/5] Testing REST API /api/bins...")
    with urllib.request.urlopen('http://127.0.0.1:5055/api/bins') as res:
        assert res.status == 200
        data = json.loads(res.read().decode('utf-8'))
        print(f" -> /api/bins returned {len(data['bins'])} smart bins from SQLite")

    print("[4/5] Testing Route Optimization API /api/optimize-route...")
    req = urllib.request.Request(
        'http://127.0.0.1:5055/api/optimize-route',
        data=json.dumps({'fill_threshold': 75.0}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        route_data = json.loads(res.read().decode('utf-8'))['data']
        print(f" -> Dijkstra+TSP Route: {route_data['total_distance_km']} km, fuel saved: {route_data['fuel_saved_liters']} L")

    print("[5/5] Testing IoT Telemetry Simulation API /api/iot/simulate...")
    sim_req = urllib.request.Request('http://127.0.0.1:5055/api/iot/simulate', data=b'{}', headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(sim_req) as res:
        assert res.status == 200
        sim_data = json.loads(res.read().decode('utf-8'))
        print(f" -> IoT simulation updated {len(sim_data['updated'])} smart dustbins")

    print("\n=======================================================")
    print(" ALL TESTS PASSED: FRONTEND & BACKEND PERFECTLY CONNECTED!")
    print("=======================================================")

if __name__ == '__main__':
    run_test()
