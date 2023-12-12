let context = d3.select('#mapCanvas')
    .node()
    .getContext('2d');

let projection;
let geojsonData;

let originAirportName = "";
let destinationAirportName = "";

function updateProjection() {
    const selectedProjection = document.getElementById('projection').value;

    if (selectedProjection === 'orthographic') {
        updateOrthographicProjection();
    } else if (selectedProjection === 'azimuthalEquidistant') {
        updateAzimuthalEquidistantProjection();
    } else if (selectedProjection === 'equirectangular') {
        updateEquirectangularProjection();
    }
}

let geoGenerator = d3.geoPath()
    .projection(projection)
    .context(context);

function updateOrthographicProjection() {
    projection = d3.geoOrthographic()
        .scale(250)
        .rotate([45, 0]);

    // Update the geoGenerator with the new Orthographic projection
    geoGenerator.projection(projection);
}

function updateAzimuthalEquidistantProjection() {
    projection = d3.geoAzimuthalEquidistant()
        .scale(120)
        .translate([400, 300]); // Adjust as needed

    // Update the geoGenerator with the new Azimuthal Equidistant projection
    geoGenerator.projection(projection);
    d3.select('#mapCanvas').call(drag(projection));
    update(geojsonData);
}

function updateEquirectangularProjection() {
    projection = d3.geoEquirectangular()
        .scale(120)
        .translate([400, 300]); // Adjust as needed

    // Update the geoGenerator with the new Equirectangular projection
    geoGenerator.projection(projection);
    d3.select('#mapCanvas').call(drag(projection));
    update(geojsonData);
}


// Initialize the map with the default projection (Orthographic in this example)
updateOrthographicProjection();

let airportData; // Variable to store loaded airport data

// Load airport data from CSV
d3.csv('airports.csv').then(function(data) {
    airportData = data;
});
    
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

    //Circle around Origin
    /*let circle = d3.geoCircle().center([originLongitude, originLatitude]).radius(5);
    context.beginPath();
    context.strokeStyle = 'red';
    geoGenerator(circle());
    context.stroke();*/

    /// Display origin and destination airport names
    originAirportName = findAirportNameByCode(document.getElementById('originCode').value.toUpperCase());
    destinationAirportName = findAirportNameByCode(document.getElementById('destinationCode').value.toUpperCase());

    document.getElementById('originAirport').textContent = `Origin Airport: ${originAirportName || 'Not Found'}`;
    document.getElementById('destinationAirport').textContent = `Destination Airport: ${destinationAirportName || 'Not Found'}`;

    const distance = distVincenty(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const distanceNM = (distance / 1852).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Update the HTML to display the distance
    document.getElementById('distance').textContent = `Distance: ${distanceNM} nautical miles`;
}

function findAirportNameByCode(airportCode) {
    const airport = airportData.find(d => d.icao === airportCode || d.iata === airportCode);
    //  console.log("Airport Data:", airport);
    return airport ? airport.name : null;
}

function drag(projection) {
    let v0, q0, r0;

    function dragstarted(event) {
        v0 = versor.cartesian(projection.invert(d3.pointer(event, this)));
        q0 = versor(r0 = projection.rotate());
    }

    function dragged(event) {
        const v1 = versor.cartesian(projection.rotate(r0).invert(d3.pointer(event, this)));
        const q1 = versor.multiply(q0, versor.delta(v0, v1));
        projection.rotate(versor.rotation(q1));

        //Redraw map with udpated projection
        update(geojsonData);
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged);
}

// Attach the drag behavior to the canvas
d3.select('#mapCanvas').call(drag(projection));

function findCoordinatesByCode(airportCode) {
    const airport = airportData.find(d => d.icao === airportCode || d.iata === airportCode);
    return airport ? { latitude: parseFloat(airport.lat), longitude: parseFloat(airport.lon) } : null;
}

function updateCoordinates() {
    // Read values from the form
    const originCode = document.getElementById('originCode').value.toUpperCase();
    const destinationCode = document.getElementById('destinationCode').value.toUpperCase();
    
    // Find latitude and longitude for the origin and destination codes
    const originCoordinates = findCoordinatesByCode(originCode);
    const destinationCoordinates = findCoordinatesByCode(destinationCode);

    if (originCoordinates && destinationCoordinates) {
        // Update the global variables with new coordinates
        originLatitude = originCoordinates.latitude;
        originLongitude = originCoordinates.longitude;
        destinationLatitude = destinationCoordinates.latitude;
        destinationLongitude = destinationCoordinates.longitude;

        // Load GeoJSON file
        /*d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
            .then(function (json) {
                // Update and redraw the map with loaded GeoJSON data
                update(json);
            });*/
        update(geojsonData);    
    } else {
        console.error('Coordinates not found for the provided airport codes.');
    }
}

// REQUEST DATA
d3.json('https://gist.githubusercontent.com/d3indepth/f28e1c3a99ea6d84986f35ac8646fac7/raw/c58cede8dab4673c91a3db702d50f7447b373d98/ne_110m_land.json')
    .then(function (json) {
        geojsonData = json;
    update(geojsonData); // Initial draw
});   
