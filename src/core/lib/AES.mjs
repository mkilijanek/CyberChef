/**
 * AES resources.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import forge from "node-forge";

/**
 * Name under which the full-width CTR mode is registered with forge.
 */
const AES_CTR_FULL = "AES-CTR-FULL";

/**
 * CTR mode which increments the whole counter block.
 *
 * node-forge's CTR mode only increments the last 32 bits of the counter block (as GCM requires), so its
 * keystream diverges from OpenSSL and other implementations once those bits overflow, e.g. with an IV of
 * ffffffffffffffffffffffffffffffff. This mode carries the overflow into the rest of the block.
 *
 * @param {Object} options
 */
function FullCounterCTR(options) {
    forge.cipher.modes.ctr.call(this, options);
}
FullCounterCTR.prototype = Object.create(forge.cipher.modes.ctr.prototype);
FullCounterCTR.prototype.constructor = FullCounterCTR;

/**
 * Encrypts (or decrypts) the next block, then propagates any carry out of the last 32-bit word of the
 * counter block.
 *
 * @param {forge.util.ByteBuffer} input
 * @param {forge.util.ByteBuffer} output
 * @param {boolean} finish
 * @returns {boolean|undefined}
 */
FullCounterCTR.prototype.encrypt = function(input, output, finish) {
    const block = this._inBlock,
        last = block.length - 1,
        before = block[last];

    const result = forge.cipher.modes.ctr.prototype.encrypt.call(this, input, output, finish);

    // The last word wrapped around to zero, so carry into the preceding words
    if (block[last] !== before && block[last] === 0) {
        for (let i = last - 1; i >= 0; i--) {
            block[i] = (block[i] + 1) & 0xffffffff;
            if (block[i] !== 0) break;
        }
    }

    return result;
};
FullCounterCTR.prototype.decrypt = FullCounterCTR.prototype.encrypt;

let registered = false;

/**
 * Returns the forge algorithm name to use for the given AES mode.
 *
 * @param {string} mode - e.g. "CBC", "CTR", "GCM"
 * @returns {string}
 */
export function getAESAlgorithm(mode) {
    if (mode !== "CTR") return "AES-" + mode;

    if (!registered) {
        forge.cipher.registerAlgorithm(AES_CTR_FULL, function() {
            return new forge.aes.Algorithm(AES_CTR_FULL, FullCounterCTR);
        });
        registered = true;
    }
    return AES_CTR_FULL;
}
