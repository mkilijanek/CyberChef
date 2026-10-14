/**
 * Browser replacement for Node's crypto module.
 *
 * crypto-browserify does not implement KeyObject, createSecretKey, createPrivateKey or createPublicKey.
 * jsonwebtoken 9 uses all of them, so in the browser JWT Sign and JWT Verify failed with
 * "TypeError: Right-hand side of 'instanceof' is not an object" for every algorithm.
 *
 * This module re-exports crypto-browserify and adds a minimal KeyObject implementation which wraps the
 * original key material. createHmac, createSign and createVerify unwrap KeyObjects before handing the key
 * to crypto-browserify, which accepts secrets as strings or Buffers and asymmetric keys in PEM format.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import cryptoBrowserify from "crypto-browserify";

export * from "crypto-browserify";

// DER-encoded AlgorithmIdentifier OIDs found in PKCS#8, SubjectPublicKeyInfo and certificates
const RSA_ENCRYPTION_OID = "06092a864886f70d010101", // 1.2.840.113549.1.1.1
    EC_PUBLIC_KEY_OID = "06072a8648ce3d0201"; // 1.2.840.10045.2.1

/**
 * Minimal stand-in for Node's crypto.KeyObject.
 */
export class KeyObject {

    /**
     * KeyObject constructor
     *
     * @param {string} type - "secret", "private" or "public"
     * @param {Buffer|string|Object} material - The key in a form crypto-browserify accepts
     * @param {string} [asymmetricKeyType] - "rsa" or "ec"
     */
    constructor(type, material, asymmetricKeyType) {
        this.type = type;
        this.asymmetricKeyType = asymmetricKeyType;
        this._material = material;
    }

    /**
     * Size of a secret key in bytes.
     *
     * @returns {number|undefined}
     */
    get symmetricKeySize() {
        return this.type === "secret" ? this._material.length : undefined;
    }

    /**
     * Returns the wrapped key material.
     *
     * @returns {Buffer|string|Object}
     */
    export() {
        return this._material;
    }
}

/**
 * Returns the wrapped key material if given a KeyObject.
 *
 * @param {*} key
 * @returns {*}
 */
function unwrapKey(key) {
    return key instanceof KeyObject ? key.export() : key;
}

/**
 * Reads the label and asymmetric key type of a PEM-encoded key or certificate.
 *
 * @param {string|Buffer|Object} key - PEM string or Buffer, or an object with a `key` property
 * @returns {{label: string, asymmetricKeyType: string}}
 * @throws {TypeError} if the key is not PEM or is of an unsupported type
 */
function readPEM(key) {
    if (key !== null && typeof key === "object" && !Buffer.isBuffer(key)) key = key.key;
    if (Buffer.isBuffer(key)) key = key.toString("utf8");
    if (typeof key !== "string") throw new TypeError("Invalid key");

    const pem = /-----BEGIN ([A-Z0-9 ]+)-----([A-Za-z0-9+/=\s]+)-----END \1-----/.exec(key);
    if (!pem) throw new TypeError("Invalid PEM formatted message");

    const label = pem[1];
    if (label.startsWith("RSA ")) return {label, asymmetricKeyType: "rsa"};
    if (label.startsWith("EC ")) return {label, asymmetricKeyType: "ec"};

    const der = Buffer.from(pem[2].replace(/\s+/g, ""), "base64").toString("hex");
    if (der.includes(RSA_ENCRYPTION_OID)) return {label, asymmetricKeyType: "rsa"};
    if (der.includes(EC_PUBLIC_KEY_OID)) return {label, asymmetricKeyType: "ec"};

    throw new TypeError("Unsupported key type");
}

/**
 * Creates a secret KeyObject.
 *
 * @param {Buffer|string} key
 * @param {string} [encoding]
 * @returns {KeyObject}
 */
export function createSecretKey(key, encoding) {
    if (typeof key === "string") key = Buffer.from(key, encoding);
    if (!Buffer.isBuffer(key)) key = Buffer.from(key);
    return new KeyObject("secret", key);
}

/**
 * Creates a private KeyObject from a PEM-encoded private key.
 *
 * @param {string|Buffer|Object} key
 * @returns {KeyObject}
 */
export function createPrivateKey(key) {
    if (key instanceof KeyObject) throw new TypeError("Invalid key object type " + key.type);
    const {label, asymmetricKeyType} = readPEM(key);
    if (!label.endsWith("PRIVATE KEY")) throw new TypeError("Not a private key");
    return new KeyObject("private", key, asymmetricKeyType);
}

/**
 * Creates a public KeyObject from a PEM-encoded public key or certificate.
 *
 * @param {string|Buffer|Object} key
 * @returns {KeyObject}
 */
export function createPublicKey(key) {
    if (key instanceof KeyObject) throw new TypeError("Invalid key object type " + key.type);
    const {label, asymmetricKeyType} = readPEM(key);
    if (!label.endsWith("PUBLIC KEY") && label !== "CERTIFICATE") throw new TypeError("Not a public key");
    return new KeyObject("public", key, asymmetricKeyType);
}

/**
 * crypto.createHmac accepting KeyObjects.
 *
 * @param {string} algorithm
 * @param {Buffer|string|KeyObject} key
 * @returns {Object}
 */
export function createHmac(algorithm, key) {
    return cryptoBrowserify.createHmac(algorithm, unwrapKey(key));
}

/**
 * crypto.createSign accepting KeyObjects when signing.
 *
 * @param {string} algorithm
 * @param {Object} [options]
 * @returns {Object}
 */
export function createSign(algorithm, options) {
    const signer = cryptoBrowserify.createSign(algorithm, options),
        sign = signer.sign;
    signer.sign = function(key, encoding) {
        return sign.call(signer, unwrapKey(key), encoding);
    };
    return signer;
}

/**
 * crypto.createVerify accepting KeyObjects when verifying.
 *
 * @param {string} algorithm
 * @param {Object} [options]
 * @returns {Object}
 */
export function createVerify(algorithm, options) {
    const verifier = cryptoBrowserify.createVerify(algorithm, options),
        verify = verifier.verify;
    verifier.verify = function(key, signature, encoding) {
        return verify.call(verifier, unwrapKey(key), signature, encoding);
    };
    return verifier;
}

export default Object.assign({}, cryptoBrowserify, {
    KeyObject,
    createSecretKey,
    createPrivateKey,
    createPublicKey,
    createHmac,
    createSign,
    createVerify
});
