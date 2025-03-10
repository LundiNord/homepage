import { getGPXLeafletMap } from './hiking.minified.js';

document.addEventListener("DOMContentLoaded", () =>{
    const sweden2024Overview = getGPXLeafletMap("gpx/Schweden2024_gesamt_processed.gpx", 20, "sweden2024Overview");
    const sweden2024_0 = getGPXLeafletMap("gpx/Schweden2024_Tag0_processed.gpx", 0, "sweden2024_0");
    const sweden2024_1 = getGPXLeafletMap("gpx/Schweden2024_Tag1_processed.gpx", 1, "sweden2024_1");
    const sweden2024_2 = getGPXLeafletMap("gpx/Schweden2024_Tag2_processed.gpx", 2, "sweden2024_2");
    const sweden2024_3 = getGPXLeafletMap("gpx/Schweden2024_Tag3_processed.gpx", 3, "sweden2024_3");
    const sweden2024_4 = getGPXLeafletMap("gpx/Schweden2024_Tag4_processed.gpx", 4, "sweden2024_4");
    const sweden2024_5 = getGPXLeafletMap("gpx/Schweden2024_Tag5_processed.gpx", 5, "sweden2024_5");
    const sweden2024_6 = getGPXLeafletMap("gpx/Schweden2024_Tag6_processed.gpx", 6, "sweden2024_6");
    const sweden2024_7 = getGPXLeafletMap("gpx/Schweden2024_Tag7_processed.gpx", 7, "sweden2024_7");
    const sweden2024_8 = getGPXLeafletMap("gpx/Schweden2024_Tag8_processed.gpx", 8, "sweden2024_8");
    const sweden2024_9 = getGPXLeafletMap("gpx/Schweden2024_Tag9_processed.gpx", 9, "sweden2024_9");
    const sweden2024_10 = getGPXLeafletMap("gpx/Schweden2024_Tag10_processed.gpx", 10, "sweden2024_10");
});
