/**
 * Regression tests: HTML output must not contain executable <script> blocks.
 *
 * The web app no longer eval()s scripts found in operation output, so operations
 * declare their widgets with data-* attributes instead (see
 * src/web/utils/htmlOutputWidgets.mjs).
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

// TestRegister passes a test if ANY of expectedOutput/expectedMatch/unexpectedMatch holds, so
// each expectation is combined with "contains no <script" in a single expectedMatch pattern.
const noScriptAnd = pattern => new RegExp("^(?![\\s\\S]*<\\s*script)[\\s\\S]*" + pattern.source, "i");

TestRegister.addTests([
    {
        name: "HTML output: Entropy (Shannon scale) declares a scale bar and has no script",
        input: "The quick brown fox jumps over the lazy dog",
        expectedMatch: noScriptAnd(/data-chart="scale" data-value='[0-9.]+' data-max='8'/),
        recipeConfig: [{op: "Entropy", args: ["Shannon scale"]}],
    },
    {
        name: "HTML output: Frequency distribution declares a bar chart and has no script",
        input: "aabbbc",
        expectedMatch: noScriptAnd(/data-chart="bar" data-scores='\[/),
        recipeConfig: [{op: "Frequency distribution", args: [true, true]}],
    },
    {
        name: "HTML output: Index of Coincidence declares a scale bar and has no script",
        input: "The quick brown fox jumps over the lazy dog",
        expectedMatch: noScriptAnd(/data-chart="scale" data-value='[0-9.]+' data-max='0.25'/),
        recipeConfig: [{op: "Index of Coincidence", args: []}],
    },
    {
        name: "HTML output: Parse colour code declares a colour picker and has no script",
        input: "#d9edf7",
        expectedMatch: noScriptAnd(/data-colorpicker data-colour="rgba\(217, 237, 247, 1\)"/),
        recipeConfig: [{op: "Parse colour code", args: []}],
    },
    {
        name: "HTML output: Show Base64 offsets has no script",
        input: "Hello",
        expectedMatch: noScriptAnd(/Offset 0:/),
        recipeConfig: [{op: "Show Base64 offsets", args: ["A-Za-z0-9+/=", true, "Raw"]}],
    },
    {
        name: "HTML output: Magic has no script",
        input: "aGVsbG8gd29ybGQ=",
        expectedMatch: noScriptAnd(/Recipe \(click to load\)/),
        recipeConfig: [{op: "Magic", args: [3, false, false, ""]}],
    },
    {
        name: "HTML output: Show on map rejects non-numeric coordinates instead of emitting them",
        input: "1,2",
        unexpectedMatch: /data-map|<script/i,
        recipeConfig: [
            {op: "Find / Replace", args: [{option: "Regex", string: ".+"}, "1,2');alert(1);//", true, false, true, false]},
            {op: "Show on map", args: [13, "Auto", "Auto"]},
        ],
    },
]);
