import {getStandardLeafletMap} from "./hiking.minified.js";

//----------------------------- Map -----------------------------------
let wayPointList = [];
const bigMap = getStandardLeafletMap("big-map");
bigMap.setView([50.0, 10.0], 3);
L.control.locate().addTo(bigMap);

function addMarker(coordinates) {
    const marker = new L.marker(coordinates);
    bigMap.addLayer(marker);
    return marker;
}

let currentLocation = null;
bigMap.on('locationfound', function(ev){
    currentLocation = ev.latlng;
    umami.track("Location found", {user_location: ev.latlng });
})

//----------------------------- Location Search -----------------------------------
const search = document.getElementById('map-search');
search.addEventListener('keyup', function() {
    const query = search.value;
    doLocationSearch(query, 0);
    umami.track("Location Search", {search_data: query });});
const searchResults = document.getElementById('map-search-results');
search.addEventListener('blur', function(event) {
    if (!(event.relatedTarget && event.relatedTarget.nodeName === 'DIV')) {
        searchResults.style.display = 'none';
    }
});
search.addEventListener('focus', function() {
    if (searchResults.innerHTML !== '') {
        searchResults.style.display = 'block';
    }
});
searchResults.addEventListener('click', function() {
    search.focus();
});
const searchApiUrl = 'https://api.mapbox.com/search/geocode/v6/forward';
const mapboxToken = 'pk.eyJ1Ijoibnl4bm9yZCIsImEiOiJjbTgza293dGUwa2w2Mm1zN3ZuZmVia3Q3In0.ZXcKcAtVGmyoReZWMIbraw';

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
               showRoutePointSearch(data, route, query)
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
        resultItem.tabIndex = 0;
        resultItem.textContent = feature.properties.name + ', ' + feature.properties.full_address;
        resultItem.textContent = resultItem.textContent + "\n";
        resultItem.style.cursor = 'pointer';
        resultItem.addEventListener('click', () => {
            const coordinates = feature.geometry.coordinates;
            bigMap.setView([coordinates[1], coordinates[0]], 15);
            addMarker([coordinates[1], coordinates[0]]);
            searchResults.style.display = 'none'
        });
        searchResults.appendChild(resultItem);
        const separator = document.createElement('div');
        separator.innerHTML = `------------`;
        separator.tabIndex = -1;
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
routeStart.addEventListener('blur', function(event) {
    if (!(event.relatedTarget && event.relatedTarget.nodeName === 'DIV')) {
        routeStartResults.style.display = 'none';
    }
});
routeStart.addEventListener('focus', function() {
    if (routeStartResults.innerHTML !== '') {
        routeStartResults.style.display = 'block';
    }
});
routeStartResults.addEventListener('click', function() {
    routeStart.focus();
});
const routeEnd = document.getElementById('route-end-search');
routeEnd.addEventListener('keyup', function() {
    const query = routeEnd.value;
    doLocationSearch(query, 2);
    umami.track("Route End Search", {search_data: query });});
const routeEndResults = document.getElementById('route-end-results');
routeEnd.addEventListener('blur', function(event) {
    if (!(event.relatedTarget && event.relatedTarget.nodeName === 'DIV')) {
        routeEndResults.style.display = 'none';
    }
});
routeEnd.addEventListener('focus', function() {
    if (routeEndResults.innerHTML !== '') {
        routeEndResults.style.display = 'block';
    }
});
routeEndResults.addEventListener('click', function() {
    routeEnd.focus();
});
const calcRouteButton = document.getElementById('route-button');
calcRouteButton.addEventListener('click', calcRoute);

function showRoutePointSearch(data, start, query) {
    let routeResults = start === 1 ? routeStartResults : routeEndResults;
    routeResults.innerHTML = '';
    routeResults.style.display = 'block';
    wayPointList.forEach(waypoint => {
       if (waypoint[2].toLowerCase().includes(query.toLowerCase())) {
            const resultItem = document.createElement('div');
            resultItem.textContent = "📍 " + waypoint[2];
            resultItem.style.cursor = 'pointer';
            resultItem.tabIndex = 0;
            resultItem.addEventListener('click', () => {
                routeResults.style.display = 'none';
                const coordinates = waypoint[0]
                const mapboxCoords = [coordinates[1], coordinates[0]];
                addMarker([coordinates[1], coordinates[0]]);
                routeResults.innerHTML = '';
                routeResults.style.display = 'none';
                if (start === 1) {
                    startCoords = mapboxCoords;
                    routeStart.value = waypoint[2];
                } else {
                    endCoords = mapboxCoords;
                    routeEnd.value = waypoint[2];
                }});
            routeResults.appendChild(resultItem);
            const separator = document.createElement('div');
            separator.innerHTML = `------------`;
            separator.tabIndex = -1;
            routeResults.appendChild(separator);
        }
    });
    data.features.forEach(feature => {
        const resultItem = document.createElement('div');
        resultItem.tabIndex = 0;
        resultItem.textContent = feature.properties.name + ', ' + feature.properties.full_address;
        resultItem.textContent = resultItem.textContent + "\n";
        resultItem.style.cursor = 'pointer';
        resultItem.addEventListener('click', () => {
            routeResults.style.display = 'none';
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
        separator.tabIndex = -1;
        routeResults.appendChild(separator);
    });
    routeResults.removeChild(routeResults.lastChild);
}

function calcRoute() {
    if (startCoords == null || endCoords == null) {
        return;
    }
    const routeSearchUrl = "https://api.mapbox.com/directions/v5/mapbox/";
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
let lastRoute = null;
function showRoute(data) {
    const statsBox = document.getElementById('route-info');
    statsBox.style.display = "block";
    addGPXToList(getGpxFromCoordinateList(data.routes[0].geometry.coordinates), data.routes[0].legs[0].summary);
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

document.getElementById("search-collapsible").addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "flex") {
        content.style.display = "none";
    } else {
        content.style.display = "flex";
    }
});

function getGpxFromCoordinateList(coordinateList) {
    //from geojson to gpx
    let gpx = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    gpx += '<gpx version="1.1" creator="HikingMapViewer">\n';
    gpx += '  <metadata>\n';
    gpx += '    <name>Route</name>\n';
    gpx += '  </metadata>\n';
    gpx += '  <trk>\n';
    gpx += '    <name>Route</name>\n';
    gpx += '    <trkseg>\n';
    for (const coordinate of coordinateList) {
        gpx += `      <trkpt lat="${coordinate[1]}" lon="${coordinate[0]}"></trkpt>\n`;
    }
    gpx += '    </trkseg>\n';
    gpx += '  </trk>\n';
    gpx += '</gpx>';
    return gpx;
}

//----------------------------- Custom GPX -----------------------------------

L.control.measure().addTo(bigMap);
document.getElementById("gpx-collapsible").addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "flex") {
        content.style.display = "none";
    } else {
        content.style.display = "flex";
    }
});
document.getElementById("waypoint-collapsible").addEventListener("click", function() {
    this.classList.toggle("active");
    let content = this.nextElementSibling;
    if (content.style.display === "flex") {
        content.style.display = "none";
    } else {
        content.style.display = "flex";
    }
});
const gpx_list = document.getElementById("gpx_list");
const colors = ['red', 'blue', 'green', 'purple', 'orange', 'darkred', 'lightred', 'darkblue', 'darkgreen', 'pink', 'lightblue', 'lightgreen', 'gray'];
let colorIndex = 0;
restoreSession();
async function restoreSession() {
    for (const [key, value] of Object.entries(localStorage)) {
       if (key.endsWith('.gpx')) {
           addGPXToList(value, key);
       } else if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(value.trim())) {
           try {
               const coords = value.split(",").map(Number);
               if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
                   throw new Error("Invalid coordinates");
               }
               showWaypoint(key, coords);
           } catch (error) {
               console.error(`Error parsing waypoint from localStorage key "${key}":`, error);
           }
       }
    }
}
document.getElementById("gpx-file-input").addEventListener("change", function() {
    const uploadedFile = document.getElementById("gpx-file-input").files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        if (localStorage.hasOwnProperty(uploadedFile.name)) {
            return;
        }
        addGPXToList(e.target.result, uploadedFile.name);
        localStorage.setItem(uploadedFile.name, e.target.result.toString());
    };
    reader.readAsText(uploadedFile);
    umami.track("GPX Loaded");
});
function addGPXToList(gpx, name) {
    const infoDiv = document.createElement("div");
    let gpxParsed;
    infoDiv.innerHTML = "Distance: <span class=\"distance\"></span> km\n" +
                        "Duration: <span class=\"duration\"></span>\n" +
                        "Pace: <span class=\"pace\"></span>"
    const track = new L.GPX(gpx, {
        async: true,
        polyline_options: { color: colors[colorIndex] }
    }).on('loaded', function(e) {
        gpxParsed = e.target;
        bigMap.fitBounds(gpxParsed.getBounds());
        infoDiv.querySelector(`.distance`).textContent = (gpxParsed.get_distance() / 1000).toFixed(2);
        infoDiv.querySelector(`.duration`).textContent = gpxParsed.get_duration_string(gpxParsed.get_moving_time());
        infoDiv.querySelector(`.pace`).textContent = gpxParsed.get_duration_string(gpxParsed.get_moving_pace(), true);
    }).addTo(bigMap);
    const gpx_div = document.createElement("div");
    const heading = document.createElement("div");
    heading.textContent = name;
    heading.style.color = colors[colorIndex];
    heading.addEventListener("click", function(e) {
       bigMap.fitBounds(gpxParsed.getBounds());
    });
    infoDiv.addEventListener("click", function(e) {
        bigMap.fitBounds(gpxParsed.getBounds());
    })
    const downloadButton = document.createElement("button");
    downloadButton.className = "gpx_list_item_button";
    downloadButton.textContent = "⤓";
    downloadButton.setAttribute("data-tooltip", "Download GPX");
    downloadButton.addEventListener("click", function() {
        download(name, gpx);
        umami.track("GPX Downloaded");
    });
    const editButton = document.createElement("button");
    editButton.className = "gpx_list_item_button";
    editButton.textContent = "✏️";
    editButton.setAttribute("data-tooltip", "Edit Line");
    let editing = false;
    let polyline = null;
    editButton.addEventListener("click", function() {
        if (!editing) {
            bigMap.removeLayer(track);
            polyline = gpxToPolyline(gpx);
            editing = true;
            editButton.textContent = "💾";
        } else {
            editing = false;
            editButton.textContent = "✏️";
            bigMap.removeLayer(polyline);
            localStorage.removeItem(name);
            gpx_list.removeChild(gpx_div);
            const newGPX = polylineToGpx(polyline);
            localStorage.setItem(name, newGPX);
            addGPXToList(newGPX, name);
            polyline = null;
        }
    });
    //ToDo: add rename button
    const deleteButton = document.createElement("button");
    deleteButton.className = "gpx_list_item_button";
    deleteButton.textContent = "❌";
    deleteButton.setAttribute("data-tooltip", "Delete GPX");
    deleteButton.addEventListener("click", function() {
        localStorage.removeItem(name);
        gpx_list.removeChild(gpx_div);
        bigMap.removeLayer(track);
        umami.track("GPX Deleted");
    })
    gpx_div.className = "gpx_list_item";
    gpx_div.appendChild(heading);
    gpx_div.appendChild(infoDiv);
    gpx_div.appendChild(downloadButton);
    gpx_div.appendChild(editButton);
    gpx_div.appendChild(deleteButton);
    gpx_div.id = name;
    gpx_list.appendChild(gpx_div);
    colorIndex++;
    if (colorIndex >= colors.length -1) {
        colorIndex = 0;
    }
}
function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
bigMap.on("click", function(ev) {
    if (waypointAddMode) {
        showWaypoint(null,[ev.latlng.lat, ev.latlng.lng]);
        localStorage.setItem([ev.latlng.lat, ev.latlng.lng].toString(), [ev.latlng.lat, ev.latlng.lng].toString());
    }
});
let waypointAddMode = false;
document.getElementById("waypoint_add_button").addEventListener("click", function() {
    if (waypointAddMode) {
        document.getElementById("waypoint_add_button").style.color = "red";
        waypointAddMode = false;
    } else {
        document.getElementById("waypoint_add_button").style.color = "green";
        waypointAddMode = true;
    }
})
function showWaypoint(name, coords) {
    if (!name) {
        name = coords;
    }
    const marker = addMarker(coords);
    wayPointList.push([coords, marker, name]);
    const waypoint_div = document.createElement("div");
    const heading = document.createElement("div");
    heading.textContent = name;
    heading.addEventListener("click", function(e) {
        bigMap.panTo(new L.LatLng(coords[0], coords[1]));
    });
    const renameButton = document.createElement("button");
    renameButton.className = "gpx_list_item_button";
    renameButton.textContent = "✏️";
    renameButton.setAttribute("data-tooltip", "Rename Waypoint");
    let renaming = false;
    renameButton.addEventListener("click", function() {
        const input = document.createElement("input");
        if (!renaming) {
            renaming = true;
            renameButton.textContent = "💾";
            input.value = heading.textContent;
            input.type = "text";
            input.accept = "text/plain;charset=utf-8";
            input.addEventListener("keydown", function(e) {
                if (e.key === "Enter") {
                    localStorage.removeItem(heading.textContent);
                    heading.textContent = input.value;
                    localStorage.setItem(heading.textContent, coords);
                    waypoint_div.replaceChild(heading, input);
                    const index = wayPointList.findIndex(waypoint => waypoint[0][0] === coords[0] && waypoint[0][1] === coords[1]);
                    if (index !== -1) {
                        wayPointList[index][2] = input.value;
                    }
                    renameButton.textContent = "✏️";
                    renaming = false;
                }
            })
            waypoint_div.replaceChild(input, heading);
            renameButton._input = input;
        } else {
            const event = new KeyboardEvent("keydown", { key: "Enter" });
            renameButton._input.dispatchEvent(event);
        }
    });
    const deleteButton = document.createElement("button");
    deleteButton.className = "gpx_list_item_button";
    deleteButton.textContent = "❌";
    deleteButton.setAttribute("data-tooltip", "Delete Waypoint");
    deleteButton.addEventListener("click", function() {
        bigMap.removeLayer(marker);
        // Remove the waypoint from the wayPointList
        const index = wayPointList.findIndex(waypoint => waypoint[0][0] === coords[0] && waypoint[0][1] === coords[1]);
        if (index !== -1) {
            wayPointList.splice(index, 1); // Remove the waypoint entry
        }
        document.getElementById("waypoint_list").removeChild(waypoint_div);
        localStorage.removeItem(heading.textContent);
        umami.track("Waypoint Deleted");
    })
    waypoint_div.className = "gpx_list_item";
    waypoint_div.appendChild(heading);
    waypoint_div.appendChild(renameButton);
    waypoint_div.appendChild(deleteButton);
    waypoint_div.id = coords;
    document.getElementById("waypoint_list").appendChild(waypoint_div);
}
function gpxToPolyline(gpx) {
    // Parse GPX data to extract track points
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpx, "text/xml");
    const trackPoints = xmlDoc.getElementsByTagName("trkpt");
    // Convert track points to polyline coordinates
    const coordinates = [];
    for (const element of trackPoints) {
        const lat = parseFloat(element.getAttribute("lat"));
        const lon = parseFloat(element.getAttribute("lon"));
        coordinates.push([lat, lon]);
    }
    const polyline = L.polyline(coordinates, {color: colors[colorIndex]}).addTo(bigMap);
    polyline.enableEdit();
    return polyline;
}
function polylineToGpx(polyline) {
    // Convert Leaflet polyline to GPX string
    const latlngs = polyline.getLatLngs();
    const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
    return getGpxFromCoordinateList(coordinates);
}
document.getElementById("gpx_create_button").addEventListener("click", function() {
    const name = "New GPX " + new Date().toISOString().split(".")[0] + ".gpx";
    const center = bigMap.getCenter();
    const polyline = L.polyline([
    [center.lat, center.lng],
    [center.lat + 0.00045, center.lng] // ~50 meters north
    ]);
    const gpx = polylineToGpx(polyline);
    localStorage.setItem(name, gpx);
    addGPXToList(gpx, name);
});
