/**
 * Initialises interactive widgets in HTML operation output.
 *
 * Operations describe widgets declaratively with data-* attributes rather than
 * embedding <script> blocks, so no operation-supplied code is ever executed.
 *
 * @author mkilijanek
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import * as CanvasComponents from "../../core/lib/CanvasComponents.mjs";

const LEAFLET_JS = {
    url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
    integrity: "sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH"
};
const LEAFLET_CSS = {
    url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    integrity: "sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"
};
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION = "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors";

/**
 * Parses a JSON data attribute, returning undefined if it is absent or invalid
 *
 * @param {Element} el
 * @param {string} name
 * @returns {*}
 */
function jsonAttr(el, name) {
    try {
        return JSON.parse(el.getAttribute(name));
    } catch (err) {
        return undefined;
    }
}

/**
 * Reads a finite number from a data attribute
 *
 * @param {Element} el
 * @param {string} name
 * @returns {number|undefined}
 */
function numAttr(el, name) {
    const val = el.getAttribute(name);
    if (val === null || val.trim() === "") return undefined;
    const num = Number(val);
    return Number.isFinite(num) ? num : undefined;
}

/**
 * Returns the bounding rectangle of the scroller containing the element
 *
 * @param {Element} el
 * @returns {DOMRect}
 */
function scrollerRect(el) {
    return (el.closest(".cm-scroller") || el.parentElement).getBoundingClientRect();
}

/**
 * Draws bar charts for canvases with data-chart="bar" and data-scores="[...]"
 *
 * @param {Element} root
 */
function initBarCharts(root) {
    root.querySelectorAll("canvas[data-chart='bar']").forEach(canvas => {
        const scores = jsonAttr(canvas, "data-scores");
        if (!Array.isArray(scores) || !scores.every(Number.isFinite)) return;
        const rect = scrollerRect(canvas);
        canvas.width = rect.width * 0.95;
        canvas.height = rect.height * 0.9;
        CanvasComponents.drawBarChart(canvas, scores, "Byte", "Frequency %", 16, 6);
    });
}

/**
 * Draws scale bars for canvases with data-chart="scale", data-value, data-max,
 * data-height-ratio, optional data-max-height and data-markings="[...]"
 *
 * @param {Element} root
 */
function initScaleBars(root) {
    root.querySelectorAll("canvas[data-chart='scale']").forEach(canvas => {
        const value = numAttr(canvas, "data-value"),
            max = numAttr(canvas, "data-max"),
            ratio = numAttr(canvas, "data-height-ratio") ?? 0.25,
            maxHeight = numAttr(canvas, "data-max-height"),
            markings = jsonAttr(canvas, "data-markings");
        if (value === undefined || max === undefined || !Array.isArray(markings)) return;

        const rect = scrollerRect(canvas);
        let height = rect.height * ratio;
        if (maxHeight !== undefined && height > maxHeight) height = maxHeight;
        canvas.width = rect.width * 0.95;
        canvas.height = height;
        CanvasComponents.drawScaleBar(canvas, Math.min(value, max), max, markings);
    });
}

/**
 * Initialises colour pickers for elements with data-colorpicker and data-colour
 *
 * @param {Element} root
 * @param {App} app
 */
function initColourPickers(root, app) {
    root.querySelectorAll("[data-colorpicker]").forEach(el => {
        $(el).colorpicker({
            format: "rgba",
            color: el.getAttribute("data-colour"),
            container: true,
            inline: true,
            useAlpha: true
        }).on("colorpickerChange", function(e) {
            const color = e.color.string("rgba");
            app.manager.input.setInput(color);
            app.manager.input.inputChange(new Event("keyup"));
        });
    });
}

let leafletPromise = null;

/**
 * Loads Leaflet (JS and CSS) once, pinned with Subresource Integrity
 *
 * @returns {Promise}
 */
function loadLeaflet() {
    if (leafletPromise) return leafletPromise;

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = LEAFLET_CSS.url;
    css.integrity = LEAFLET_CSS.integrity;
    css.crossOrigin = "anonymous";
    document.head.appendChild(css);

    leafletPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.integrity = LEAFLET_JS.integrity;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve(window.L);
        script.onerror = () => {
            leafletPromise = null;
            reject(new Error("Could not load Leaflet"));
        };
        script.src = LEAFLET_JS.url;
        document.body.appendChild(script);
    });
    return leafletPromise;
}

/**
 * Creates maps for elements with data-map, data-lat, data-lng and data-zoom
 *
 * @param {Element} root
 */
function initMaps(root) {
    root.querySelectorAll("[data-map]").forEach(el => {
        const lat = numAttr(el, "data-lat"),
            lng = numAttr(el, "data-lng"),
            zoom = numAttr(el, "data-zoom");
        if (lat === undefined || lng === undefined || zoom === undefined) return;

        loadLeaflet().then(L => {
            const map = L.map(el).setView([lat, lng], zoom);
            L.tileLayer(OSM_TILE_URL, {attribution: OSM_ATTRIBUTION}).addTo(map);
            L.marker([lat, lng]).addTo(map)
                .bindPopup(`${lat},${lng}`)
                .openPopup();
        }).catch(err => log.error(err));
    });
}

/**
 * Initialises all widgets in rendered HTML output
 *
 * @param {Element} root - The rendered output element
 * @param {App} app
 */
export function initHtmlOutputWidgets(root, app) {
    if (!root) return;
    $(root).find("[data-toggle='tooltip']").tooltip();
    initBarCharts(root);
    initScaleBars(root);
    initColourPickers(root, app);
    initMaps(root);
}
