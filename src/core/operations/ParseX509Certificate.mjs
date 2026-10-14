/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";
import { fromBase64 } from "../lib/Base64.mjs";
import { runHash } from "../lib/Hash.mjs";
import { fromHex, toHex } from "../lib/Hex.mjs";
import { formatByteStr, formatDnObj } from "../lib/PublicKey.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * Key and signature algorithms which jsrsasign cannot load, keyed by OID.
 * Their public keys are raw byte strings (RFC 8410).
 */
const RAW_KEY_ALGORITHMS = {
    "1.3.101.110": "X25519",
    "1.3.101.111": "X448",
    "1.3.101.112": "Ed25519",
    "1.3.101.113": "Ed448"
};

/**
 * Parse X.509 certificate operation
 */
class ParseX509Certificate extends Operation {

    /**
     * ParseX509Certificate constructor
     */
    constructor() {
        super();

        this.name = "Parse X.509 certificate";
        this.module = "PublicKey";
        this.description = "X.509 is an ITU-T standard for a public key infrastructure (PKI) and Privilege Management Infrastructure (PMI). It is commonly involved with SSL/TLS security.<br><br>This operation displays the contents of a certificate in a human readable format, similar to the openssl command line tool.<br><br>Tags: X509, server hello, handshake";
        this.infoURL = "https://wikipedia.org/wiki/X.509";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input format",
                "type": "option",
                "value": ["PEM", "DER Hex", "Base64", "Raw"]
            }
        ];
        this.checks = [
            {
                "pattern": "^-+BEGIN CERTIFICATE-+\\r?\\n[\\da-z+/\\n\\r]+-+END CERTIFICATE-+\\r?\\n?$",
                "flags": "i",
                "args": ["PEM"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input.length) {
            return "No input";
        }

        const cert = new r.X509(),
            inputFormat = args[0];

        let undefinedInputFormat = false;
        try {
            switch (inputFormat) {
                case "DER Hex":
                    input = input.replace(/\s/g, "").toLowerCase();
                    cert.readCertHex(input);
                    break;
                case "PEM":
                    cert.readCertPEM(input);
                    break;
                case "Base64":
                    cert.readCertHex(toHex(fromBase64(input, null, "byteArray"), ""));
                    break;
                case "Raw":
                    cert.readCertHex(toHex(Utils.strToArrayBuffer(input), ""));
                    break;
                default:
                    undefinedInputFormat = true;
            }
        } catch (e) {
            throw "Certificate load error (non-certificate input?)";
        }
        if (undefinedInputFormat) throw "Undefined input format";

        const hex = Utils.strToArrayBuffer(Utils.byteArrayToChars(fromHex(cert.hex))),
            sn = cert.getSerialNumberHex(),
            issuer = cert.getIssuer(),
            subject = cert.getSubject(),
            pk = getPublicKey(cert),
            pkFields = [],
            sig = cert.getSignatureValueHex(),
            sigAlgOid = cert.getSignatureAlgorithmField(),
            sigAlgName = RAW_KEY_ALGORITHMS[sigAlgOid] || cert.getSignatureAlgorithmName();

        let pkStr = "",
            sigStr = "",
            extensions = "";

        // Public Key fields
        pkFields.push({
            key: "Algorithm",
            value: pk.type
        });

        if (pk.type === "EC") { // ECDSA
            pkFields.push({
                key: "Curve Name",
                value: pk.curveName
            });
            pkFields.push({
                key: "Length",
                value: (((new r.BigInteger(pk.pubKeyHex, 16)).bitLength()-3) /2) + " bits"
            });
            pkFields.push({
                key: "pub",
                value: formatByteStr(pk.pubKeyHex, 16, 18)
            });
        } else if (pk.type === "DSA") { // DSA
            pkFields.push({
                key: "pub",
                value: formatByteStr(pk.y.toString(16), 16, 18)
            });
            pkFields.push({
                key: "P",
                value: formatByteStr(pk.p.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Q",
                value: formatByteStr(pk.q.toString(16), 16, 18)
            });
            pkFields.push({
                key: "G",
                value: formatByteStr(pk.g.toString(16), 16, 18)
            });
        } else if (pk.raw) { // EdDSA, X25519, X448 or other raw keys
            pkFields.push({
                key: "Length",
                value: (pk.pubKeyHex.length * 4) + " bits"
            });
            pkFields.push({
                key: "pub",
                value: formatByteStr(pk.pubKeyHex, 16, 18)
            });
        } else if (pk.e) { // RSA
            pkFields.push({
                key: "Length",
                value: pk.n.bitLength() + " bits"
            });
            pkFields.push({
                key: "Modulus",
                value: formatByteStr(pk.n.toString(16), 16, 18)
            });
            pkFields.push({
                key: "Exponent",
                value: pk.e + " (0x" + pk.e.toString(16) + ")"
            });
        } else {
            pkFields.push({
                key: "Error",
                value: "Unknown Public Key type"
            });
        }

        // Format Public Key fields
        for (let i = 0; i < pkFields.length; i++) {
            pkStr += `  ${pkFields[i].key}:${(pkFields[i].value + "\n").padStart(
                18 - (pkFields[i].key.length + 3) + pkFields[i].value.length + 1,
                " "
            )}`;
        }

        // Signature fields
        let breakoutSig = false;
        // EdDSA signatures are raw byte strings which may happen to look like a SEQUENCE
        if (!RAW_KEY_ALGORITHMS[sigAlgOid]) {
            try {
                breakoutSig = r.ASN1HEX.dump(sig).indexOf("SEQUENCE") === 0;
            } catch (err) {
                // Error processing signature, output without further breakout
            }
        }

        if (breakoutSig) { // DSA or ECDSA
            sigStr = `  r:              ${formatByteStr(r.ASN1HEX.getV(sig, 4), 16, 18)}
  s:              ${formatByteStr(r.ASN1HEX.getV(sig, 48), 16, 18)}`;
        } else { // RSA or unknown
            sigStr = `  Signature:      ${formatByteStr(sig, 16, 18)}`;
        }

        // Extensions
        try {
            extensions = cert.getInfo().split("X509v3 Extensions:\n")[1].split("signature")[0];
        } catch (err) {}

        const issuerStr = formatDnObj(issuer, 2),
            nbDate = formatDate(cert.getNotBefore()),
            naDate = formatDate(cert.getNotAfter()),
            subjectStr = formatDnObj(subject, 2);

        return `Version:          ${cert.version} (0x${Utils.hex(cert.version - 1)})
Serial number:    ${new r.BigInteger(sn, 16).toString()} (0x${sn})
Algorithm ID:     ${sigAlgOid}
Validity
  Not Before:     ${nbDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotBefore()})
  Not After:      ${naDate} (dd-mm-yyyy hh:mm:ss) (${cert.getNotAfter()})
Issuer
${issuerStr}
Subject
${subjectStr}
Fingerprints
  MD5:            ${runHash("md5", hex)}
  SHA1:           ${runHash("sha1", hex)}
  SHA256:         ${runHash("sha256", hex)}
Public Key
${pkStr.slice(0, -1)}
Certificate Signature
  Algorithm:      ${sigAlgName}
${sigStr}

Extensions
${extensions}`;
    }

}

/**
 * Returns the certificate's public key. Keys that jsrsasign cannot load, such as Ed25519, are read
 * directly from the SubjectPublicKeyInfo structure.
 *
 * @param {X509} cert
 * @returns {Object}
 */
function getPublicKey(cert) {
    try {
        return cert.getPublicKey();
    } catch (err) {
        let pk;
        try {
            const spki = cert.getPublicKeyHex(),
                oid = r.KJUR.asn1.ASN1Util.oidHexToInt(r.ASN1HEX.getVbyList(spki, 0, [0, 0])),
                bitString = r.ASN1HEX.getVbyList(spki, 0, [1]);
            pk = {
                type: RAW_KEY_ALGORITHMS[oid] || oid,
                raw: true,
                // Drop the leading 'unused bits' byte of the BIT STRING
                pubKeyHex: bitString.slice(2)
            };
        } catch (e) {
            throw new OperationError(`Unable to parse public key: ${err.message || err}`);
        }
        // Other jsrsasign helpers, such as getInfo(), call getPublicKey() and only need the key type
        cert.getPublicKey = () => pk;
        return pk;
    }
}

/**
 * Formats dates.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function formatDate (dateStr) {
    if (dateStr.length === 13) { // UTC Time
        dateStr = (dateStr[0] < "5" ? "20" : "19") + dateStr;
    }
    return dateStr[6] + dateStr[7] + "/" +
        dateStr[4] + dateStr[5] + "/" +
        dateStr[0] + dateStr[1] + dateStr[2] + dateStr[3] + " " +
        dateStr[8] + dateStr[9] + ":" +
        dateStr[10] + dateStr[11] + ":" +
        dateStr[12] + dateStr[13];
}

export default ParseX509Certificate;
