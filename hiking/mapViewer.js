import {getStandardLeafletMap} from "./hiking.js";

const bigMap = getStandardLeafletMap("big-map");
bigMap.setView([50.0, 10.0], 3);
L.control.locate().addTo(bigMap);
