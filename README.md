# SmartWaste IQ - Smart Waste Management & Route Optimization System

> **SIH 2026 Problem Statement #4 (PSID: 4-L)**  
> AI-driven IoT Municipal Waste Collection & Dynamic Shortest Path Route Optimizer for Ahmedabad Smart City.

---

## 🌟 Key Features

1. **Ahmedabad Interactive GIS Map**:
   - Visualizes smart dustbins across Ahmedabad (Navrangpura, SG Highway, Satellite, Vastrapur, Ashram Road, Maninagar, CG Road, Bodakdev, Paldi, Naroda).
   - Features central **Sabarmati Fleet Dispatch Hub** and **Pirana Waste Recovery Center**.

2. **Autonomous Route Optimizer (Dijkstra + TSP Algorithm)**:
   - Uses graph theory algorithms (Dijkstra's Min-Heap & TSP 2-Opt) on spherical Haversine distances to compute the shortest possible collection route.
   - Calculates distance (km), travel duration (mins), diesel fuel saved (L), and CO2 emission offsets (kg).

3. **Smart Dustbin Hardware Diagnostics**:
   - Simulates and inspects live ESP32 microcontroller telemetry, HC-SR04 ultrasonic distance sensors (cm), HX711 weight load cells (kg), MQ-135 air quality sensors (PPM), and ESP32-CAM vision modules.

4. **AI Waste Sorting Classifier**:
   - Classifies recyclable items (PET Plastic, Organic Food Scraps, Paper/Cardboard, E-Waste, and Hazardous Waste) and assigns them to specific target smart bins.

5. **Citizen Reporting Portal**:
   - Allows citizens to submit public overflow tickets with location details.

---

## 🚀 Quick Start Guide (How to Run)

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.  
You can download Python from: [https://www.python.org/downloads/](https://www.python.org/downloads/)  
*(Make sure to check the box **"Add Python to PATH"** during installation).*

### 2. Clone or Download the Repository
```bash
git clone https://github.com/YOUR_USERNAME/smart_waste_system.git
cd smart_waste_system
```

### 3. Install Dependencies
Open your terminal (Command Prompt, PowerShell, or Bash) and run:
```bash
pip install -r requirements.txt
```

### 4. Start the Application
```bash
python run.py
```

### 5. Open in Web Browser
Open your browser and navigate to:  
👉 **`http://127.0.0.1:5000`**

---

## 📁 Project Directory Structure

```text
smart_waste_system/
├── app.py                      # Root Application Launcher
├── run.py                      # Main Server Execution Entrypoint
├── requirements.txt            # Python Dependencies (Flask, CORS, Pillow)
├── waste_management.db         # SQLite Relational Database
├── .gitignore                  # Git Ignore Configuration
├── README.md                   # Project Documentation
│
├── backend/                    # Python Backend Layer
│   ├── __init__.py             # Package Initializer
│   ├── app.py                  # Flask REST API Controller & Routes
│   ├── database.py             # SQLite DB Schema & Telemetry Operations
│   ├── dsa_router.py           # Dijkstra & TSP Shortest Path Algorithm Engine
│   └── ai_classifier.py        # AI Computer Vision Classifier Engine
│
└── frontend/                   # Web Dashboard UI Layer
    ├── index.html              # Dashboard HTML Markup
    ├── styles.css              # Glassmorphic Dark-Mode CSS System
    └── app.js                  # Dynamic Leaflet Map & Telemetry Sync Logic
```

---

## 🛠️ Technology Stack

- **Backend**: Python 3, Flask, SQLite3
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphic Dark Theme), JavaScript (ES6+), Leaflet.js, Chart.js
- **Algorithms**: Dijkstra Shortest Path (Min-Heap Priority Queue), TSP 2-Opt Heuristic, Haversine Geographic Distance Matrix
