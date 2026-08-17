import sys
import os
import threading
import webbrowser

root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import app

def open_browser():
    try:
        webbrowser.open('http://127.0.0.1:5000')
    except Exception:
        pass

if __name__ == '__main__':
    print("=================================================================")
    print(" [SIH 2026] SMART WASTE MANAGEMENT & ROUTE OPTIMIZATION SYSTEM ")
    print(" Server Running at: http://127.0.0.1:5000")
    print(" Press CTRL+C to stop the server")
    print("=================================================================")
    
    # Auto-open browser in 1.2 seconds
    threading.Timer(1.2, open_browser).start()
    
    app.run(host='0.0.0.0', port=5000, debug=False)

