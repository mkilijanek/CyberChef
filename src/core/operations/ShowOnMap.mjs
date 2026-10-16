/**
 * @author j433866 [j433866@gmail.com]
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {FORMATS, convertCoordinates} from "../lib/ConvertCoordinates.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Show on map operation
 */
class ShowOnMap extends Operation {

    /**
     * ShowOnMap constructor
     */
    constructor() {
        super();

        this.name = "Show on map";
        this.module = "Hashing";
        this.description = "Displays co-ordinates on a slippy map.<br><br>Co-ordinates will be converted to decimal degrees before being shown on the map.<br><br>Supported formats:<ul><li>Degrees Minutes Seconds (DMS)</li><li>Degrees Decimal Minutes (DDM)</li><li>Decimal Degrees (DD)</li><li>Geohash</li><li>Military Grid Reference System (MGRS)</li><li>Ordnance Survey National Grid (OSNG)</li><li>Universal Transverse Mercator (UTM)</li></ul><br>This operation will not work offline.";
        this.infoURL = "https://osmfoundation.org/wiki/Terms_of_Use";
        this.inputType = "string";
        this.outputType = "string";
        this.presentType = "html";
        this.args = [
            {
                name: "Zoom Level",
                type: "number",
                value: 13
            },
            {
                name: "Input Format",
                type: "option",
                value: ["Auto"].concat(FORMATS),
                allowEmpty: false
            },
            {
                name: "Input Delimiter",
                type: "option",
                value: [
                    "Auto",
                    "Direction Preceding",
                    "Direction Following",
                    "\\n",
                    "Comma",
                    "Semi-colon",
                    "Colon"
                ],
                allowEmpty: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.replace(/\s+/g, "") !== "") {
            const inFormat = args[1],
                inDelim = args[2];
            let latLong;
            try {
                latLong = convertCoordinates(input, inFormat, inDelim, "Decimal Degrees", "Comma", "None", 5);
            } catch (error) {
                throw new OperationError(error);
            }
            latLong = latLong.replace(/[,]$/, "");
            latLong = latLong.replace(/°/g, "");

            // The map requires a latitude and longitude pair. If the conversion only produced a
            // single value (e.g. because the chosen input delimiter didn't match the input), bail
            // out with a helpful message rather than passing it on to the map, which would throw an
            // uncaught TypeError in the browser.
            const coords = latLong.split(",").map(v => v.trim());
            if (coords.length !== 2 || coords.some(v => v === "" || isNaN(Number(v)))) {
                throw new OperationError(`Could not show coordinates '${latLong}' on the map. Expected a latitude and longitude pair - check that the input format and delimiter are correct.`);
            }

            return latLong;
        }
        return input;
    }

    /**
     * @param {string} data
     * @param {Object[]} args
     * @returns {string}
     */
    async present(data, args) {
        if (data.replace(/\s+/g, "") === "") {
            data = "0, 0";
        }
        const coords = data.split(",").map(v => v.trim());
        const lat = Number(coords[0]),
            lng = Number(coords[1]),
            zoom = Number(args[0]);
        if (coords.length !== 2 || coords.some(v => v === "") || !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) {
            return Utils.escapeHtml(data);
        }

        // The map is created by the web app (src/web/utils/htmlOutputWidgets.mjs) from these data attributes
        return `<style>
    #output-text .cm-content,
    #output-text .cm-line,
    #output-html {
        padding: 0;
        white-space: normal;
    }
</style>
<div id="presentedMap" data-map data-lat="${lat}" data-lng="${lng}" data-zoom="${zoom}" style="width: 100%; height: 100%;"></div>`;
    }
}

export default ShowOnMap;
