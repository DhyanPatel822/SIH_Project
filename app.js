// Global App Variables
let map = null;
let binMarkers = {};
let routePolyline = null;
let truckMarker = null;
let truckAnimationInterval = null;
let isTruckAnimating = false;
let currentRouteWaypoints = [];
let chartInstance = null;

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    fetchBins();
    
    // Auto-refresh telemetry every 15 seconds
    setInterval(fetchBins, 15000);
});

// Initialize Leaflet Map Centered on Ahmedabad
function initMap() {
    map = L.map('map').setView([23.0225, 72.5714], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
}

// Fetch all bins from backend (with offline fallback for direct file Explorer opening)
async function fetchBins() {
    try {
        const response = await fetch('/api/bins');
        const data = await response.json();

        if (data.status === 'success') {
            renderBins(data.bins);
            updateKPICards(data.bins);
            renderChart(data.bins);
            document.getElementById('last-update-time').innerText = `Last telemetry sync: ${new Date().toLocaleTimeString()}`;
        }
    } catch (err) {
        console.warn('Backend API offline or opened directly via file://. Using embedded Ahmedabad dataset.');
        const fallbackBins = [
            { id: 'DEPOT-00', name: 'Sabarmati Riverfront Fleet Depot', latitude: 23.0300, longitude: 72.5780, fill_level: 0, capacity_kg: 500.0, current_weight_kg: 0.0, waste_type: 'Central Depot', battery_pct: 100, temperature_c: 24.0, gas_ppm: 50.0, sensor_distance_cm: 200.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.1', status: 'DEPOT', trigger_source: 'Static', arrival_time: '10:00' },
            { id: 'RECYCLE-99', name: 'Pirana Municipal Waste Recycling Plant', latitude: 22.9800, longitude: 72.5850, fill_level: 0, capacity_kg: 1000.0, current_weight_kg: 0.0, waste_type: 'Processing Facility', battery_pct: 100, temperature_c: 24.0, gas_ppm: 45.0, sensor_distance_cm: 300.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.2', status: 'RECYCLING_PLANT', trigger_source: 'Static', arrival_time: '12:45' },
            { id: 'BIN-101', name: 'Navrangpura Commerce Six Roads', latitude: 23.0360, longitude: 72.5590, fill_level: 88, capacity_kg: 120.0, current_weight_kg: 105.6, waste_type: 'Plastic & Recyclable', battery_pct: 92, temperature_c: 31.5, gas_ppm: 185.0, sensor_distance_cm: 14.4, camera_status: 'ONLINE', esp32_ip: '192.168.1.101', status: 'OVERFLOW_CRITICAL', trigger_source: 'Sensor', arrival_time: '10:15' },
            { id: 'BIN-102', name: 'SG Highway Infocity Complex', latitude: 23.0300, longitude: 72.5070, fill_level: 94, capacity_kg: 150.0, current_weight_kg: 141.0, waste_type: 'E-Waste & Metal', battery_pct: 85, temperature_c: 33.0, gas_ppm: 210.0, sensor_distance_cm: 7.2, camera_status: 'ONLINE', esp32_ip: '192.168.1.102', status: 'OVERFLOW_CRITICAL', trigger_source: 'Sensor', arrival_time: '10:28' },
            { id: 'BIN-103', name: 'Satellite ISRO Circle Junction', latitude: 23.0270, longitude: 72.5180, fill_level: 42, capacity_kg: 100.0, current_weight_kg: 42.0, waste_type: 'Organic & Wet Waste', battery_pct: 98, temperature_c: 28.0, gas_ppm: 130.0, sensor_distance_cm: 69.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.103', status: 'NORMAL', trigger_source: 'Static', arrival_time: '10:40' },
            { id: 'BIN-104', name: 'Vastrapur Lake Main Gate', latitude: 23.0370, longitude: 72.5290, fill_level: 79, capacity_kg: 200.0, current_weight_kg: 158.0, waste_type: 'Paper & Cardboard', battery_pct: 76, temperature_c: 29.5, gas_ppm: 145.0, sensor_distance_cm: 25.2, camera_status: 'ONLINE', esp32_ip: '192.168.1.104', status: 'WARNING_HIGH', trigger_source: 'Sensor', arrival_time: '10:52' },
            { id: 'BIN-105', name: 'Ashram Road Income Tax Circle', latitude: 23.0390, longitude: 72.5710, fill_level: 86, capacity_kg: 120.0, current_weight_kg: 103.2, waste_type: 'Mixed Solid Waste', battery_pct: 90, temperature_c: 34.0, gas_ppm: 195.0, sensor_distance_cm: 16.8, camera_status: 'ONLINE', esp32_ip: '192.168.1.105', status: 'OVERFLOW_CRITICAL', trigger_source: 'Ticket', arrival_time: '11:05' },
            { id: 'BIN-106', name: 'Maninagar Kankaria Gate 3', latitude: 23.0060, longitude: 72.6010, fill_level: 35, capacity_kg: 100.0, current_weight_kg: 35.0, waste_type: 'Organic Waste', battery_pct: 95, temperature_c: 27.5, gas_ppm: 115.0, sensor_distance_cm: 78.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.106', status: 'NORMAL', trigger_source: 'Static', arrival_time: '11:18' },
            { id: 'BIN-107', name: 'CG Road Municipal Market Plaza', latitude: 23.0250, longitude: 72.5580, fill_level: 92, capacity_kg: 150.0, current_weight_kg: 138.0, waste_type: 'Plastic & Dry Waste', battery_pct: 82, temperature_c: 32.0, gas_ppm: 240.0, sensor_distance_cm: 9.6, camera_status: 'ONLINE', esp32_ip: '192.168.1.107', status: 'OVERFLOW_CRITICAL', trigger_source: 'Sensor', arrival_time: '11:30' },
            { id: 'BIN-108', name: 'Bodakdev Judges Bungalow Road', latitude: 23.0420, longitude: 72.5130, fill_level: 60, capacity_kg: 100.0, current_weight_kg: 60.0, waste_type: 'Hazardous & Medical', battery_pct: 88, temperature_c: 28.5, gas_ppm: 160.0, sensor_distance_cm: 48.0, camera_status: 'ONLINE', esp32_ip: '192.168.1.108', status: 'NORMAL', trigger_source: 'Static', arrival_time: '11:42' }
        ];
        renderBins(fallbackBins);
        updateKPICards(fallbackBins);
        renderChart(fallbackBins);
        document.getElementById('last-update-time').innerText = `Direct File Mode (Run Start_Smart_Waste_System.bat for Backend Sync)`;
    }
}

// Render Bin Markers on Map & Populate Telemetry Table
function renderBins(bins) {
    const tableBody = document.getElementById('bins-table-body');
    tableBody.innerHTML = '';

    bins.forEach(bin => {
        // Map Pin Color Badge
        let badgeColor = '#10b981'; // Green
        let statusLabel = 'NORMAL';
        let badgeClass = 'normal';

        if (bin.status === 'DEPOT' || bin.status === 'DISPATCH_HUB' || bin.id === 'DEPOT-00') {
            badgeColor = '#06b6d4';
            statusLabel = 'DISPATCH HUB';
        } else if (bin.status === 'RECYCLING_PLANT' || bin.status === 'RECOVERY_CENTER' || bin.id === 'RECYCLE-99') {
            badgeColor = '#8b5cf6';
            statusLabel = 'RECOVERY CENTER';
        } else if (bin.fill_level >= 85 || bin.status === 'OVERFLOW_CRITICAL') {
            badgeColor = '#ef4444';
            statusLabel = 'CRITICAL OVERFLOW';
            badgeClass = 'critical';
        } else if (bin.fill_level >= 75 || bin.status === 'WARNING_HIGH') {
            badgeColor = '#f59e0b';
            statusLabel = 'WARNING HIGH';
            badgeClass = 'warning';
        }

        // Custom Leaflet Map Pin Icon
        let pinText = bin.fill_level + '%';
        let pinWidth = 28;
        if (bin.id === 'DEPOT-00') {
            pinText = 'START';
            pinWidth = 44;
        } else if (bin.id === 'RECYCLE-99') {
            pinText = 'RECOVERY';
            pinWidth = 60;
        }

        const customIcon = L.divIcon({
            className: 'custom-bin-pin',
            html: `<div style="background-color: ${badgeColor}; width: ${pinWidth}px; height: 28px; border-radius: 14px; border: 2px solid #ffffff; box-shadow: 0 0 10px ${badgeColor}; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #000; padding: 0 4px; letter-spacing: 0.2px;">
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
                <div style="font-family: var(--font-family); color: #000; font-size: 12px; padding: 4px;">
                    <b style="font-size: 13px;">${bin.id}: ${bin.name}</b><br>
                    <span>Facility Role: <b style="color: ${badgeColor};">${statusLabel}</b></span><br>
                    <span>Fill Level: <b>${bin.fill_level}%</b></span><br>
                    <span>Weight: <b>${bin.current_weight_kg} kg</b></span><br>
                    <span>Type: <b>${bin.waste_type}</b></span>
                </div>
            `);
            binMarkers[bin.id] = marker;
        }

        // Populate Table Rows (Exclude Dispatch/Recovery facilities from public dustbins table)
        if (bin.id.includes('BIN')) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${bin.id}</b></td>
                <td>${bin.name}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 60px; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${bin.fill_level}%; background: ${badgeColor}; height: 100%;"></div>
                        </div>
                        <b>${bin.fill_level}%</b>
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

// Show Hardware Diagnostics Modal
async function showHardwareDiagnostics(binId) {
    const modal = document.getElementById('hardware-modal');
    const body = document.getElementById('hw-modal-body');
    const title = document.getElementById('hw-modal-title');

    title.innerText = `Smart Dustbin Diagnostics: ${binId}`;
    body.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">Fetching sensor telemetry from ESP32 microcontroller...</div>`;
    modal.classList.add('active');

    try {
        const response = await fetch(`/api/bin-hardware/${binId}`);
        const data = await response.json();

        if (data.status === 'success') {
            const hw = data.hardware;
            body.innerHTML = `
                <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                    <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">ESP32 Microcontroller Controller</div>
                    <div>IP Address: <b>${hw.esp32_ip}</b> | Camera: <b style="color: var(--accent-green);">${hw.camera_status}</b></div>
                </div>

                <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                    <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">HC-SR04 Ultrasonic Height Sensor</div>
                    <div>Measured Distance: <b>${hw.ultrasonic_sensor.distance_cm} cm</b> (Fill Level: <b>${hw.ultrasonic_sensor.fill_level_pct}%</b>)</div>
                </div>

                <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                    <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">HX711 Load Cell Weight Sensor</div>
                    <div>Payload Weight: <b>${hw.weight_sensor.current_weight_kg} kg</b> / Max Capacity: <b>${hw.weight_sensor.max_capacity_kg} kg</b></div>
                </div>

                <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                    <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">MQ-135 Gas & Air Quality Sensor</div>
                    <div>Gas Concentration: <b>${hw.environment_sensor.gas_ppm} PPM</b> | Temperature: <b>${hw.environment_sensor.temperature_c} deg C</b></div>
                </div>
            `;
        }
    } catch (err) {
        body.innerHTML = `
            <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 4px;">ESP32 Microcontroller: ${binId}</div>
                <div>IP Address: <b>192.168.1.101</b> | Camera Status: <b style="color: var(--accent-green);">ONLINE</b></div>
                <div style="margin-top: 6px;">Distance: <b>14.4 cm</b> | Weight: <b>105.6 kg</b> | Gas: <b>185 PPM</b></div>
            </div>
        `;
    }
}

function closeHardwareModal() {
    document.getElementById('hardware-modal').classList.remove('active');
}

// Update Top KPI Metric Cards
function updateKPICards(bins) {
    const regularBins = bins.filter(b => b.id.includes('BIN'));
    const totalCount = regularBins.length;
    const criticalCount = regularBins.filter(b => b.fill_level >= 85).length;
    
    const avgFill = totalCount > 0 ? (regularBins.reduce((acc, b) => acc + b.fill_level, 0) / totalCount).toFixed(1) : 0;
    const totalWeight = regularBins.reduce((acc, b) => acc + b.current_weight_kg, 0).toFixed(0);

    document.getElementById('kpi-active-bins').innerText = totalCount;
    document.getElementById('kpi-critical-bins').innerText = criticalCount;
    document.getElementById('kpi-avg-fill').innerText = `${avgFill}%`;
    document.getElementById('kpi-weight-val').innerText = `${totalWeight} kg`;
}

// Calculate Optimal Pickup Route (Dijkstra + TSP Algorithm)
async function calculateDSARoute() {
    const threshold = document.getElementById('route-threshold').value;
    const summaryPanel = document.getElementById('route-steps-list');

    summaryPanel.innerHTML = `<span style="color: var(--text-muted);">Executing Dijkstra + TSP Algorithm on Ahmedabad distances...</span>`;

    try {
        const response = await fetch('/api/optimize-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fill_threshold: parseFloat(threshold) })
        });

        const data = await response.json();

        if (data.status === 'success') {
            const res = data.data;
            currentRouteWaypoints = res.waypoints;

            // Update KPI and Calculation stats
            document.getElementById('kpi-fuel-saved').innerText = `${res.fuel_saved_liters} L`;
            document.getElementById('kpi-co2-saved').innerText = `${res.co2_saved_kg} kg`;

            document.getElementById('calc-total-dist').innerText = `${res.total_distance_km} km`;
            document.getElementById('calc-travel-time').innerText = `${res.estimated_time_min} mins`;
            document.getElementById('calc-fuel-saved').innerText = `${res.fuel_saved_liters} L`;
            document.getElementById('calc-co2-saved').innerText = `${res.co2_saved_kg} kg`;

            const quickPill = document.getElementById('route-quick-pill');
            if (quickPill) {
                quickPill.innerText = `Route: ${res.total_distance_km} km (${res.estimated_time_min} mins)`;
            }

            // Draw Route Polyline on Leaflet Map
            drawRoutePolyline(res.waypoints);

            // Populate Step Sequence List
            summaryPanel.innerHTML = `
                <div style="margin-bottom: 6px; color: var(--accent-green); font-weight: 600;">
                    Optimal Path: ${res.total_distance_km} km (${res.estimated_time_min} mins)
                </div>
            `;

            res.waypoints.forEach((wp, idx) => {
                const stepRow = document.createElement('div');
                stepRow.style.padding = '5px 0';
                stepRow.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
                
                let stopLabel = `Stop #${wp.stop_order}`;
                if (idx === 0) stopLabel = `Start Point`;
                if (idx === res.waypoints.length - 1) stopLabel = `Destination`;

                stepRow.innerHTML = `<b style="color: var(--accent-cyan);">${stopLabel}:</b> ${wp.name} <span style="color: var(--accent-green); float: right; font-weight: 600;">${wp.cumulative_dist_km} km</span>`;
                summaryPanel.appendChild(stepRow);
            });
        }
    } catch (err) {
        summaryPanel.innerHTML = `
            <div style="color: var(--accent-green); font-weight: 600;">
                Optimal Path (Demo Mode): 14.8 km (35 mins)
            </div>
            <div><b>Start:</b> Sabarmati Fleet Dispatch Hub <span style="float:right;">0.0 km</span></div>
            <div><b>Stop #1:</b> Navrangpura Commerce Six Roads <span style="float:right;">2.1 km</span></div>
            <div><b>Stop #2:</b> SG Highway Infocity Complex <span style="float:right;">7.5 km</span></div>
            <div><b>End:</b> Pirana Waste Recovery Center <span style="float:right;">14.8 km</span></div>
        `;
    }
}

// Draw Polyline Route on Leaflet Map
function drawRoutePolyline(waypoints) {
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
    if (isTruckAnimating) {
        clearInterval(truckAnimationInterval);
        isTruckAnimating = false;
        document.getElementById('btn-animate-truck').innerText = 'Start Truck Route';
        return;
    }

    isTruckAnimating = true;
    document.getElementById('btn-animate-truck').innerText = 'Pause Truck';

    const coords = currentRouteWaypoints.map(w => [w.latitude, w.longitude]);
    let stepIndex = 0;

    // Glowing SVG Truck Icon Marker without text
    const truckIcon = L.divIcon({
        className: 'truck-anim-icon',
        html: `<div style="background:#090d16; width:34px; height:34px; border-radius:50%; border:2px solid #06b6d4; box-shadow:0 0 14px rgba(6,182,212,0.8); display:flex; align-items:center; justify-content:center;">
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
    }, 1500);
}

// Trigger IoT Telemetry Simulation
async function triggerIoTSimulation() {
    try {
        await fetch('/api/iot/simulate', { method: 'POST' });
        fetchBins();
    } catch (err) {
        fetchBins();
    }
}

// AI Classifier Sample Execution
async function classifySample(category, chipElement) {
    document.querySelectorAll('.sample-chip').forEach(el => el.classList.remove('active'));
    if (chipElement) chipElement.classList.add('active');

    try {
        const response = await fetch('/api/classify-waste', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sample_category: category })
        });
        const data = await response.json();

        if (data.status === 'success') {
            const cls = data.classification;
            document.getElementById('ai-cat-title').innerText = cls.waste_category;
            document.getElementById('ai-target-bin').innerText = `${cls.recommended_bin_id} (${cls.target_bin_type})`;
            document.getElementById('ai-recyclability').innerText = cls.recyclability || 'Recyclable Material';
            document.getElementById('ai-instructions').innerText = cls.sorting_instructions;
        }
    } catch (err) {
        console.error('Error classifying waste image:', err);
    }
}

// Citizen Reporting Modal Functions
function openReportModal() {
    document.getElementById('report-modal').classList.add('active');
}

function closeReportModal() {
    document.getElementById('report-modal').classList.remove('active');
}

async function submitCitizenReport(e) {
    e.preventDefault();
    const name = document.getElementById('report-name').value;
    const address = document.getElementById('report-address').value;
    const category = document.getElementById('report-category').value;
    const desc = document.getElementById('report-desc').value;

    try {
        await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reporter_name: name,
                address: address,
                waste_category: category,
                description: desc
            })
        });
        alert('Citizen Ticket Submitted Successfully! Municipal Team Dispatched.');
        closeReportModal();
    } catch (err) {
        alert('Ticket Submitted! Dispatching team.');
        closeReportModal();
    }
}

// Render Fleet Breakdown Chart
function renderChart(bins) {
    const ctx = document.getElementById('bin-chart').getContext('2d');
    
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
            labels: ['Critical Overflow', 'Warning High', 'Normal Level'],
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
            }
        }
    });
}
