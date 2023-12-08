let context = d3.select('#mapCanvas')
    .node()
    .getContext('2d');

let projection = d3.geoEqualEarth()
    .scale(120)
    .rotate([0,0]);

let geoGenerator = d3.geoPath()
    .projection(projection)
    .context(context);

// Default coordinates
let originLatitude = 51.5074;
let originLongitude = 0.1278;
let destinationLatitude = 40.7128;
let destinationLongitude = -74.0059;

function update(geojson) {
    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.lineWidth = 0.5;
    context.strokeStyle = '#333';

    // Draw map features
    geoGenerator({ type: 'FeatureCollection', features: geojson.features })
        context.stroke();

    // Graticule
    let graticule = d3.geoGraticule();
    context.beginPath();
    context.strokeStyle = '#ccc';
    geoGenerator(graticule());
    context.stroke();

    // Origin - Destination line
    context.beginPath();
    context.strokeStyle = 'red';
    geoGenerator({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [
                [originLongitude, originLatitude],
                [destinationLongitude, destinationLatitude]
            ]
        }
    });
    context.stroke();

    // Circle around Origin
    let circle = d3.geoCircle().center([originLongitude, originLatitude]).radius(5);
    context.beginPath();
    context.strokeStyle = 'red';
    geoGenerator(circle());
    context.stroke();
}

function updateCoordinates() {
    // Read values from the form
    originLatitude = parseFloat(document.getElementById('originLatitude').value);
    originLongitude = parseFloat(document.getElementById('originLongitude').value);
    destinationLatitude = parseFloat(document.getElementById('destinationLatitude').value);
    destinationLongitude = parseFloat(document.getElementById('destinationLongitude').value);

    // Load GeoJSON file
    d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
        .then(function (json) {
            // Update and redraw the map with loaded GeoJSON data
            update(json);
        });
}

// REQUEST DATA
d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
    .then(function (json) {
        update(json);
    });   
