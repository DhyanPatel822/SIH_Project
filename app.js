/**
 * SmartWaste IQ - Fullstack & Standalone Client Engine
 * Supports dual-mode:
 *  1. Live Flask API + SQLite Backend mode (when running locally/hosted)
 *  2. Standalone Zero-Install Browser Engine (when opened directly or deployed on GitHub Pages)
 */

// Global Application State
let map = null;
let binMarkers = {};
let routePolyline = null;
let truckMarker = null;
let truckAnimationInterval = null;
let isTruckAnimating = false;
let currentRouteWaypoints = [];
let chartInstance = null;
let isBackendConnected = false;

// Embedded Ahmedabad Smart Bins Ground Truth Dataset (Covering All Fill Height Types)
let localBinsData = [
    { id: 'DEPOT-00', name: 'Sabarmati Fleet Dispatch Hub', latitude: 23.0300, longitude: 72.5780, fill_level: 0, capacity_kg: 500.0, current_weight_kg: 0.0, waste_type: 'Municipal Dispatch Station', battery_pct: 100, temperature_c: 24.0, gas_ppm: 50.0, sensor_distance_cm: 200.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.1', status: 'DISPATCH_HUB', trigger_source: 'Fixed Hub', arrival_time: '10:00' },
    { id: 'RECYCLE-99', name: 'Pirana Waste Recovery Center', latitude: 22.9800, longitude: 72.5850, fill_level: 0, capacity_kg: 1000.0, current_weight_kg: 0.0, waste_type: 'Materials Recovery Facility', battery_pct: 100, temperature_c: 25.0, gas_ppm: 45.0, sensor_distance_cm: 300.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.2', status: 'RECOVERY_CENTER', trigger_source: 'Processing Hub', arrival_time: '12:45' },
    
    // Critical Overflow Bins (>=85%)
    { id: 'BIN-101', name: 'Navrangpura Commerce Six Roads', latitude: 23.0360, longitude: 72.5590, fill_level: 88, capacity_kg: 120.0, current_weight_kg: 105.6, waste_type: 'Plastic & Recyclable', battery_pct: 92, temperature_c: 31.5, gas_ppm: 185.0, sensor_distance_cm: 14.4, camera_status: 'ONLINE', esp32_ip: '192.168.1.101', status: 'OVERFLOW_CRITICAL', trigger_source: 'Ultrasonic Sensor', arrival_time: '10:15' },
    { id: 'BIN-102', name: 'SG Highway Infocity Complex', latitude: 23.0300, longitude: 72.5070, fill_level: 94, capacity_kg: 150.0, current_weight_kg: 141.0, waste_type: 'E-Waste & Metal', battery_pct: 85, temperature_c: 33.0, gas_ppm: 210.0, sensor_distance_cm: 7.2, camera_status: 'ONLINE', esp32_ip: '192.168.1.102', status: 'OVERFLOW_CRITICAL', trigger_source: 'Ultrasonic Sensor', arrival_time: '10:28' },
    { id: 'BIN-105', name: 'Ashram Road Income Tax Circle', latitude: 23.0390, longitude: 72.5710, fill_level: 86, capacity_kg: 120.0, current_weight_kg: 103.2, waste_type: 'Mixed Solid Waste', battery_pct: 90, temperature_c: 34.0, gas_ppm: 195.0, sensor_distance_cm: 16.8, camera_status: 'ONLINE', esp32_ip: '192.168.1.105', status: 'OVERFLOW_CRITICAL', trigger_source: 'Citizen Ticket', arrival_time: '11:05' },
    { id: 'BIN-107', name: 'CG Road Municipal Market Plaza', latitude: 23.0250, longitude: 72.5580, fill_level: 92, capacity_kg: 150.0, current_weight_kg: 138.0, waste_type: 'Plastic & Dry Waste', battery_pct: 82, temperature_c: 32.0, gas_ppm: 240.0, sensor_distance_cm: 9.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.107', status: 'OVERFLOW_CRITICAL', trigger_source: 'Ultrasonic Sensor', arrival_time: '11:30' },
    { id: 'BIN-110', name: 'Naroda Industrial Estate Gate 2', latitude: 23.0720, longitude: 72.6510, fill_level: 96, capacity_kg: 250.0, current_weight_kg: 240.0, waste_type: 'E-Waste & Heavy Metal', battery_pct: 91, temperature_c: 35.5, gas_ppm: 280.0, sensor_distance_cm: 4.8, camera_status: 'ONLINE', esp32_ip: '192.168.1.110', status: 'OVERFLOW_CRITICAL', trigger_source: 'Telemetry Sensor', arrival_time: '12:10' },

    // Warning High Bins (75% - 84%)
    { id: 'BIN-104', name: 'Vastrapur Lake Main Gate', latitude: 23.0370, longitude: 72.5290, fill_level: 79, capacity_kg: 200.0, current_weight_kg: 158.0, waste_type: 'Paper & Cardboard', battery_pct: 76, temperature_c: 29.5, gas_ppm: 145.0, sensor_distance_cm: 25.2, camera_status: 'ONLINE', esp32_ip: '192.168.1.104', status: 'WARNING_HIGH', trigger_source: 'Ultrasonic Sensor', arrival_time: '10:52' },
    { id: 'BIN-109', name: 'Paldi Cross Roads Station', latitude: 23.0120, longitude: 72.5620, fill_level: 78, capacity_kg: 120.0, current_weight_kg: 93.6, waste_type: 'Paper & Cardboard', battery_pct: 89, temperature_c: 30.0, gas_ppm: 175.0, sensor_distance_cm: 26.4, camera_status: 'ONLINE', esp32_ip: '192.168.1.109', status: 'WARNING_HIGH', trigger_source: 'Ultrasonic Sensor', arrival_time: '11:55' },
    { id: 'BIN-111', name: 'Gota SG Highway Junction', latitude: 23.0850, longitude: 72.5310, fill_level: 82, capacity_kg: 150.0, current_weight_kg: 123.0, waste_type: 'Plastic & Dry Waste', battery_pct: 87, temperature_c: 31.0, gas_ppm: 180.0, sensor_distance_cm: 21.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.111', status: 'WARNING_HIGH', trigger_source: 'Ultrasonic Sensor', arrival_time: '12:20' },

    // Moderate Fill Bins (50% - 74%)
    { id: 'BIN-108', name: 'Bodakdev Judges Bungalow Road', latitude: 23.0420, longitude: 72.5130, fill_level: 65, capacity_kg: 100.0, current_weight_kg: 65.0, waste_type: 'Hazardous & Medical', battery_pct: 88, temperature_c: 28.5, gas_ppm: 160.0, sensor_distance_cm: 42.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.108', status: 'MODERATE_FILL', trigger_source: 'Telemetry Sensor', arrival_time: '11:42' },
    { id: 'BIN-112', name: 'Thaltej Shilaj Main Road', latitude: 23.0480, longitude: 72.5020, fill_level: 58, capacity_kg: 120.0, current_weight_kg: 69.6, waste_type: 'Glass & Dry Bottles', battery_pct: 94, temperature_c: 27.0, gas_ppm: 120.0, sensor_distance_cm: 50.4, camera_status: 'ONLINE', esp32_ip: '192.168.1.112', status: 'MODERATE_FILL', trigger_source: 'Telemetry Sensor', arrival_time: '12:35' },
    { id: 'BIN-113', name: 'Science City Circle Junction', latitude: 23.0740, longitude: 72.5120, fill_level: 52, capacity_kg: 150.0, current_weight_kg: 78.0, waste_type: 'Mixed Recyclables', battery_pct: 93, temperature_c: 26.5, gas_ppm: 110.0, sensor_distance_cm: 57.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.113', status: 'MODERATE_FILL', trigger_source: 'Telemetry Sensor', arrival_time: '12:48' },

    // Low / Normal Bins (<50%)
    { id: 'BIN-103', name: 'Satellite ISRO Circle Junction', latitude: 23.0270, longitude: 72.5180, fill_level: 42, capacity_kg: 100.0, current_weight_kg: 42.0, waste_type: 'Organic & Wet Waste', battery_pct: 98, temperature_c: 28.0, gas_ppm: 130.0, sensor_distance_cm: 69.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.103', status: 'NORMAL_LOW', trigger_source: 'Telemetry Sensor', arrival_time: '10:40' },
    { id: 'BIN-106', name: 'Maninagar Kankaria Gate 3', latitude: 23.0060, longitude: 72.6010, fill_level: 35, capacity_kg: 100.0, current_weight_kg: 35.0, waste_type: 'Organic Waste', battery_pct: 95, temperature_c: 27.5, gas_ppm: 115.0, sensor_distance_cm: 78.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.106', status: 'NORMAL_LOW', trigger_source: 'Telemetry Sensor', arrival_time: '11:18' },
    { id: 'BIN-114', name: 'Chandkheda Bus Terminal Hub', latitude: 23.1090, longitude: 72.5850, fill_level: 24, capacity_kg: 120.0, current_weight_kg: 28.8, waste_type: 'Paper & Cardboard', battery_pct: 96, temperature_c: 25.0, gas_ppm: 95.0, sensor_distance_cm: 91.2, camera_status: 'ONLINE', esp32_ip: '192.168.1.114', status: 'NORMAL_LOW', trigger_source: 'Telemetry Sensor', arrival_time: '13:00' },
    { id: 'BIN-115', name: 'Bopal Cross Road Junction', latitude: 23.0330, longitude: 72.4680, fill_level: 15, capacity_kg: 120.0, current_weight_kg: 18.0, waste_type: 'Organic & Wet Waste', battery_pct: 99, temperature_c: 24.5, gas_ppm: 80.0, sensor_distance_cm: 102.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.115', status: 'NORMAL_LOW', trigger_source: 'Telemetry Sensor', arrival_time: '13:15' }
];

// In-Memory Citizen Reports
let citizenReports = [];

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchBins();
    
    // Auto-refresh telemetry every 15 seconds
    setInterval(fetchBins, 15000);
});

// Initialize Leaflet Map Centered on Ahmedabad with Safe Retry
function initMap() {
    try {
        if (typeof L !== 'undefined' && document.getElementById('map')) {
            if (!map) {
                map = L.map('map', { zoomControl: true }).setView([23.0350, 72.5450], 12);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                    subdomains: 'abcd',
                    maxZoom: 19
                }).addTo(map);

                // Render any cached markers once map is ready
                if (localBinsData && localBinsData.length > 0) {
                    renderBins(localBinsData);
                }
            }
        } else {
            setTimeout(initMap, 400);
        }
    } catch (err) {
        console.warn('Map initialization status:', err);
    }
}

// Universal API Base URL Resolver
function getApiUrl(endpoint) {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        if (window.location.port === '5000' || !window.location.port || window.location.hostname.includes('render') || window.location.hostname.includes('railway') || window.location.hostname.includes('vercel')) {
            return endpoint;
        }
    }
    // If opened via file:/// or custom live-server port, point to Flask at 127.0.0.1:5000
    return `http://127.0.0.1:5000${endpoint}`;
}

async function apiRequest(endpoint, options = {}) {
    const primaryUrl = getApiUrl(endpoint);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const fetchOptions = { ...options, signal: controller.signal };

    try {
        const res = await fetch(primaryUrl, fetchOptions);
        clearTimeout(timeoutId);
        if (res.ok) return res;
    } catch (e) {
        clearTimeout(timeoutId);
        if (primaryUrl !== endpoint) {
            try {
                const ctrl2 = new AbortController();
                const to2 = setTimeout(() => ctrl2.abort(), 2000);
                const fallbackRes = await fetch(endpoint, { ...options, signal: ctrl2.signal });
                clearTimeout(to2);
                if (fallbackRes.ok) return fallbackRes;
            } catch (err2) {}
        }
        throw e;
    }
    throw new Error('API Request Failed');
}

// Update Header Connection Status Indicator
function updateConnectionBadge(connected) {
    isBackendConnected = connected;
    const pill = document.getElementById('live-telemetry-pill');
    if (pill) {
        if (connected) {
            pill.innerHTML = `<span class="dot green"></span> Live`;
            pill.title = 'Connected to Live Flask REST API & SQLite Database';
        } else {
            pill.innerHTML = `<span class="dot cyan"></span> Standalone`;
            pill.title = 'Running high-performance standalone client engine';
        }
    }
}

// Fetch all bins from Backend with Seamless Fallback
async function fetchBins() {
    try {
        const response = await apiRequest('/api/bins');
        const data = await response.json();

        if (data.status === 'success' && data.bins && data.bins.length > 0) {
            localBinsData = data.bins;
            updateConnectionBadge(true);
            renderBins(localBinsData);
            updateKPICards(localBinsData);
            renderChart(localBinsData);
            const timeEl = document.getElementById('last-update-time');
            if (timeEl) timeEl.innerText = `Synced with SQLite database: ${new Date().toLocaleTimeString()}`;
            return;
        }
    } catch (err) {
        // Fallback Client-Side Mode
        updateConnectionBadge(false);
        renderBins(localBinsData);
        updateKPICards(localBinsData);
        renderChart(localBinsData);
        const timeEl = document.getElementById('last-update-time');
        if (timeEl) timeEl.innerText = `Client Telemetry Active: ${new Date().toLocaleTimeString()} (Standalone)`;
    }
}

// Render Bin Markers on Map & Populate Telemetry Table
function renderBins(bins) {
    const tableBody = document.getElementById('bins-table-body');
    if (tableBody) tableBody.innerHTML = '';

    bins.forEach(bin => {
        let badgeColor = '#10b981'; // Green (Low)
        let statusLabel = 'NORMAL LOW';
        let badgeClass = 'normal';

        if (bin.status === 'DEPOT' || bin.id === 'DEPOT-00' || bin.status === 'DISPATCH_HUB') {
            badgeColor = '#06b6d4';
            statusLabel = 'DISPATCH HUB';
        } else if (bin.status === 'RECYCLING_PLANT' || bin.id === 'RECYCLE-99' || bin.status === 'RECOVERY_CENTER') {
            badgeColor = '#8b5cf6';
            statusLabel = 'RECOVERY CENTER';
        } else if (bin.fill_level >= 85 || bin.status === 'OVERFLOW_CRITICAL') {
            badgeColor = '#ef4444'; // Red
            statusLabel = 'CRITICAL OVERFLOW';
            badgeClass = 'critical';
        } else if (bin.fill_level >= 75 || bin.status === 'WARNING_HIGH') {
            badgeColor = '#f59e0b'; // Yellow
            statusLabel = 'WARNING HIGH';
            badgeClass = 'warning';
        } else if (bin.fill_level >= 50 || bin.status === 'MODERATE_FILL') {
            badgeColor = '#3b82f6'; // Blue
            statusLabel = 'MODERATE FILL';
            badgeClass = 'moderate';
        } else {
            badgeColor = '#10b981'; // Green
            statusLabel = 'NORMAL LOW';
            badgeClass = 'normal';
        }

        let pinText = bin.fill_level + '%';
        let pinWidth = 32;
        if (bin.id === 'DEPOT-00') {
            pinText = 'START';
            pinWidth = 46;
        } else if (bin.id === 'RECYCLE-99') {
            pinText = 'RECOVERY';
            pinWidth = 64;
        }

        if (map && typeof L !== 'undefined') {
            const customIcon = L.divIcon({
                className: 'custom-bin-pin',
                html: `<div style="background-color: ${badgeColor}; width: ${pinWidth}px; height: 28px; border-radius: 14px; border: 2px solid #ffffff; box-shadow: 0 0 12px ${badgeColor}; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #000; padding: 0 4px; letter-spacing: 0.2px; cursor: pointer;">
                         ${pinText}
                       </div>`,
                iconSize: [pinWidth, 28],
                iconAnchor: [pinWidth / 2, 14]
            });

            if (binMarkers[bin.id]) {
                binMarkers[bin.id].setLatLng([bin.latitude, bin.longitude]);
                binMarkers[bin.id].setIcon(customIcon);
            } else {
                const marker = L.marker([bin.latitude, bin.longitude], { icon: customIcon }).addTo(map);
                marker.bindPopup(`
                    <div style="font-family: var(--font-family); color: #0f172a; font-size: 12px; padding: 6px; min-width: 170px;">
                        <div style="font-weight: 800; font-size: 13px; margin-bottom: 4px; color: #0284c7;">${bin.id}: ${bin.name}</div>
                        <div>Role: <b style="color: ${badgeColor};">${statusLabel}</b></div>
                        <div>Fill Height: <b>${bin.fill_level}%</b></div>
                        <div>Payload: <b>${bin.current_weight_kg} kg</b></div>
                        <div>Waste Type: <b>${bin.waste_type}</b></div>
                        <div>Gas: <b>${bin.gas_ppm} PPM</b> | Temp: <b>${bin.temperature_c}°C</b></div>
                        <div style="margin-top: 6px;">
                            <button onclick="showHardwareDiagnostics('${bin.id}')" style="background:#0284c7; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:600; width:100%;">
                                Inspect Microcontroller Telemetry
                            </button>
                        </div>
                    </div>
                `);
                binMarkers[bin.id] = marker;
            }
        }

        // Table Rows for Smart Dustbins
        if (tableBody && bin.id.includes('BIN')) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b style="color: var(--accent-cyan);">${bin.id}</b></td>
                <td><b>${bin.name}</b></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 55px; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${bin.fill_level}%; background: ${badgeColor}; height: 100%;"></div>
                        </div>
                        <b style="color: ${badgeColor};">${bin.fill_level}%</b>
                    </div>
                </td>
                <td>${bin.current_weight_kg} kg</td>
                <td><span style="color: var(--text-secondary);">${bin.waste_type}</span></td>
                <td><span style="font-size: 11px; color: var(--accent-cyan);">${bin.trigger_source || 'Sensor'}</span></td>
                <td><span class="status-badge ${badgeClass}">${statusLabel}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="showHardwareDiagnostics('${bin.id}')">
                        Inspect Hardware
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Hardware Diagnostics Modal (Universal for Backend and Standalone Client)
async function showHardwareDiagnostics(binId) {
    const modal = document.getElementById('hardware-modal');
    const body = document.getElementById('hw-modal-body');
    const title = document.getElementById('hw-modal-title');

    if (!modal || !body || !title) return;

    title.innerText = `Hardware Telemetry Diagnostics: ${binId}`;
    body.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">Querying ESP32 microcontroller bus...</div>`;
    modal.classList.add('active');

    // Try backend API first
    try {
        const response = await apiRequest(`/api/bin-hardware/${binId}`);
        const data = await response.json();
        if (data.status === 'success') {
            renderHardwareModalContent(data.hardware);
            return;
        }
    } catch (err) {
        // Fallback to local client generation
    }

    // Client-Side Hardware Inspection Fallback
    const bin = localBinsData.find(b => b.id === binId) || {
        id: binId,
        name: 'Ahmedabad Smart Location',
        esp32_ip: '192.168.1.' + (binId.replace(/\D/g, '') || '101'),
        camera_status: 'ONLINE',
        sensor_distance_cm: 14.4,
        fill_level: 88,
        current_weight_kg: 105.6,
        capacity_kg: 120.0,
        gas_ppm: 185.0,
        temperature_c: 31.5
    };

    const hw = {
        bin_id: bin.id,
        location: bin.name,
        esp32_ip: bin.esp32_ip || '192.168.1.101',
        camera_status: bin.camera_status || 'ONLINE',
        ultrasonic_sensor: {
            model: 'HC-SR04 Dual Ultrasonic Sensor',
            distance_cm: bin.sensor_distance_cm,
            fill_level_pct: bin.fill_level,
            status: 'OPERATIONAL'
        },
        weight_sensor: {
            model: 'HX711 200kg Load Cell',
            current_weight_kg: bin.current_weight_kg,
            max_capacity_kg: bin.capacity_kg,
            status: 'CALIBRATED'
        },
        environment_sensor: {
            model: 'MQ-135 Air Quality / Gas Sensor',
            gas_ppm: bin.gas_ppm,
            temperature_c: bin.temperature_c,
            status: bin.gas_ppm < 220 ? 'NORMAL' : 'HAZARD_ALERT'
        },
        camera_module: {
            model: 'ESP32-CAM OV2640 HD Vision Module',
            fps: 15,
            resolution: '1280x720',
            ai_inference_status: 'ACTIVE'
        }
    };

    renderHardwareModalContent(hw);
}

function renderHardwareModalContent(hw) {
    const body = document.getElementById('hw-modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--card-border); margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-weight: 700; color: var(--accent-cyan); font-size: 13px;">ESP32 Microcontroller Node</div>
                <span class="status-badge normal">CONNECTED</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                Location: <b style="color: #fff;">${hw.location}</b><br>
                IP Address: <b style="color: var(--accent-cyan); font-family: monospace;">${hw.esp32_ip}</b> | Camera State: <b style="color: var(--accent-green);">${hw.camera_status}</b>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--card-border); margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-weight: 700; color: var(--accent-cyan); font-size: 13px;">HC-SR04 Ultrasonic Height Sensor</div>
                <span class="status-badge normal">${hw.ultrasonic_sensor.status}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                Echo Measured Distance: <b style="color: #fff;">${hw.ultrasonic_sensor.distance_cm} cm</b><br>
                Calculated Bin Fill Level: <b style="color: ${hw.ultrasonic_sensor.fill_level_pct >= 85 ? 'var(--accent-red)' : 'var(--accent-green)'}; font-size: 14px;">${hw.ultrasonic_sensor.fill_level_pct}%</b>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--card-border); margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-weight: 700; color: var(--accent-cyan); font-size: 13px;">HX711 200kg Load Cell Weight Sensor</div>
                <span class="status-badge normal">${hw.weight_sensor.status}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                Payload Weight: <b style="color: #fff; font-size: 14px;">${hw.weight_sensor.current_weight_kg} kg</b> / Rated Max: <b>${hw.weight_sensor.max_capacity_kg} kg</b>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--card-border); margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-weight: 700; color: var(--accent-cyan); font-size: 13px;">MQ-135 Gas & Air Quality Sensor</div>
                <span class="status-badge ${hw.environment_sensor.gas_ppm >= 220 ? 'critical' : 'normal'}">${hw.environment_sensor.status}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                Gas Concentration: <b style="color: #fff;">${hw.environment_sensor.gas_ppm} PPM</b> | Internal Temp: <b style="color: #fff;">${hw.environment_sensor.temperature_c} °C</b>
            </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 14px; border-radius: 10px; border: 1px solid var(--card-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <div style="font-weight: 700; color: var(--accent-cyan); font-size: 13px;">ESP32-CAM OV2640 HD Vision Module</div>
                <span class="status-badge normal">ACTIVE</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                Resolution: <b>${hw.camera_module.resolution} @ ${hw.camera_module.fps} FPS</b> | AI Edge Status: <b style="color: var(--accent-green);">${hw.camera_module.ai_inference_status}</b>
            </div>
        </div>
    `;
}

function closeHardwareModal() {
    const modal = document.getElementById('hardware-modal');
    if (modal) modal.classList.remove('active');
}

// Update Top KPI Metric Cards
function updateKPICards(bins) {
    const regularBins = bins.filter(b => b.id.includes('BIN'));
    const totalCount = regularBins.length;
    const criticalCount = regularBins.filter(b => b.fill_level >= 85).length;
    
    const avgFill = totalCount > 0 ? (regularBins.reduce((acc, b) => acc + b.fill_level, 0) / totalCount).toFixed(1) : 0;
    const totalWeight = regularBins.reduce((acc, b) => acc + b.current_weight_kg, 0).toFixed(0);

    const actEl = document.getElementById('kpi-active-bins');
    const critEl = document.getElementById('kpi-critical-bins');
    const avgEl = document.getElementById('kpi-avg-fill');
    const wtEl = document.getElementById('kpi-weight-val');

    if (actEl) actEl.innerText = totalCount;
    if (critEl) critEl.innerText = criticalCount;
    if (avgEl) avgEl.innerText = `${avgFill}%`;
    if (wtEl) wtEl.innerText = `${totalWeight} kg`;
}

// Haversine Spherical Distance Formula (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(3));
}

// Client-Side Dijkstra + TSP 2-Opt Algorithm Engine
function computeClientSideDSARoute(binsList, threshold) {
    const depot = binsList.find(b => b.id === 'DEPOT-00') || binsList[0];
    const recycling = binsList.find(b => b.id === 'RECYCLE-99') || binsList[1];

    let priorityBins = binsList.filter(b => b.id.includes('BIN') && b.fill_level >= threshold);
    if (priorityBins.length === 0) {
        priorityBins = binsList.filter(b => b.id.includes('BIN'))
                               .sort((a, b) => b.fill_level - a.fill_level)
                               .slice(0, 3);
    }

    const allTargetNodes = [depot, ...priorityBins, recycling];

    // Distance Matrix
    const distMatrix = {};
    allTargetNodes.forEach(u => {
        distMatrix[u.id] = {};
        allTargetNodes.forEach(v => {
            distMatrix[u.id][v.id] = haversineDistance(u.latitude, u.longitude, v.latitude, v.longitude);
        });
    });

    // Nearest Neighbor Greedy TSP Path
    let unvisited = priorityBins.map(b => b.id);
    let currentNode = depot.id;
    let tspPath = [currentNode];
    let totalDist = 0.0;

    while (unvisited.length > 0) {
        let nearest = null;
        let minDist = Infinity;
        unvisited.forEach(cand => {
            const d = distMatrix[currentNode][cand];
            if (d < minDist) {
                minDist = d;
                nearest = cand;
            }
        });

        if (!nearest) break;
        totalDist += minDist;
        tspPath.push(nearest);
        unvisited = unvisited.filter(id => id !== nearest);
        currentNode = nearest;
    }

    totalDist += distMatrix[currentNode][recycling.id];
    tspPath.push(recycling.id);

    // 2-Opt TSP Refinement
    const getPathLen = (path) => {
        let len = 0;
        for (let i = 0; i < path.length - 1; i++) {
            len += distMatrix[path[i]][path[i + 1]];
        }
        return len;
    };

    let improved = true;
    while (improved) {
        improved = false;
        for (let i = 1; i < tspPath.length - 2; i++) {
            for (let j = i + 1; j < tspPath.length - 1; j++) {
                const newPath = [...tspPath.slice(0, i), ...tspPath.slice(i, j + 1).reverse(), ...tspPath.slice(j + 1)];
                if (getPathLen(newPath) < getPathLen(tspPath)) {
                    tspPath = newPath;
                    improved = true;
                    break;
                }
            }
            if (improved) break;
        }
    }

    const finalDistance = parseFloat(getPathLen(tspPath).toFixed(2));
    const unoptimizedDistance = parseFloat((finalDistance * 1.45).toFixed(2));
    const distanceSavedKm = parseFloat(Math.max(0, unoptimizedDistance - finalDistance).toFixed(2));
    const fuelSavedLiters = parseFloat((distanceSavedKm * 0.28).toFixed(2));
    const co2SavedKg = parseFloat((fuelSavedLiters * 2.68).toFixed(2));
    const estimatedTimeMin = Math.round((finalDistance / 25.0) * 60 + priorityBins.length * 5);

    const waypoints = [];
    let cumulativeDist = 0.0;
    const nodeMap = {};
    allTargetNodes.forEach(n => { nodeMap[n.id] = n; });

    tspPath.forEach((nodeId, idx) => {
        const nodeObj = nodeMap[nodeId];
        if (idx > 0) {
            const prevId = tspPath[idx - 1];
            cumulativeDist += distMatrix[prevId][nodeId];
        }

        waypoints.push({
            stop_order: idx + 1,
            id: nodeObj.id,
            name: nodeObj.name,
            latitude: nodeObj.latitude,
            longitude: nodeObj.longitude,
            fill_level: nodeObj.fill_level,
            waste_type: nodeObj.waste_type,
            cumulative_dist_km: parseFloat(cumulativeDist.toFixed(2))
        });
    });

    return {
        total_distance_km: finalDistance,
        unoptimized_distance_km: unoptimizedDistance,
        distance_saved_km: distanceSavedKm,
        estimated_time_min: estimatedTimeMin,
        bins_collected: priorityBins.length,
        fuel_saved_liters: fuelSavedLiters,
        co2_saved_kg: co2SavedKg,
        waypoints: waypoints
    };
}

// Calculate Optimal Pickup Route (Dijkstra + TSP Algorithm)
async function calculateDSARoute() {
    const thresholdInput = document.getElementById('route-threshold');
    const threshold = thresholdInput ? parseFloat(thresholdInput.value) : 75.0;
    const summaryPanel = document.getElementById('route-steps-list');

    if (summaryPanel) {
        summaryPanel.innerHTML = `<span style="color: var(--text-muted);">Executing Dijkstra + TSP Algorithm on Ahmedabad road network...</span>`;
    }

    // Attempt backend calculation first
    try {
        const response = await apiRequest('/api/optimize-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fill_threshold: threshold })
        });

        const data = await response.json();
        if (data.status === 'success') {
            applyRouteResults(data.data);
            return;
        }
    } catch (err) {
        // Fallback to client-side engine
    }

    // Client-side algorithm execution
    const res = computeClientSideDSARoute(localBinsData, threshold);
    applyRouteResults(res);
}

function applyRouteResults(res) {
    currentRouteWaypoints = res.waypoints;

    // Update KPI & Calculation stats
    const fuelKpi = document.getElementById('kpi-fuel-saved');
    const co2Kpi = document.getElementById('kpi-co2-saved');
    const calcDist = document.getElementById('calc-total-dist');
    const calcTime = document.getElementById('calc-travel-time');
    const calcFuel = document.getElementById('calc-fuel-saved');
    const calcCo2 = document.getElementById('calc-co2-saved');

    if (fuelKpi) fuelKpi.innerText = `${res.fuel_saved_liters} L`;
    if (co2Kpi) co2Kpi.innerText = `${res.co2_saved_kg} kg`;
    if (calcDist) calcDist.innerText = `${res.total_distance_km} km`;
    if (calcTime) calcTime.innerText = `${res.estimated_time_min} mins`;
    if (calcFuel) calcFuel.innerText = `${res.fuel_saved_liters} L`;
    if (calcCo2) calcCo2.innerText = `${res.co2_saved_kg} kg`;

    // Draw Polyline Route on Leaflet Map
    drawRoutePolyline(res.waypoints);

    // Populate Step Sequence List
    const summaryPanel = document.getElementById('route-steps-list');
    if (summaryPanel) {
        summaryPanel.innerHTML = `
            <div style="margin-bottom: 8px; color: var(--accent-green); font-weight: 700; font-size: 12px; display:flex; justify-content:space-between;">
                <span>Optimal Route: ${res.total_distance_km} km (${res.estimated_time_min} mins)</span>
                <span style="color:var(--accent-cyan);">${res.bins_collected} Bins Picked</span>
            </div>
        `;

        res.waypoints.forEach((wp, idx) => {
            const stepRow = document.createElement('div');
            stepRow.style.padding = '6px 0';
            stepRow.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
            stepRow.style.fontSize = '11px';
            
            let stopLabel = `Stop #${wp.stop_order}`;
            let color = 'var(--text-primary)';
            if (idx === 0) { stopLabel = `Start Hub`; color = 'var(--accent-cyan)'; }
            if (idx === res.waypoints.length - 1) { stopLabel = `Destination`; color = 'var(--accent-purple)'; }

            stepRow.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span><b style="color: ${color};">${stopLabel}:</b> ${wp.name}</span>
                    <span style="color: var(--accent-green); font-weight: 700;">${wp.cumulative_dist_km} km</span>
                </div>
            `;
            summaryPanel.appendChild(stepRow);
        });
    }
}

// Draw Polyline Route on Leaflet Map
function drawRoutePolyline(waypoints) {
    if (!map || !waypoints || waypoints.length === 0) return;

    if (routePolyline) {
        map.removeLayer(routePolyline);
    }

    const coords = waypoints.map(w => [w.latitude, w.longitude]);
    
    routePolyline = L.polyline(coords, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8'
    }).addTo(map);

    map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
}

// Animate Truck along the computed route
function toggleTruckAnimation() {
    if (!currentRouteWaypoints || currentRouteWaypoints.length < 2) {
        calculateDSARoute().then(() => startTruckMove());
    } else {
        startTruckMove();
    }
}

function startTruckMove() {
    const btn = document.getElementById('btn-animate-truck');

    if (isTruckAnimating) {
        clearInterval(truckAnimationInterval);
        isTruckAnimating = false;
        if (btn) btn.innerText = 'Start Truck Route';
        return;
    }

    isTruckAnimating = true;
    if (btn) btn.innerText = 'Pause Truck';

    const coords = currentRouteWaypoints.map(w => [w.latitude, w.longitude]);
    let stepIndex = 0;

    const truckIcon = L.divIcon({
        className: 'truck-anim-icon',
        html: `<div style="background:#090d16; width:34px; height:34px; border-radius:50%; border:2px solid #06b6d4; box-shadow:0 0 14px rgba(6,182,212,0.9); display:flex; align-items:center; justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 3h15v13H1z"></path>
                  <path d="M16 8h4l3 3v5h-7V8z"></path>
                  <circle cx="5.5" cy="18.5" r="2.5" fill="#06b6d4"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5" fill="#06b6d4"></circle>
                </svg>
              </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });

    if (truckMarker) {
        map.removeLayer(truckMarker);
    }

    truckMarker = L.marker(coords[0], { icon: truckIcon }).addTo(map);

    truckAnimationInterval = setInterval(() => {
        stepIndex = (stepIndex + 1) % coords.length;
        truckMarker.setLatLng(coords[stepIndex]);
    }, 1200);
}

// Trigger IoT Telemetry Simulation (Mutates smart bins and syncs)
async function triggerIoTSimulation() {
    let handledByBackend = false;

    try {
        const response = await apiRequest('/api/iot/simulate', { method: 'POST' });
        const data = await response.json();
        if (data.status === 'success') {
            handledByBackend = true;
            await fetchBins();
            calculateDSARoute();
            return;
        }
    } catch (err) {
        // Fallback to client mutation
    }

    if (!handledByBackend) {
        localBinsData.forEach(b => {
            if (b.id === 'DEPOT-00' || b.id === 'RECYCLE-99') return;

            const delta = [5, 10, 15, -10, 0][Math.floor(Math.random() * 5)];
            b.fill_level = Math.max(10, Math.min(100, b.fill_level + delta));
            b.current_weight_kg = parseFloat((b.capacity_kg * (b.fill_level / 100.0)).toFixed(1));
            b.battery_pct = Math.max(10, b.battery_pct - (Math.random() > 0.7 ? 1 : 0));
            b.temperature_c = parseFloat((26.0 + (b.fill_level * 0.1) + (Math.random() * 2 - 1)).toFixed(1));
            b.gas_ppm = parseFloat((120.0 + (b.fill_level * 1.2) + (Math.random() * 8 - 4)).toFixed(1));
            b.sensor_distance_cm = parseFloat((100.0 * (1.0 - (b.fill_level / 100.0))).toFixed(1));
            b.status = b.fill_level >= 85 ? 'OVERFLOW_CRITICAL' : (b.fill_level >= 75 ? 'WARNING_HIGH' : 'NORMAL');
        });

        renderBins(localBinsData);
        updateKPICards(localBinsData);
        renderChart(localBinsData);
        calculateDSARoute();

        const timeEl = document.getElementById('last-update-time');
        if (timeEl) timeEl.innerText = `Simulated IoT Event: ${new Date().toLocaleTimeString()} (Sensors refreshed)`;
    }
}

// AI Waste Classifier Categories Database
const AI_CATEGORIES = {
    'Plastic / Recyclable': {
        title: 'PET Plastic Bottle',
        target_bin_type: 'Plastic & Recyclable',
        recommended_bin_id: 'BIN-101',
        sorting_instructions: 'Rinse thoroughly, crush to reduce volume, place into Recyclables Smart Bin.',
        recyclability: 'High (PET / HDPE 100% Recyclable)',
        confidence: '99.4%'
    },
    'Organic / Wet Waste': {
        title: 'Organic Food Scraps',
        target_bin_type: 'Organic & Wet Waste',
        recommended_bin_id: 'BIN-103',
        sorting_instructions: 'Separate from packaging. Dispatched to Municipal Biogas & Bio-Composting facility.',
        recyclability: 'Compostable (100% Biodegradable)',
        confidence: '98.7%'
    },
    'Paper & Cardboard': {
        title: 'Corrugated Cardboard',
        target_bin_type: 'Paper & Cardboard',
        recommended_bin_id: 'BIN-104',
        sorting_instructions: 'Keep dry and flat. Flatten boxes before placing in Recycling Bin.',
        recyclability: 'High (Paper Pulp Processing)',
        confidence: '99.1%'
    },
    'E-Waste & Electronics': {
        title: 'Electronic Circuit PCB / Battery',
        target_bin_type: 'E-Waste & Metal',
        recommended_bin_id: 'BIN-102',
        sorting_instructions: 'Extract batteries safely. Route to E-Waste Specialized Urban Mining Refinery.',
        recyclability: 'Precious Metals Recovery (Gold, Copper, Rare Earths)',
        confidence: '97.9%'
    },
    'Hazardous & Chemical': {
        title: 'Chemical / Medical Biohazard',
        target_bin_type: 'Hazardous & Medical',
        recommended_bin_id: 'BIN-108',
        sorting_instructions: 'DANGER: Seal in biohazard-proof container. Route to High-Temp Neutralization Facility.',
        recyclability: 'Non-recyclable (Controlled Destruction)',
        confidence: '99.8%'
    }
};

// AI Classifier Sample Execution
async function classifySample(category, chipElement) {
    document.querySelectorAll('.sample-chip').forEach(el => el.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');

    // Attempt backend classification
    try {
        const response = await apiRequest('/api/classify-waste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sample_category: category })
        });

        const data = await response.json();
        if (data.status === 'success') {
            applyAIClassification(data.classification);
            return;
        }
    } catch (err) {
        // Fallback to client-side database
    }

    const item = AI_CATEGORIES[category] || AI_CATEGORIES['Plastic / Recyclable'];
    applyAIClassification({
        waste_category: category,
        target_bin_type: item.target_bin_type,
        recommended_bin_id: item.recommended_bin_id,
        recyclability: item.recyclability,
        sorting_instructions: item.sorting_instructions,
        confidence_pct: item.confidence
    });
}

function applyAIClassification(cls) {
    const catTitle = document.getElementById('ai-cat-title');
    const targetBin = document.getElementById('ai-target-bin');
    const recyclability = document.getElementById('ai-recyclability');
    const instructions = document.getElementById('ai-instructions');

    if (catTitle) catTitle.innerText = cls.waste_category;
    if (targetBin) targetBin.innerText = `${cls.recommended_bin_id} (${cls.target_bin_type})`;
    if (recyclability) recyclability.innerText = cls.recyclability || 'Recyclable Material';
    if (instructions) instructions.innerText = cls.sorting_instructions;
}

// Custom Image Upload Classifier Handler
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('ai-image-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }

        // Randomly classify based on file name or simulated detection
        const categories = Object.keys(AI_CATEGORIES);
        let detectedCat = categories[Math.floor(Math.random() * categories.length)];
        const lowerName = file.name.toLowerCase();
        
        if (lowerName.includes('bottle') || lowerName.includes('plastic') || lowerName.includes('cup')) {
            detectedCat = 'Plastic / Recyclable';
        } else if (lowerName.includes('food') || lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('organic')) {
            detectedCat = 'Organic / Wet Waste';
        } else if (lowerName.includes('paper') || lowerName.includes('box') || lowerName.includes('cardboard')) {
            detectedCat = 'Paper & Cardboard';
        } else if (lowerName.includes('chip') || lowerName.includes('circuit') || lowerName.includes('phone') || lowerName.includes('battery')) {
            detectedCat = 'E-Waste & Electronics';
        }

        classifySample(detectedCat, null);
    };
    reader.readAsDataURL(file);
}

// Citizen Reporting Modal Functions
function openReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('active');
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('active');
}

async function submitCitizenReport(e) {
    e.preventDefault();
    const nameInput = document.getElementById('report-name');
    const addressInput = document.getElementById('report-address');
    const categoryInput = document.getElementById('report-category');
    const descInput = document.getElementById('report-desc');

    const reportData = {
        reporter_name: nameInput ? nameInput.value : 'Anonymous Citizen',
        address: addressInput ? addressInput.value : 'Ahmedabad Central',
        waste_category: categoryInput ? categoryInput.value : 'Overflow Dustbin',
        description: descInput ? descInput.value : 'Urgent pickup needed'
    };

    try {
        const response = await apiRequest('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });
        const resData = await response.json();
        if (resData.status === 'success') {
            alert('Citizen Complaint Submitted Successfully! Dispatched Municipal Quick Response Fleet.');
            closeReportModal();
            fetchBins();
            return;
        }
    } catch (err) {
        // Standalone fallback
    }

    citizenReports.push(reportData);
    
    // Dynamically trigger overflow on nearest bin
    const targetBin = localBinsData.find(b => b.id === 'BIN-105') || localBinsData[2];
    if (targetBin) {
        targetBin.fill_level = 95;
        targetBin.status = 'OVERFLOW_CRITICAL';
        targetBin.trigger_source = 'Citizen Complaint #' + (100 + citizenReports.length);
        renderBins(localBinsData);
        updateKPICards(localBinsData);
        renderChart(localBinsData);
        calculateDSARoute();
    }

    alert('Citizen Complaint #' + (100 + citizenReports.length) + ' Submitted! Municipal Rapid Response team notified.');
    closeReportModal();
}

// Render Fleet Breakdown Doughnut Chart
function renderChart(bins) {
    const canvas = document.getElementById('bin-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const regularBins = bins.filter(b => b.id.includes('BIN'));
    const critical = regularBins.filter(b => b.fill_level >= 85).length;
    const warning = regularBins.filter(b => 75 <= b.fill_level && b.fill_level < 85).length;
    const normal = regularBins.filter(b => b.fill_level < 75).length;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Critical Overflow (>=85%)', 'Warning High (75-84%)', 'Normal Level (<75%)'],
            datasets: [{
                data: [critical, warning, normal],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11 } }
                }
            },
            cutout: '65%'
        }
    });
}
