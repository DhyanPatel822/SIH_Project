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

6. 🔄 **Dual Engine Architecture (Works Everywhere)**:
   - **Full-Stack Live Mode**: Powered by Python Flask REST API & SQLite relational database with continuous sensor logging.
   - **Zero-Install Standalone Cloud Mode**: If opened directly via browser (`index.html`) or hosted on **GitHub Pages**, the client-side JavaScript algorithm engine handles all routing, simulation, and diagnostics seamlessly with zero setup required and 100% clean browser compatibility.

---

## 🌐 Free Instant GitHub Pages Deployment (Shareable Online Link)

You can share a live working link to anyone without needing a backend server:

1. Push this repository to your GitHub account (`main` branch).
2. On GitHub, go to your repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Choose Branch: **`main`** and Folder: **`/ (root)`**, then click **Save**.
5. Your live website link will be ready at:
   👉 **`https://YOUR_USERNAME.github.io/REPO_NAME/`**
6. Anyone who opens the link will see the full interactive dashboard immediately with zero virus/security errors.

---

## 🚀 Local Quick Start Guide

### Option 1: Standard Python Launch (Recommended)
Open a terminal in the project folder and run:
```bash
python app.py
```
*(This automatically starts the server and opens your browser at `http://127.0.0.1:5000`).*

---

### Option 2: Windows 1-Click Launch
Double-click `Start_Smart_Waste_System.bat`.

---

### Option 3: Linux / macOS Launch
Open terminal in the project folder and run:
```bash
chmod +x start.sh
./start.sh
```

---

### Option 4: Zero-Install Standalone Mode (No Python Needed)
- Double-click and open [`index.html`](index.html) directly in any browser (Chrome, Firefox, Edge, Safari).
- Everything (map, route calculation, IoT simulation, AI classifier) works locally out of the box.

---

## 📁 Repository Structure

```text
smart_waste_system/
├── index.html                  # Main Web Dashboard Entry (Root Level for GitHub Pages)
├── styles.css                  # Eco-Tech Design System
├── app.js                      # Dynamic Leaflet GIS & Universal Algorithmic Engine
├── app.py                      # Unified Application Entry Point (Auto-launches browser)
├── run.py                      # Server Entry Point
├── Start_Smart_Waste_System.bat # Windows 1-Click Launcher
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
└── frontend/                   # Frontend Backup Assets
    ├── index.html              # Dashboard Markup
    ├── styles.css              # Styling Tokens
    └── app.js                  # App Engine
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

## 📜 License
This project is open source and available under the **MIT License**.
