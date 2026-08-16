# 🚛 SmartWaste IQ - AI-Driven Municipal Fleet & Dynamic Route Optimizer

[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask REST API](https://img.shields.io/badge/Flask-3.0%2B-000000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLite Database](https://img.shields.io/badge/Database-SQLite3-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Leaflet.js-199900.svg?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Analytics-Chart.js-FF6384.svg?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, full-stack Smart Waste Management & Dynamic Shortest Path Route Optimization System designed for municipal corporations and smart cities (featuring live telemetry across Ahmedabad Smart City).

---

## 🌟 Key Highlights & Features

1. 🗺️ **Ahmedabad Smart City GIS Map**:
   - Interactive dark-mode geographic map plotting municipal smart dustbins across Ahmedabad (Navrangpura, SG Highway, Satellite, Vastrapur, Ashram Road, Maninagar, CG Road, Bodakdev, Paldi, Naroda, Gota, Thaltej, Science City, Chandkheda, Bopal).
   - Central **Sabarmati Fleet Dispatch Hub** and **Pirana Waste Recovery Center**.

2. 🧠 **Dijkstra Shortest Path & TSP 2-Opt Heuristic Route Optimizer**:
   - Computes real-time dynamic collection routes using Min-Heap Dijkstra and 2-Opt local search on spherical Haversine distance matrices.
   - Calculates total kilometers, travel duration, diesel fuel saved (L), and CO₂ offset emissions (kg).
   - **Path is computed on-demand**: Click **"Calculate Path"** to generate the optimal route sequence and view the polyline on the map.

3. 🚚 **Real-Time Truck Route Simulator**:
   - Live animated municipal truck vehicle moving checkpoint-by-checkpoint along the computed route.

4. 📡 **IoT Hardware Telemetry Diagnostics**:
   - Detailed microcontroller diagnostics for every bin:
     - **ESP32 Node MCU**: Wireless telemetry & IP status
     - **HC-SR04 Dual Ultrasonic Sensor**: Echo distance measurements (cm) & fill percentage (%)
     - **HX711 200kg Load Cell**: Real-time waste payload weight (kg)
     - **MQ-135 Air Quality / Gas Sensor**: Harmful gas concentration (PPM) & temperature (°C)
     - **ESP32-CAM OV2640 HD Vision Module**: Live edge optical frame status

5. 🤖 **AI Waste Sorting Classifier**:
   - Vision classifier categorizing items into **PET Plastic/Recyclable**, **Organic/Wet Waste**, **Paper/Cardboard**, **E-Waste & Batteries**, and **Hazardous Chemicals**.
   - Direct smart bin routing recommendations and material recyclability advice.
   - Supports preset specimen testing and custom photo upload.

6. 📢 **Citizen Reporting Portal**:
   - Enables citizens to submit geotagged overflow complaint tickets, immediately reflecting on municipal dispatch queues.

7. 🔄 **Dual Engine Architecture (Works Everywhere)**:
   - **Full-Stack Live Mode**: Powered by Python Flask REST API & SQLite relational database with continuous sensor logging.
   - **Zero-Install Standalone Mode**: If opened directly via browser (`index.html`) or hosted on **GitHub Pages**, the client-side JavaScript algorithm engine handles all routing, simulation, and diagnostics seamlessly with zero setup required.

---

## 🚀 Quick Start Guide (For Anyone Cloning from GitHub)

### Option 1: 1-Click Launch on Windows (Recommended)
Simply double-click the included batch file:
```
Start_Smart_Waste_System.bat
```
*(This automatically verifies Python, installs dependencies if needed, starts the Flask backend, and opens your browser to `http://127.0.0.1:5000`).*

---

### Option 2: 1-Click Launch on Linux / macOS
Open terminal in the project folder and run:
```bash
chmod +x start.sh
./start.sh
```

---

### Option 3: Manual Command Line Launch

#### 1. Prerequisites
Ensure **Python 3.8+** is installed ([python.org](https://www.python.org/downloads/)).

#### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/smart_waste_system.git
cd smart_waste_system
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run the Application
```bash
python app.py
```

#### 5. Open in Web Browser
Open your browser and navigate to:  
👉 **`http://127.0.0.1:5000`**

---

### Option 4: Zero-Install Standalone Mode (No Python Needed / GitHub Pages)
If you do not have Python installed or want to share a live static preview on **GitHub Pages**:
- Simply double click and open [`frontend/index.html`](frontend/index.html) in Chrome, Firefox, Edge, or Safari!
- The dashboard automatically detects client-side mode and runs the embedded Dijkstra + TSP algorithm and IoT simulation locally.

---

## 📁 Repository Structure

```text
smart_waste_system/
├── app.py                      # Unified Application Entry Point (Auto-launches browser)
├── run.py                      # Server Entry Point
├── Start_Smart_Waste_System.bat # Windows 1-Click Launcher (Auto install & run)
├── start.sh                    # Linux / macOS 1-Click Launcher
├── requirements.txt            # Python Dependencies
├── waste_management.db         # Pre-seeded SQLite Database
├── Procfile                    # Cloud Deployment WSGI Profile (Render/Heroku)
├── render.yaml                 # 1-Click Cloud Deployment Blueprint
├── .gitignore                  # Git Clean Rules
├── README.md                   # Complete Documentation
│
├── backend/                    # Python Backend & Algorithmic Layer
│   ├── __init__.py             # Python Package Marker
│   ├── app.py                  # Flask REST API Controller & Static Server
│   ├── database.py             # SQLite ORM & Telemetry Persistence
│   ├── dsa_router.py           # Dijkstra (Min-Heap) + TSP 2-Opt Engine
│   └── ai_classifier.py        # AI Waste Classification Logic
│
└── frontend/                   # Client User Interface
    ├── index.html              # Dashboard Markup (Glassmorphic Dark Mode)
    ├── styles.css              # Eco-Tech Design System
    └── app.js                  # Dynamic Leaflet GIS & Universal API Engine
```

---

## 📡 REST API Reference

The Flask backend provides clean REST endpoints with full CORS support:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bins` | Fetch all smart dustbins, current fill levels, coordinates, and telemetry |
| `GET` | `/api/bin-hardware/<bin_id>` | Retrieve sensor readings (HC-SR04, HX711, MQ-135, ESP32) for a specific bin |
| `POST` | `/api/optimize-route` | Calculate Dijkstra + TSP shortest route for bins above a fill threshold |
| `POST` | `/api/iot/telemetry` | Ingest real-time ESP32 sensor telemetry into SQLite database |
| `POST` | `/api/iot/simulate` | Trigger realistic sensor fluctuations and store history logs |
| `POST` | `/api/classify-waste` | Perform AI classification on waste images / categories |
| `GET`/`POST` | `/api/reports` | Retrieve or submit citizen overflow complaint tickets |
| `GET` | `/api/analytics` | Fetch fleet summary metrics and efficiency KPIs |

---

## 🧮 Algorithmic Formulation (Dijkstra + 2-Opt TSP)

1. **Haversine Distance**:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
2. **Graph Construction**: Generates a complete weighted graph connecting the Sabarmati Dispatch Hub, priority smart bins exceeding the threshold ($\ge 75\%$), and the Pirana Recovery Facility.
3. **Shortest Path & Nearest Neighbor TSP**: Utilizes Dijkstra's algorithm with a Min-Heap priority queue to determine shortest paths between candidate stops.
4. **2-Opt Local Search Optimization**: Iteratively untangles crossing sub-paths until no further Euclidean reduction is possible:
   $$\text{cost}(A, C) + \text{cost}(B, D) < \text{cost}(A, B) + \text{cost}(C, D)$$

---

## 📤 How to Upload to GitHub (Step-by-Step)

To push this repository to your own GitHub account:

```bash
# 1. Initialize git repository
git init

# 2. Add all project files
git add .

# 3. Commit your changes
git commit -m "feat: Smart Waste Management & Route Optimization System"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smart-waste-system.git

# 6. Push code to GitHub
git push -u origin main
```

---

## ☁️ Free 1-Click Cloud Deployment (Render / Railway)

1. Fork or push this repository to your GitHub.
2. Go to [Render.com](https://render.com/) or [Railway.app](https://railway.app/).
3. Click **New Web Service** and select this repository.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `gunicorn backend.app:app`
6. Your live web application will be accessible worldwide on a free HTTPS domain!

---

## 📜 License
This project is open source and available under the **MIT License**.
