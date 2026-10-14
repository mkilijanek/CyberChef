/**
 * Tests for the browser crypto module used in place of Node's crypto in webpack builds.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import assert from "assert";
import nodeCrypto from "crypto";
import it from "../../assertionHandler.mjs";
import TestRegister from "../../../lib/TestRegister.mjs";
import browserCrypto, {
    KeyObject,
    createSecretKey,
    createPrivateKey,
    createPublicKey,
    createHmac,
    createSign,
    createVerify
} from "../../../../src/web/utils/cryptoBrowserify.mjs";

// Throwaway test keys
const RSA_PRIVATE = `-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQDNp4tZUz2UI3ZmYlwK2wNEpd944LLT8pGM6fbVT365OpZ7Ql3R
flpc/qBm4xrnHLucUnWykOCxAf2UbJWoMGFwVWiAyE+zttAm9TS00BFe746mYHpe
zXnB72yl709beFBur2Fqiei35XsgTIASEKyHGOL8G3JQhRuuzOik15MppQIDAQAB
AoGBAJ1/tgHX9S4RpqispY8Owkb9vdLmSy509DF2MTqWIhgbnYmSfyVk3jGgNBn3
ze+3mpsSr97sg5gsTRcxvb/MJaIv8XedVOigm4Dlynp9TGeBPNiO5kHMLsVnYngk
hpBrKBHEsNvCZ3mE+He1wS05xt326w+tvBpbBf9ku7hLS1mBAkEA/uRUXoLLKRdz
zJkcmycqTl+N7VGhDl1nr8weA/tekD9oI10PAFooX5dz6cs65zMvK0rBaKs5uTyb
hThzaQP3oQJBAM6Maw3CShKlNpo+0JLaAy/iaQjAzKCpse5DqHXnzmbEFF7dMtgV
TnQVYSl6rJ5sWpDwRCktVWJYUpll35LYo4UCQEGhs2O+k+dZxZR6HFaLCCa0Dgx8
h1b2kBtBGL13vUqxOPRaIuG5VUn/6nXZwaoEkPG5xwFXjX5376em+Hii7+ECQQCM
W6F39RqO9xRW1u63jEz0IkBMAXBMkWRnTDTTApYhAYfyOxCNBFWOzuR64nEhKvKU
YaF/9d16+hgPQ8odKPhdAkEAkrXmr4ti6QEefi0b7J8omxtUlrR8wI8crle0Vxfi
MHjSyBC9ar6Sr/djmdqhMBNaSjq/wkGuFDXLnKdj+iNRxA==
-----END RSA PRIVATE KEY-----`;

const RSA_PUBLIC = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDNp4tZUz2UI3ZmYlwK2wNEpd94
4LLT8pGM6fbVT365OpZ7Ql3Rflpc/qBm4xrnHLucUnWykOCxAf2UbJWoMGFwVWiA
yE+zttAm9TS00BFe746mYHpezXnB72yl709beFBur2Fqiei35XsgTIASEKyHGOL8
G3JQhRuuzOik15MppQIDAQAB
-----END PUBLIC KEY-----`;

const EC_PRIVATE_SEC1 = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEII0FN4mJrPi+4acG+/LVpoVlfrRepmdOuz2WPgdXdsBWoAoGCCqGSM49
AwEHoUQDQgAE97uYGWBsgKH4R0XhlGKyzpamssTrnZo5X5ThtV3ALyOfdnv/Sdah
efrkEWTTH3EiCkcNaCpxkRIGAfMg+Rt8Vg==
-----END EC PRIVATE KEY-----`;

const EC_PRIVATE_PKCS8 = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgjQU3iYms+L7hpwb7
8tWmhWV+tF6mZ067PZY+B1d2wFahRANCAAT3u5gZYGyAofhHReGUYrLOlqayxOud
mjlflOG1XcAvI592e/9J1qF5+uQRZNMfcSIKRw1oKnGREgYB8yD5G3xW
-----END PRIVATE KEY-----`;

const EC_PUBLIC = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE97uYGWBsgKH4R0XhlGKyzpamssTr
nZo5X5ThtV3ALyOfdnv/SdahefrkEWTTH3EiCkcNaCpxkRIGAfMg+Rt8Vg==
-----END PUBLIC KEY-----`;

TestRegister.addApiTests([
    it("cryptoBrowserify: exposes the KeyObject API used by jsonwebtoken", () => {
        assert.strictEqual(typeof KeyObject, "function");
        assert.strictEqual(browserCrypto.KeyObject, KeyObject);
        assert.strictEqual(typeof browserCrypto.createSecretKey, "function");
        assert.strictEqual(typeof browserCrypto.createPrivateKey, "function");
        assert.strictEqual(typeof browserCrypto.createPublicKey, "function");
        assert.strictEqual(typeof browserCrypto.randomBytes, "function");
    }),

    it("cryptoBrowserify: createPrivateKey rejects HMAC secrets so callers fall back to createSecretKey", () => {
        assert.throws(() => createPrivateKey("secret"), TypeError);
        assert.throws(() => createPrivateKey(Buffer.from("secret")), TypeError);
        assert.throws(() => createPrivateKey(RSA_PUBLIC), TypeError);
        const key = createSecretKey(Buffer.from("secret"));
        assert.ok(key instanceof KeyObject);
        assert.strictEqual(key.type, "secret");
        assert.strictEqual(key.asymmetricKeyType, undefined);
        assert.strictEqual(key.symmetricKeySize, 6);
    }),

    it("cryptoBrowserify: createPrivateKey identifies RSA and EC keys", () => {
        const rsa = createPrivateKey(RSA_PRIVATE),
            ecSec1 = createPrivateKey(EC_PRIVATE_SEC1),
            ecPkcs8 = createPrivateKey(EC_PRIVATE_PKCS8);
        assert.strictEqual(rsa.type, "private");
        assert.strictEqual(rsa.asymmetricKeyType, "rsa");
        assert.strictEqual(ecSec1.asymmetricKeyType, "ec");
        assert.strictEqual(ecPkcs8.asymmetricKeyType, "ec");
        assert.strictEqual(rsa.export(), RSA_PRIVATE);
    }),

    it("cryptoBrowserify: createPublicKey identifies RSA and EC keys and rejects private keys", () => {
        assert.strictEqual(createPublicKey(RSA_PUBLIC).asymmetricKeyType, "rsa");
        assert.strictEqual(createPublicKey(EC_PUBLIC).asymmetricKeyType, "ec");
        assert.strictEqual(createPublicKey(EC_PUBLIC).type, "public");
        assert.throws(() => createPublicKey(RSA_PRIVATE), TypeError);
        assert.throws(() => createPublicKey("secret"), TypeError);
    }),

    it("cryptoBrowserify: createHmac accepts secret KeyObjects", () => {
        const expected = nodeCrypto.createHmac("sha256", "secret").update("data").digest("hex");
        assert.strictEqual(createHmac("sha256", createSecretKey(Buffer.from("secret"))).update("data").digest("hex"), expected);
        assert.strictEqual(createHmac("sha256", "secret").update("data").digest("hex"), expected);
    }),

    it("cryptoBrowserify: createSign and createVerify accept RSA KeyObjects", () => {
        const signature = createSign("RSA-SHA256").update("data").sign(createPrivateKey(RSA_PRIVATE), "base64");
        assert.strictEqual(signature, nodeCrypto.createSign("RSA-SHA256").update("data").sign(RSA_PRIVATE, "base64"));
        assert.ok(createVerify("RSA-SHA256").update("data").verify(createPublicKey(RSA_PUBLIC), signature, "base64"));
        assert.ok(!createVerify("RSA-SHA256").update("other").verify(createPublicKey(RSA_PUBLIC), signature, "base64"));
    }),

    it("cryptoBrowserify: createSign and createVerify accept EC KeyObjects", () => {
        const signature = createSign("RSA-SHA256").update("data").sign(createPrivateKey(EC_PRIVATE_PKCS8), "base64");
        assert.ok(nodeCrypto.createVerify("SHA256").update("data").verify(EC_PUBLIC, signature, "base64"));
        const nodeSignature = nodeCrypto.createSign("SHA256").update("data").sign(EC_PRIVATE_SEC1, "base64");
        assert.ok(createVerify("RSA-SHA256").update("data").verify(createPublicKey(EC_PUBLIC), nodeSignature, "base64"));
    }),
]);
