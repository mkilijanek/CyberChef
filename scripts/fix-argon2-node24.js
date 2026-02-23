/**
 * Patch argon2-browser for Node.js 22+ compatibility.
 *
 * Root cause: argon2-browser@1.18.0 ships an Emscripten-compiled
 * dist/argon2.js whose `instantiateAsync()` function tries to use the
 * Fetch API + WebAssembly.instantiateStreaming() when both are available —
 * but it never checks whether it is running in a Node.js environment.
 *
 * In Node.js 22+ the native `fetch` is globally available, so the condition:
 *
 *   !isFileURI(wasmBinaryFile) && typeof fetch === "function"
 *
 * evaluates to TRUE, and `fetch("/absolute/path/argon2.wasm")` is called.
 * Node.js 22+ enforces strict URL parsing in fetch() and rejects plain
 * filesystem paths, throwing:
 *
 *   TypeError: Failed to parse URL from .../argon2-browser/dist/argon2.wasm
 *
 * The fix: insert `!ENVIRONMENT_IS_NODE &&` into that condition so the
 * streaming code path is only taken in a real browser/worker environment.
 * When in Node.js the module falls through to `instantiateArrayBuffer()`
 * which uses `readBinary()` / `fs.readFileSync()` — working correctly.
 *
 * This script is idempotent — running it multiple times is safe.
 *
 * Upstream issue: https://github.com/nicktindall/cyclon.p2p-common/issues/...
 * Remove once argon2-browser ships a Node.js 22-compatible release.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const target = path.join(
    __dirname, '..', 'node_modules', 'argon2-browser', 'dist', 'argon2.js'
);

if (!fs.existsSync(target)) {
    // Not installed yet — skip silently.
    process.exit(0);
}

// Guard against symlink attacks: verify the resolved path stays within node_modules
const expectedBase = path.resolve(path.join(__dirname, '..', 'node_modules'));
try {
    const realTarget = fs.realpathSync.native(target);
    if (!realTarget.startsWith(expectedBase + path.sep)) {
        console.error('[fix-argon2-node24] Path escapes node_modules boundary — aborting.');
        process.exit(1);
    }
} catch (e) {
    console.error('[fix-argon2-node24] Could not resolve realpath — aborting.', e.message);
    process.exit(1);
}

let src = fs.readFileSync(target, 'utf8');

const OLD = '!isFileURI(wasmBinaryFile)&&typeof fetch';
const NEW = '!isFileURI(wasmBinaryFile)&&!ENVIRONMENT_IS_NODE&&typeof fetch /* patched: skip fetch in Node.js 22+ */';

if (src.includes(NEW)) {
    console.log('[fix-argon2-node24] argon2-browser already patched — skipping.');
    process.exit(0);
}

if (!src.includes(OLD)) {
    console.warn('[fix-argon2-node24] WARNING: Expected pattern not found in argon2-browser/dist/argon2.js — the package may have been updated. Review this script.');
    process.exit(0);
}

src = src.replace(OLD, NEW);
fs.writeFileSync(target, src, 'utf8');
console.log('[fix-argon2-node24] Patched argon2-browser for Node.js 22+ compatibility.');
