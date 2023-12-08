document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map
    var map = L.map('map').setView([0, 0], 2);
    
    // Add a tile layer (you can use other tile providers)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Example coordinates (New York to Tokyo)
    var startLat = 40.7128;
    var startLng = -74.0060;
    var endLat = 35.6895;
    var endLng = 139.6917;

    // Create LatLng objects for start and end points
    var startPoint = L.latLng(startLat, startLng);
    var endPoint = L.latLng(endLat, endLng);

    // Calculate the great circle path
    var greatCircle = new LatLon(startLat, startLng).midpointTo(new LatLon(endLat, endLng));
    var greatCirclePath = [startPoint, L.latLng(greatCircle.lat, greatCircle.lon), endPoint];

    // Add the great circle path to the map
    L.polyline(greatCirclePath, { color: 'red' }).addTo(map);

    // Add markers for start and end points
    L.marker(startPoint).addTo(map).bindPopup('Start Point');
    L.marker(endPoint).addTo(map).bindPopup('End Point');
});
