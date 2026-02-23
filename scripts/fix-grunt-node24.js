/**
 * Patch grunt-legacy-util for Node.js 22+ compatibility.
 *
 * util.isError() was deprecated in Node.js 12 and removed in Node.js 22.
 * grunt-legacy-util@2.0.1 (latest) still calls nodeUtil.isError() in its
 * util.error() helper, which is used throughout grunt internals for error
 * wrapping (config errors, file I/O errors, etc.).
 *
 * This script replaces the call with an equivalent `instanceof Error` check.
 * It is idempotent — running it multiple times is safe.
 *
 * Upstream issue: https://github.com/gruntjs/grunt-legacy-util/issues/...
 * Remove this script once grunt-legacy-util ships a fix.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'grunt-legacy-util', 'index.js');

if (!fs.existsSync(target)) {
    // Not installed yet (e.g. first run before node_modules exist) — skip silently.
    process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');

const OLD = 'if (!nodeUtil.isError(err)) { err = new Error(err); }';
const NEW = 'if (!(err instanceof Error)) { err = new Error(err); } /* patched: util.isError removed in Node.js 22 */';

if (src.includes(NEW)) {
    console.log('[fix-grunt-node24] grunt-legacy-util already patched — skipping.');
    process.exit(0);
}

if (!src.includes(OLD)) {
    console.warn('[fix-grunt-node24] WARNING: Expected pattern not found in grunt-legacy-util/index.js — the package may have been updated. Review this script.');
    process.exit(0);
}

src = src.replace(OLD, NEW);
fs.writeFileSync(target, src, 'utf8');
console.log('[fix-grunt-node24] Patched grunt-legacy-util for Node.js 22+ compatibility.');
