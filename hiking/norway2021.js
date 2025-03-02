import { getGPXLeafletMap } from './hiking.minified.js';

document.addEventListener("DOMContentLoaded", () =>{
    const norway2021Overview = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_gesamt_processed.gpx", 20, "norway2021Overview");
    const norway2021Day1 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag1_processed.gpx", 1, "norway2021_1");
    const norway2021Day2 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag2_processed.gpx", 2, "norway2021_2");
    const norway2021Day3 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag3_processed.gpx", 3, "norway2021_3");
    const norway2021Day4 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag4_processed.gpx", 4, "norway2021_4");
    const norway2021Day5 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag5_processed.gpx", 5, "norway2021_5");
    const norway2021Day6 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag6_processed.gpx", 6, "norway2021_6");
    const norway2021Day7 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag7_processed.gpx", 7, "norway2021_7");
    const norway2021Day8 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag8_processed.gpx", 8, "norway2021_8");
    const norway2021Day9 = getGPXLeafletMap("gpx/Norwegen2021/Norwegen2021_Tag9_processed.gpx", 9, "norway2021_9");
});
