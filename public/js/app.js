// public/js/app.js
let map, vehicleMarker, routePolyline;
let isPlaying = true;
let updateInterval = 1000;
let currentIndex = 0;
let previousPoint = null;
let routeData = [];

async function initMap() {
    // Load route data from the API
    const response = await fetch('/api/route');
    routeData = await response.json();
    
    // Initialize the map
    map = L.map('map', {
        zoomControl: true,
        fadeAnimation: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Convert coordinates to [lat, lng] pairs
    const routeCoords = routeData.map(p => [p.latitude, p.longitude]);
    
    // Create the route polyline
    routePolyline = L.polyline(routeCoords, {
        color: '#4361ee',
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round'
    }).addTo(map);

    // Define the custom car icon
    const carIcon = L.icon({
        iconUrl: '/images/car.png', // Path to your local car image or CDN link
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    // Create vehicle marker with rotation
    vehicleMarker = L.marker(routeCoords[0], {
        icon: carIcon,
        rotationAngle: 0,
        rotationOrigin: 'center'
    }).addTo(map);

    // Fit map to show entire route
    map.fitBounds(routePolyline.getBounds(), {
        padding: [50, 50],
        maxZoom: 15
    });

    // Start updating vehicle position every `updateInterval` milliseconds
    setInterval(updatePosition, updateInterval);

    // Event listeners for playback controls
    document.getElementById('play-pause').addEventListener('click', togglePlayback);
    document.getElementById('reset-btn').addEventListener('click', resetRoute);
    document.getElementById('speed-control').addEventListener('input', (e) => {
        updateInterval = Math.max(100, 1100 - (e.target.value * 100));
    });
}

function togglePlayback() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-pause');
    btn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
    btn.style.background = isPlaying ? '#4361ee' : '#4CAF50';
}

function resetRoute() {
    currentIndex = 0;
    previousPoint = null;
    vehicleMarker.setLatLng([routeData[0].latitude, routeData[0].longitude]);
    map.fitBounds(routePolyline.getBounds());
}

async function updatePosition() {
    if (!isPlaying || !routeData.length) return;
    
    try {
        const response = await fetch('/api/current-location');
        const { latitude, longitude, timestamp } = await response.json();
        const newPoint = [latitude, longitude];
        
        // Calculate direction
        if (previousPoint) {
            const angle = Math.atan2(
                newPoint[1] - previousPoint[1],
                newPoint[0] - previousPoint[0]
            ) * 180 / Math.PI;
            vehicleMarker.setRotationAngle(angle + 90);
        }
        
        // Update position
        vehicleMarker.setLatLng(newPoint);
        
        // Smooth panning (only every few points for performance)
        if (currentIndex % 3 === 0) {
            map.panTo(newPoint, { animate: true, duration: 0.5 });
        }
        
        // Update UI
        document.getElementById('timestamp').textContent = 
            new Date(timestamp).toLocaleTimeString();
        
        document.getElementById('speed').textContent = 
            `${Math.floor(Math.random() * 30) + 50} km/h`;
        
        previousPoint = newPoint;
        
    } catch (error) {
        console.error('Update error:', error);
    }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', initMap);
