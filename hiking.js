import { gpx } from "https://unpkg.com/@tmcw/togeojson?module";
let accessToken = 'pk.eyJ1Ijoibnl4bm9yZCIsImEiOiJjbTdkZDZoeGswMXpkMmlzYjZzYnNuMGthIn0.bHJF97xa3uu3Vr4xj4tgWQ';

function _c(id) {
    return document.getElementById(id);
}

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

//gpxTrack: gpx filepath; containerID: ID of the div where the map should be placed; number: number from the stats id
function getStandardLeafletMap(gpxTrack, number, containerID) {
    var mapL = L.map(containerID);
    L.tileLayer('https://b.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Daten:  &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Darstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" >CC-BY-SA</a>)'
    }).addTo(mapL);
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };
    var control = L.control.layers(null, null).addTo(mapL);
    new L.GPX(gpxTrack, options, { //using https://github.com/mpetazzoni/leaflet-gpx
        async: true,
    }).on('loaded', function(e) {
        var gpx = e.target;
        mapL.fitBounds(gpx.getBounds());
        control.addOverlay(gpx, gpx.get_name());
        _c('distance' + number).textContent = (gpx.get_distance() / 1000).toFixed(2);
        _c('duration' + number).textContent = gpx.get_duration_string(gpx.get_moving_time());
        _c('pace' + number).textContent = gpx.get_duration_string(gpx.get_moving_pace(), true);
        _c('elevation-gain' + number).textContent = gpx.get_elevation_gain().toFixed(0);
        _c('elevation-loss' + number).textContent = gpx.get_elevation_loss().toFixed(0);
        _c('elevation-net' + number).textContent = (gpx.get_elevation_gain() - gpx.get_elevation_loss()).toFixed(0);
    }).addTo(mapL);
    return mapL;
}

//-----------------------------Maps Stuff-----------------------------------

const sweden2024Overview = getStandardMap(19, 68, 7.3, 50, "gpx/Schweden2024_gesamt_processed.gpx", "sweden2024Overview");

//const sweden2024_1 = getStandardMap(19, 68, 11, 15, "gpx/Schweden2024_Tag0_processed.gpx", "sweden2024_0");
//const sweden2024_2 = getStandardMap(19, 68, 11, 15, "gpx/Schweden2024_Tag1_processed.gpx", "sweden2024_1");

const sweden2024_0 = getStandardLeafletMap("gpx/Schweden2024_Tag0_processed.gpx", 1, "sweden2024_0");

