import { gpx } from "https://unpkg.com/@tmcw/togeojson?module";
let accessToken = 'pk.eyJ1Ijoibnl4bm9yZCIsImEiOiJjbTdkZDZoeGswMXpkMmlzYjZzYnNuMGthIn0.bHJF97xa3uu3Vr4xj4tgWQ';

//-----------------------------Mapbox Stuff-----------------------------------

mapboxgl.accessToken = accessToken;

//lng, lat: Center of the map; zoom: starting Zoom level; radius: Radius of the scrollable map; gpxTrack: gpx filepath; containerID: ID of the div where the map should be placed
function getStandardMap(lng, lat, zoom, radius, gpxTrack, containerID) {
    const bounds = [[0, 0], [0, 0]
    ];
    let newMap = new mapboxgl.Map({
        container: containerID, // container ID
        center: [lng, lat], // Starting position [lng, lat]
        // maxBounds: bounds,
        zoom: zoom,
        style: 'mapbox://styles/mapbox/outdoors-v12'
    });
    newMap.addControl(new mapboxgl.NavigationControl());
    newMap.addControl(new mapboxgl.FullscreenControl());
    newMap.on('style.load', () => {
        newMap.setConfigProperty('basemap', 'lightPreset', 'dusk');
        const zoomBasedReveal = (value) => {  // use an expression to transition some properties between zoom levels 11 and 13, preventing visibility when zoomed out
            return [
                'interpolate',
                ['linear'],
                ['zoom'],
                8,
                0.0,
                13,
                value
            ];
        };
        newMap.setSnow({
            density: zoomBasedReveal(0.85),
            intensity: 1.0,
            'center-thinning': 0.1,
            direction: [0, 50],
            opacity: 1.0,
            color: `#ffffff`,
            'flake-size': 0.71,
            vignette: zoomBasedReveal(0.3),
            'vignette-color': `#ffffff`
        });
    });
    fetch(gpxTrack)     //from https://github.com/placemark/togeojson
        .then(function (response) {
            return response.text();
        })
        .then(function (xml) {
            const parsedGPX = new DOMParser().parseFromString(xml, "application/xml");
            const geojson = gpx(parsedGPX);
            const center = turf.centroid(geojson).geometry.coordinates;
            newMap.setCenter(center);
            bounds[0] = [center[0] - radius / 111, center[1] - radius / 111];
            bounds[1] = [center[0] + radius / 111, center[1] + radius / 111];
            newMap.setMaxBounds(bounds);
            newMap.on('load', () => {
                newMap.addSource('gpxData', {
                    type: 'geojson',
                    data: geojson
                });
                newMap.addLayer({
                    id: 'gpxLayer',
                    type: 'line',
                    source: 'gpxData',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#d30d0d',
                        'line-width': 2
                    }
                });
            });
        });
    return newMap;
}

//-----------------------------Leaflet Stuff-----------------------------------

//gpxTrack: gpx filepath; containerID: ID of the div where the map should be placed; day: day from the stats div
function getStandardLeafletMap(gpxTrack, day, containerID) {
    var mapL = L.map(containerID);
    //L.tileLayer('https://b.tile.opentopomap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.nyxnord.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Daten:  &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Darstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" >CC-BY-SA</a>)'
    }).addTo(mapL);
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };
    //var control = L.control.layers(null, null).addTo(mapL);
    L.control.scale({ imperial: false }).addTo(mapL);
    new L.GPX(gpxTrack, options, { //using https://github.com/mpetazzoni/leaflet-gpx
        async: true,
    }).on('loaded', function(e) {
        var gpx = e.target;
        mapL.fitBounds(gpx.getBounds());
        //control.addOverlay(gpx, gpx.get_name());
        const infoDiv = document.querySelector(`.info[data-day="${day}"]`);
        if (infoDiv) {
            infoDiv.querySelector(`.distance`).textContent = (gpx.get_distance() / 1000).toFixed(2);
            infoDiv.querySelector(`.duration`).textContent = gpx.get_duration_string(gpx.get_moving_time());
            infoDiv.querySelector(`.pace`).textContent = gpx.get_duration_string(gpx.get_moving_pace(), true);
            // infoDiv.querySelector(`.elevation-gain`).textContent = gpx.get_elevation_gain().toFixed(0);
            // infoDiv.querySelector(`.elevation-loss`).textContent = gpx.get_elevation_loss().toFixed(0);
            // infoDiv.querySelector(`.elevation-net`).textContent = (gpx.get_elevation_gain() - gpx.get_elevation_loss()).toFixed(0);
        }
    }).addTo(mapL);
    return mapL;
}

//-----------------------------Maps Stuff-----------------------------------

const sweden2024Overview = getStandardMap(19, 68, 7.3, 50, "gpx/Schweden2024_gesamt_processed.gpx", "sweden2024Overview");

const sweden2024_0 = getStandardLeafletMap("gpx/Schweden2024_Tag0_processed.gpx", 0, "sweden2024_0");
const sweden2024_1 = getStandardLeafletMap("gpx/Schweden2024_Tag1_processed.gpx", 1, "sweden2024_1");
const sweden2024_2 = getStandardLeafletMap("gpx/Schweden2024_Tag2_processed.gpx", 2, "sweden2024_2");
const sweden2024_3 = getStandardLeafletMap("gpx/Schweden2024_Tag3_processed.gpx", 3, "sweden2024_3");
const sweden2024_4 = getStandardLeafletMap("gpx/Schweden2024_Tag4_processed.gpx", 4, "sweden2024_4");
const sweden2024_5 = getStandardLeafletMap("gpx/Schweden2024_Tag5_processed.gpx", 5, "sweden2024_5");
const sweden2024_6 = getStandardLeafletMap("gpx/Schweden2024_Tag6_processed.gpx", 6, "sweden2024_6");
const sweden2024_7 = getStandardLeafletMap("gpx/Schweden2024_Tag7_processed.gpx", 7, "sweden2024_7");
const sweden2024_8 = getStandardLeafletMap("gpx/Schweden2024_Tag8_processed.gpx", 8, "sweden2024_8");
const sweden2024_9 = getStandardLeafletMap("gpx/Schweden2024_Tag9_processed.gpx", 9, "sweden2024_9");
const sweden2024_10 = getStandardLeafletMap("gpx/Schweden2024_Tag10_processed.gpx", 10, "sweden2024_10");
