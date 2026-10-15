/**
 * Show on map tests
 *
 * @author Leon Zandman [leon@wirwar.com]
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Show on map: valid coordinate pair",
        input: "51.5007, -0.1246",
        // The presented output declares the map via data attributes; the web app creates it.
        // (TestRegister passes if ANY of expectedOutput/expectedMatch/unexpectedMatch holds, so the
        // "no script" condition is folded into a single pattern.)
        expectedMatch: /^(?![\s\S]*<\s*script)[\s\S]*data-map data-lat="51\.5007" data-lng="-0\.1246" data-zoom="13"/i,
        recipeConfig: [
            {
                op: "Show on map",
                args: [13, "Auto", "Auto"]
            },
        ],
    },
    {
        // Regression test: a comma-separated input with the delimiter set to "\n" used to be
        // mis-detected as a single Degrees Decimal Minutes value (1° 24' = 1.4°), producing a single
        // coordinate. That single value was then passed to Leaflet's setView([1.4], ...), throwing
        // an uncaught "Cannot read properties of null (reading 'lat')" TypeError in the browser.
        name: "Show on map: single value is rejected with a helpful error",
        input: "1, 24",
        expectedOutput: "Could not show coordinates '1.4' on the map. Expected a latitude and longitude pair - check that the input format and delimiter are correct.",
        recipeConfig: [
            {
                op: "Show on map",
                args: [13, "Auto", "\\n"]
            },
        ],
    },
    {
        name: "Show on map: empty input format is rejected",
        input: "1, 24",
        expectedOutput: "Input Format cannot be empty.",
        recipeConfig: [
            {
                op: "Show on map",
                args: [13, "", "Auto"]
            },
        ],
    },
    {
        name: "Show on map: empty input delimiter is rejected",
        input: "1, 24",
        expectedOutput: "Input Delimiter cannot be empty.",
        recipeConfig: [
            {
                op: "Show on map",
                args: [13, "Auto", ""]
            },
        ],
    },
]);
