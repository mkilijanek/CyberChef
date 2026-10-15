/**
 * Generates the nginx configuration for the Docker image from docker/nginx.conf.template.
 *
 * The Content-Security-Policy script-src directive must list a SHA-256 hash for
 * every inline <script> block in the built HTML pages. Those blocks change with
 * the build, so the hashes are computed here from the actual build output rather
 * than being hard-coded.
 *
 * Usage: node scripts/generate-nginx-conf.mjs <build-dir> <template> <output>
 *
 * @license Apache-2.0
 */

/* eslint-disable no-console */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const INLINE_HANDLER_RE = /\son[a-z]+\s*=\s*"([^"]*)"/gi;
const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;

/**
 * Hashes script text the way a browser does. In XML documents (SVG) a CDATA section's delimiters are
 * not part of the script's text content, so they are removed before hashing.
 *
 * @param {string} body
 * @returns {string}
 */
function hashSource(body) {
    const text = body.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
    return `'sha256-${crypto.createHash("sha256").update(text, "utf8").digest("base64")}'`;
}

/**
 * Returns the CSP hash sources ('sha256-...') of all inline scripts in an HTML string
 *
 * @param {string} html
 * @returns {string[]}
 */
export function inlineScriptHashes(html) {
    const hashes = [];
    for (const match of html.matchAll(INLINE_SCRIPT_RE)) {
        const body = match[1];
        if (body.trim() === "") continue;
        hashes.push(hashSource(body));
    }
    return hashes;
}

/**
 * Returns the CSP hash sources of all inline event handler attributes (e.g. onload="...")
 *
 * @param {string} markup
 * @returns {string[]}
 */
export function inlineHandlerHashes(markup) {
    return [...markup.matchAll(INLINE_HANDLER_RE)].map(m => hashSource(m[1]));
}

/**
 * Returns the decoded SVG documents embedded as data: URIs in an HTML string. The Bombe loading
 * animation is loaded this way in an <object> and inherits the page's policy, so its inline
 * script and event handler need hashes too.
 *
 * @param {string} html
 * @returns {string[]}
 */
export function embeddedSvgs(html) {
    return [...html.matchAll(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/g)]
        .map(m => Buffer.from(m[1], "base64").toString("utf8"));
}

/**
 * Collects the unique inline script hashes of every top-level app .html file in a directory,
 * including those of the SVG documents embedded in them.
 *
 * Event handler attributes are only honoured by browsers with 'unsafe-hashes', which is
 * returned in `unsafeHashes` when any handler hash was added.
 *
 * @param {string} buildDir
 * @returns {{hashes: string[], unsafeHashes: boolean}}
 */
export function collectHashes(buildDir) {
    const hashes = new Set();
    let unsafeHashes = false;
    const files = fs.readdirSync(buildDir)
        // Only the app pages; skip e.g. BundleAnalyzerReport.html
        .filter(file => /^(index|CyberChef_.*)\.html$/.test(file))
        .map(file => path.join(buildDir, file));
    for (const file of files) {
        const html = fs.readFileSync(file, "utf8");
        for (const markup of [html, ...embeddedSvgs(html)]) {
            inlineScriptHashes(markup).forEach(h => hashes.add(h));
            const handlers = inlineHandlerHashes(markup);
            if (handlers.length) unsafeHashes = true;
            handlers.forEach(h => hashes.add(h));
        }
    }
    return {hashes: [...hashes].sort(), unsafeHashes};
}

/**
 * Renders the template by substituting the inline script hashes
 *
 * @param {string} template
 * @param {string[]} hashes
 * @param {boolean} [unsafeHashes=false]
 * @returns {string}
 */
export function renderConf(template, hashes, unsafeHashes=false) {
    if (!template.includes("__INLINE_SCRIPT_HASHES__")) {
        throw new Error("Template does not contain the __INLINE_SCRIPT_HASHES__ placeholder");
    }
    const sources = (unsafeHashes ? ["'unsafe-hashes'"] : []).concat(hashes);
    return template.replace("__INLINE_SCRIPT_HASHES__", sources.join(" "));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
    const [buildDir, templatePath, outputPath] = process.argv.slice(2);
    if (!buildDir || !templatePath || !outputPath) {
        console.error("Usage: node scripts/generate-nginx-conf.mjs <build-dir> <template> <output>");
        process.exit(1);
    }
    const {hashes, unsafeHashes} = collectHashes(buildDir);
    if (hashes.length === 0) {
        console.error(`No inline scripts found in ${buildDir}; refusing to emit a CSP that would block the app's own startup code`);
        process.exit(1);
    }
    fs.writeFileSync(outputPath, renderConf(fs.readFileSync(templatePath, "utf8"), hashes, unsafeHashes));
    console.log(`Wrote ${outputPath} with ${hashes.length} inline script hash(es)`);
}
