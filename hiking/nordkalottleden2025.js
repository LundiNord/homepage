import { getStandardLeafletMap, getGPXLeafletMap } from './hiking.minified.js';

function getGPXLeafletElevationMap(gpxTrack, containerID, infoDivID) {
    const mapL = getStandardLeafletMap(containerID);
    const options = {
        async: true,
        polyline_options: { color: 'red' },
    };

    var elevation_options = {
        // Default chart colors: theme lime-theme, magenta-theme, ...
        theme: "lightblue-theme",
        // Chart container outside/inside map container
        detached: true,
        // if (detached), the elevation chart container
        elevationDiv: infoDivID,
        // if (!detached) autohide chart profile on chart mouseleave
        autohide: false,
        // if (!detached) initial state of chart profile control
        collapsed: false,
        // if (!detached) control position on one of the map corners
        position: "topright",
        // Toggle close icon visibility
        closeBtn: false,
        // Autoupdate map center on chart mouseover.
        followMarker: true,
        // Autoupdate map bounds on chart update.
        autofitBounds: true,
        // Chart distance/elevation units.
        imperial: false,
        // [Lat, Long] vs [Long, Lat] points. (leaflet default: [Lat, Long])
        reverseCoords: false,
        // Acceleration chart profile: true || "summary" || "disabled" || false
        acceleration: false,
        // Slope chart profile: true || "summary" || "disabled" || false
        slope: false,
        // Speed chart profile: true || "summary" || "disabled" || false
        speed: false,
        // Altitude chart profile: true || "summary" || "disabled" || false
        altitude: true,
        // Display time info: true || "summary" || false
        time: true,
        // Display distance info: true || "summary" || false
        distance: true,
        // Summary track info style: "inline" || "multiline" || false
        summary: 'multiline',
        // Download link: "link" || false || "modal"
        downloadLink: "link",
        // Toggle chart ruler filter
        ruler: true,
        // Toggle chart legend filter
        legend: true,
        // Toggle "leaflet-almostover" integration
        almostOver: false,
        // Toggle "leaflet-distance-markers" integration
        distanceMarkers: true,
        // Toggle "leaflet-edgescale" integration
        edgeScale: false,
        // Toggle "leaflet-hotline" integration
        hotline: true,
        // Display track datetimes: true || false
        timestamps: false,
        // Display track waypoints: true || "markers" || "dots" || false
        waypoints: true,
        // Toggle custom waypoint icons: true || { associative array of <sym> tags } || false
        wptIcons: {
            '': L.divIcon({
                className: 'elevation-waypoint-marker',
                html: '<i class="elevation-waypoint-icon"></i>',
                iconSize: [30, 30],
                iconAnchor: [8, 30],
            }),
        },
        // Toggle waypoint labels: true || "markers" || "dots" || false
        wptLabels: true,
        // Render chart profiles as Canvas or SVG Paths
        preferCanvas: true,
    };
    // Instantiate elevation control.
    var controlElevation = L.control.elevation(elevation_options).addTo(mapL);
    controlElevation.load(gpxTrack);
    return mapL;
}

document.addEventListener("DOMContentLoaded", () =>{
    const nordkalottleden2025Overview = getGPXLeafletMap("gpx/Nordkalottleden2025/Nordkalottleden2025_gesamt.gpx", 0, "nordkalottleden2025Overview");
    const nordkalottleden2025Day1 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden01_processed.gpx", "nordkalottleden2025_1_map", "#info_01");
    const nordkalottleden2025Day2 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden02_processed.gpx", "nordkalottleden2025_2_map", "#info_02");
    const nordkalottleden2025Day3 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden03_processed.gpx", "nordkalottleden2025_3_map", "#info_03");
    const nordkalottleden2025Day4 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden04_processed.gpx", "nordkalottleden2025_4_map", "#info_04");
    const nordkalottleden2025Day5 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden05_processed.gpx", "nordkalottleden2025_5_map", "#info_05");
    const nordkalottleden2025Day6 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden06_processed.gpx", "nordkalottleden2025_6_map", "#info_06");
    const nordkalottleden2025Day7 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden07_processed.gpx", "nordkalottleden2025_7_map", "#info_07");
    const nordkalottleden2025Day8 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden08_processed.gpx", "nordkalottleden2025_8_map", "#info_08");
    const nordkalottleden2025Day9 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden09_processed.gpx", "nordkalottleden2025_9_map", "#info_09");
    const nordkalottleden2025Day10 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden10_processed.gpx", "nordkalottleden2025_10_map", "#info_10");
    const nordkalottleden2025Day11 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden11_processed.gpx", "nordkalottleden2025_11_map", "#info_11");
    const nordkalottleden2025Day12 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden12_processed.gpx", "nordkalottleden2025_12_map", "#info_12");
    const nordkalottleden2025Day13 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden13_processed.gpx", "nordkalottleden2025_13_map", "#info_13");
    const nordkalottleden2025Day14 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden14_processed.gpx", "nordkalottleden2025_14_map", "#info_14");
    const nordkalottleden2025Day15 = getGPXLeafletElevationMap("gpx/Nordkalottleden2025/Nordkalottleden15_processed.gpx", "nordkalottleden2025_15_map", "#info_15");
});
