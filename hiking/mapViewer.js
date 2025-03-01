import {getStandardLeafletMap} from "./hiking.js";

//----------------------------- Map -----------------------------------
const bigMap = getStandardLeafletMap("big-map");
bigMap.setView([50.0, 10.0], 3);
L.control.locate().addTo(bigMap);

function addMarker(coordinates) {
    const newMarker = new L.marker(coordinates).addTo(bigMap);
}

let curentLocation = null;
bigMap.on('locationfound', function(ev){
    curentLocation = ev.latlng;
})

//----------------------------- Location Search -----------------------------------
const search = document.getElementById('map-search');
search.addEventListener('keyup', function() {
    const query = search.value;
    doLocationSearch(query, 0);
    umami.track("Location Search", {search_data: query });});
const searchResults = document.getElementById('map-search-results');
const searchApiUrl = 'https://api.mapbox.com/search/geocode/v6/forward';
const mapboxToken = 'pk.eyJ1Ijoibnl4bm9yZCIsImEiOiJjbTdkZDZoeGswMXpkMmlzYjZzYnNuMGthIn0.bHJF97xa3uu3Vr4xj4tgWQ';

async function doLocationSearch(query, route) { //0 = no route, 1 = start, 2 = end
    if (query.length < 2) {
        let results = route === 1 ? routeStartResults : (route === 2 ? routeEndResults : searchResults);
        results.innerHTML = '';
        results.style.display = 'none';
        return;
    }
    //ToDo add proximity from center of current map
    //proximity=-73.990593%2C40.740121
    let searchUrl = `${searchApiUrl}?q=${query}&proximity=ip&autocomplete=true&access_token=${mapboxToken}`;
    fetch(searchUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(route === 1 || route === 2) {
               showRoutePointSearch(data, route)
            } else {
                showSearchResults(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
function showSearchResults(data) {
    searchResults.innerHTML = '';
    searchResults.style.display = 'block';
    data.features.forEach(feature => {
        const resultItem = document.createElement('div');
        resultItem.textContent = feature.properties.name + ', ' + feature.properties.full_address;
        resultItem.textContent = resultItem.textContent + "\n";
        resultItem.style.cursor = 'pointer';
        resultItem.addEventListener('click', () => {
            const coordinates = feature.geometry.coordinates;
            bigMap.setView([coordinates[1], coordinates[0]], 15);
            addMarker([coordinates[1], coordinates[0]]);
        });
        searchResults.appendChild(resultItem);
        const separator = document.createElement('div');
        separator.innerHTML = `------------`;
        searchResults.appendChild(separator);
    });
    searchResults.removeChild(searchResults.lastChild);
}

//----------------------------- Routing -----------------------------------

let startCoords = null;
let endCoords = null;
const routeStart = document.getElementById('route-start-search');
routeStart.addEventListener('keyup', function() {
    const query = routeStart.value;
    doLocationSearch(query, 1);
    umami.track("Route Start Search", {search_data: query });});
const routeStartResults = document.getElementById('route-start-results');
const routeEnd = document.getElementById('route-end-search');
routeEnd.addEventListener('keyup', function() {
    const query = routeEnd.value;
    doLocationSearch(query, 2);
    umami.track("Route End Search", {search_data: query });});
const routeEndResults = document.getElementById('route-end-results');
const calcRouteButton = document.getElementById('route-button');
calcRouteButton.addEventListener('click', calcRoute);

function showRoutePointSearch(data, start) {
    let routeResults = start === 1 ? routeStartResults : routeEndResults;
    routeResults.innerHTML = '';
    routeResults.style.display = 'block';
    data.features.forEach(feature => {
        const resultItem = document.createElement('div');
        resultItem.textContent = feature.properties.name + ', ' + feature.properties.full_address;
        resultItem.textContent = resultItem.textContent + "\n";
        resultItem.style.cursor = 'pointer';
        resultItem.addEventListener('click', () => {
            const coordinates = feature.geometry.coordinates;
            addMarker([coordinates[1], coordinates[0]]);
            routeResults.innerHTML = '';
            routeResults.style.display = 'none';
            if (start === 1) {
                startCoords = coordinates;
                routeStart.value = feature.properties.name;
            } else {
                endCoords = coordinates;
                routeEnd.value = feature.properties.name;
            }});
        routeResults.appendChild(resultItem);
        const separator = document.createElement('div');
        separator.innerHTML = `------------`;
        routeResults.appendChild(separator);
    });
    routeResults.removeChild(routeResults.lastChild);
}

function calcRoute() {
    if (startCoords == null || endCoords == null) {
        return;
    }
    const routeSearchUrl = "https://api.mapbox.com/directions/v5/mapbox/";
    //const routeProfile = "driving";
    const routeProfile = "walking";
    let url = `${routeSearchUrl}${routeProfile}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?alternatives=false&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${mapboxToken}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            showRoute(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    umami.track("Route Calculated");
}
function showRoute(data) {
    var layer = L.geoJSON(data.routes[0].geometry).addTo(bigMap);
    bigMap.fitBounds(layer.getBounds());
    const stats = document.getElementById('route-stats');
   stats.innerHTML = 'Duration: ' + Math.round(data.routes[0].duration / 60) + ' min\n Distance: ' + Math.round(data.routes[0].distance / 1000) + ' km';
    const instructions = document.getElementById('route-instructions');
    const steps = data.routes[0].legs[0].steps;
    let tripInstructions = '';
    for (const step of steps) {
        tripInstructions += `<li>${step.maneuver.instruction} for ${Math.round(step.distance / 1000 * 10) / 10} km</li>`;
    }
    instructions.innerHTML = `<ol>${tripInstructions}</ol>`;
}
