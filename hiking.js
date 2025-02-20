import { gpx } from "https://unpkg.com/@tmcw/togeojson?module";

//-----------------------------Convert-----------------------------------

//from https://github.com/placemark/togeojson
fetch("gpx/test_processed.gpx")
    .then(function (response) {
        return response.text();
    })
    .then(function (xml) {
        const parsedGPX = new DOMParser().parseFromString(xml, "application/xml");
        const geojson = gpx(parsedGPX);
        map.on('load', () => {
            map.addSource('gpxData', {
                type: 'geojson',
                data: geojson
            });
            map.addLayer({
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


//-----------------------------Mapbox Stuff-----------------------------------

mapboxgl.accessToken = 'pk.eyJ1Ijoibnl4bm9yZCIsImEiOiJjbTdkNjEyOGYweHk4Mm1zZ3RoYXB2Mm5kIn0.pvXwp9Cj4S3ySC_0cpQP8w';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: [18.7502, 68.3371], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10, // starting zoom
    style: 'mapbox://styles/mapbox/outdoors-v12' // map style
});
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());
map.on('style.load', () => {
    map.setConfigProperty('basemap', 'lightPreset', 'dusk');
    // use an expression to transition some properties between zoom levels 11 and 13, preventing visibility when zoomed out
    const zoomBasedReveal = (value) => {
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
    map.setSnow({
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
