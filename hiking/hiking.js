
//-----------------------------Leaflet Stuff-----------------------------------

//gpxTrack: gpx filepath; containerID: ID of the div where the map should be placed; day: day from the stats div
export function getStandardLeafletMap(containerID) {
    let mapL = L.map(containerID, {
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topleft'
        }
    });
    //L.tileLayer('https://b.tile.opentopomap.org/{z}/{x}/{y}.png', {
    let openTopo = L.tileLayer('https://tile.nyxnord.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Daten:  &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Darstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" >CC-BY-SA</a>)'
    }).addTo(mapL);
    let thunderforest = L.tileLayer('https://tile.thunderforest.nyxnord.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Maps &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    let satelite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18,
        });
    var baseMaps = {
        "OpenTopoMap": openTopo,
        //"Thunderforest Outdoors": thunderforest,
        "Esri Satellite": satelite
    };
    let control = L.control.layers(baseMaps, null).addTo(mapL);
    L.control.scale({ imperial: false }).addTo(mapL);
    //some Analytics
    mapL.on('enterFullscreen', function () {
        umami.track('Entered fullscreen');
    });
    mapL.on('exitFullscreen', function () {
        umami.track('Exited fullscreen');
    });
    return mapL;
}

export function getGPXLeafletMap(gpxTrack, day, containerID) {
    let mapL = getStandardLeafletMap(containerID);
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };
    new L.GPX(gpxTrack, options, { //using https://github.com/mpetazzoni/leaflet-gpx
        async: true,
    }).on('loaded', function(e) {
        var gpx = e.target;
        mapL.fitBounds(gpx.getBounds());
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

// document.addEventListener("DOMContentLoaded", () =>{
//     const sweden2024Overview = getGPXLeafletMap("gpx/Schweden2024_gesamt_processed.gpx", 20, "sweden2024Overview");
//
//     const sweden2024_0 = getGPXLeafletMap("gpx/Schweden2024_Tag0_processed.gpx", 0, "sweden2024_0");
//     const sweden2024_1 = getGPXLeafletMap("gpx/Schweden2024_Tag1_processed.gpx", 1, "sweden2024_1");
//     const sweden2024_2 = getGPXLeafletMap("gpx/Schweden2024_Tag2_processed.gpx", 2, "sweden2024_2");
//     const sweden2024_3 = getGPXLeafletMap("gpx/Schweden2024_Tag3_processed.gpx", 3, "sweden2024_3");
//     const sweden2024_4 = getGPXLeafletMap("gpx/Schweden2024_Tag4_processed.gpx", 4, "sweden2024_4");
//     const sweden2024_5 = getGPXLeafletMap("gpx/Schweden2024_Tag5_processed.gpx", 5, "sweden2024_5");
//     const sweden2024_6 = getGPXLeafletMap("gpx/Schweden2024_Tag6_processed.gpx", 6, "sweden2024_6");
//     const sweden2024_7 = getGPXLeafletMap("gpx/Schweden2024_Tag7_processed.gpx", 7, "sweden2024_7");
//     const sweden2024_8 = getGPXLeafletMap("gpx/Schweden2024_Tag8_processed.gpx", 8, "sweden2024_8");
//     const sweden2024_9 = getGPXLeafletMap("gpx/Schweden2024_Tag9_processed.gpx", 9, "sweden2024_9");
//     const sweden2024_10 = getGPXLeafletMap("gpx/Schweden2024_Tag10_processed.gpx", 10, "sweden2024_10");
// });
