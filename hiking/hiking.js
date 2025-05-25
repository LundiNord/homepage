//-----------------------------Leaflet Stuff-----------------------------------
const maptilerKey="RgWztKV67Y0eRGFsVKdQ";
const mapyKey = 'rccMtaCSe-oceaqh2GUTvxdpvqUZcFlNYyR8wrJAsh0';  //https://developer.mapy.cz/account/projects

//gpxTrack: gpx filepath; containerID: ID of the div where the map should be placed; day: day from the stats div
export function getStandardLeafletMap(containerID) {
    const mapL = L.map(containerID, {
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topleft'
        }
    });
    //L.tileLayer('https://b.tile.opentopomap.org/{z}/{x}/{y}.png', {
    const openTopo = L.tileLayer('https://tile.nyxnord.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Daten:  &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Darstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" >CC-BY-SA</a>)'
    }).addTo(mapL);
    // let thunderforest = L.tileLayer('https://tile.thunderforest.nyxnord.de/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: 'Maps &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    // });
    const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18,
        });
    const Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });
    const MapTilerSatelite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}@2x.jpg?key=${maptilerKey}`, {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    });
    const MapTilerTopo = L.tileLayer(`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}@2x.png?key=${maptilerKey}`, {
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    });
    const MapTilerTopoVector = L.maplibreGL({
        style: `https://api.maptiler.com/maps/topo/style.json?key=${maptilerKey}`,
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    });
    const MapTilerSatVector = L.maplibreGL({
        style: `https://api.maptiler.com/maps/satellite/style.json?key=${maptilerKey}`,
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
    });
    const MapyBasic = L.tileLayer(`https://api.mapy.cz/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${mapyKey}`, {
        minZoom: 0,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    });
    const MapyOutdoor = L.tileLayer(`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${mapyKey}`, {
        minZoom: 0,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    });
    const MapyOutdoorWinter = L.tileLayer(`https://api.mapy.cz/v1/maptiles/winter/256/{z}/{x}/{y}?apikey=${mapyKey}`, {
        minZoom: 0,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    });
    const MapySatelite = L.tileLayer(`https://api.mapy.cz/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${mapyKey}`, {
        minZoom: 0,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.cz/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    });
    const OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const baseMaps = {
        "OpenTopoMap": openTopo,
        //"Thunderforest Outdoors": thunderforest,
        "Esri Satellite": satellite,
        "Esri Topo": Esri_WorldTopoMap,
        "MapTiler Satellite": MapTilerSatelite,
        "MapTiler Topo": MapTilerTopo,
        "MapTiler Satellite Vector": MapTilerSatVector,
        "MapTiler Topo Vector": MapTilerTopoVector,
        "Mapy.cz Basic": MapyBasic,
        "Mapy.cz Outdoor": MapyOutdoor,
        "Mapy.cz Outdoor Winter": MapyOutdoorWinter,
        "Mapy.cz Satellite": MapySatelite,
        "OpenStreetMap": OpenStreetMap,
    };
    const control = L.control.layers(baseMaps, null).addTo(mapL);
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
    const mapL = getStandardLeafletMap(containerID);
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };
    new L.GPX(gpxTrack, options, { //using https://github.com/mpetazzoni/leaflet-gpx
        async: true,
    }).on('loaded', function(e) {
        let gpx = e.target;
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
