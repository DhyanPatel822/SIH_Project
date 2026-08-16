import sys
import os

root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import app

if __name__ == '__main__':
    print("=================================================================")
    print(" [SIH 2026] SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM ")
    print(" Web App Live at: http://127.0.0.1:5000")
    print("=================================================================")
    app.run(host='0.0.0.0', port=5000, debug=False)
