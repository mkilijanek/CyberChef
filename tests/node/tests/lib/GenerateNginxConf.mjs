/**
 * Tests for scripts/generate-nginx-conf.mjs, which builds the Docker image's CSP.
 *
 * @license Apache-2.0
 */
import assert from "assert";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import it from "../../assertionHandler.mjs";
import TestRegister from "../../../lib/TestRegister.mjs";
import {
    inlineScriptHashes,
    inlineHandlerHashes,
    embeddedSvgs,
    collectHashes,
    renderConf
} from "../../../../scripts/generate-nginx-conf.mjs";

const sha = text => `'sha256-${crypto.createHash("sha256").update(text, "utf8").digest("base64")}'`;

TestRegister.addApiTests([
    it("generate-nginx-conf: hashes inline scripts but not external ones or empty blocks", () => {
        const html = `<script>var a = 1;</script><script defer src="assets/main.js"></script><script type="text/javascript"> </script>`;
        assert.deepStrictEqual(inlineScriptHashes(html), [sha("var a = 1;")]);
    }),

    it("generate-nginx-conf: strips CDATA delimiters before hashing, as browsers do for SVG", () => {
        const svg = `<script type="text/ecmascript"><![CDATA[ function f() {} ]]></script>`;
        assert.deepStrictEqual(inlineScriptHashes(svg), [sha(" function f() {} ")]);
    }),

    it("generate-nginx-conf: hashes inline event handler attributes", () => {
        assert.deepStrictEqual(inlineHandlerHashes(`<svg onload="setup(evt)" version="1.0">`), [sha("setup(evt)")]);
        assert.deepStrictEqual(inlineHandlerHashes(`<svg version="1.0" icon="x">`), []);
    }),

    it("generate-nginx-conf: extracts SVG documents embedded as data: URIs", () => {
        const svg = `<svg onload="go()"><script>x()</script></svg>`;
        const html = `<object data="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></object>`;
        assert.deepStrictEqual(embeddedSvgs(html), [svg]);
    }),

    it("generate-nginx-conf: collects hashes from app pages and embedded SVGs, skipping other HTML", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-nginx-"));
        try {
            const svg = `<svg onload="go()"><script>x()</script></svg>`;
            fs.writeFileSync(path.join(dir, "index.html"),
                `<script>init()</script><object data="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></object>`);
            fs.writeFileSync(path.join(dir, "BundleAnalyzerReport.html"), "<script>report()</script>");
            const {hashes, unsafeHashes} = collectHashes(dir);
            assert.deepStrictEqual(hashes, [sha("init()"), sha("x()"), sha("go()")].sort());
            assert.strictEqual(unsafeHashes, true);
        } finally {
            fs.rmSync(dir, {recursive: true, force: true});
        }
    }),

    it("generate-nginx-conf: only adds 'unsafe-hashes' when an event handler hash is present", () => {
        const tpl = "script-src 'self' __INLINE_SCRIPT_HASHES__;";
        assert.strictEqual(renderConf(tpl, ["'sha256-a'"]), "script-src 'self' 'sha256-a';");
        assert.strictEqual(renderConf(tpl, ["'sha256-a'"], true), "script-src 'self' 'unsafe-hashes' 'sha256-a';");
        assert.throws(() => renderConf("no placeholder", []), /placeholder/);
    }),
]);
