/**
 * Parse X.509 certificate tests
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

// Self-signed Ed25519 certificate from gchq/CyberChef#2005
const ED25519_CERT = `-----BEGIN CERTIFICATE-----
MIIBCDCBuwIUGW78zw0OL0GptJi++a91dBa7DsQwBQYDK2VwMCcxCzAJBgNVBAYT
AkRFMRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20wHhcNMTkwMzMxMTc1MTIyWhcN
MjEwMjI4MTc1MTIyWjAnMQswCQYDVQQGEwJERTEYMBYGA1UEAwwPd3d3LmV4YW1w
bGUuY29tMCowBQYDK2VwAyEAK87g0b8CC1eA5mvKXt9uezZwJYWEyg74Y0xTZEkq
CcwwBQYDK2VwA0EAIIu/aa3Qtr3IE5to/nvWVY9y3ciwG5DnA70X3ALUhFs+U5aL
tfY8sNT1Ng72ht+UBwByuze20UsL9qMsmknQCA==
-----END CERTIFICATE-----`;

// Self-signed Ed448 certificate with X509v3 extensions, generated with
// openssl req -x509 -newkey ed448 -subj "/C=GB/CN=ed448.example" -set_serial 0x1234 -addext "subjectAltName=DNS:ed448.example"
const ED448_CERT = `-----BEGIN CERTIFICATE-----
MIIBsjCCATKgAwIBAgICEjQwBQYDK2VxMCUxCzAJBgNVBAYTAkdCMRYwFAYDVQQD
DA1lZDQ0OC5leGFtcGxlMB4XDTI2MTAxNDE1MTkzOFoXDTM2MTAxMTE1MTkzOFow
JTELMAkGA1UEBhMCR0IxFjAUBgNVBAMMDWVkNDQ4LmV4YW1wbGUwQzAFBgMrZXED
OgCcGHYr/rzFxcX8QLlTFD6otxyES25leBjjGv+FH4mjn3oFJSzeZwSVXM1z/wYb
BUeX8IJRpkwosYCjbTBrMB0GA1UdDgQWBBQjjWWh7s7CVomlkExiEAfciw6N9TAf
BgNVHSMEGDAWgBQjjWWh7s7CVomlkExiEAfciw6N9TAPBgNVHRMBAf8EBTADAQH/
MBgGA1UdEQQRMA+CDWVkNDQ4LmV4YW1wbGUwBQYDK2VxA3MAwu05ZrohgKdq9MO7
cGafas2j3a0CVjYMWEDc0S/EeI5WwC9StanvO8M6p9TzIdSDyTYNVVB3eQuAB/Rb
ptdIkJK0WuCyL2wUTzXErMXfC9W6yTYv0D15Bx736LFYehmOLnsj+eENT9YKuhpL
04HasCEA
-----END CERTIFICATE-----`;

TestRegister.addTests([
    {
        name: "Parse X.509 certificate: Ed25519",
        input: ED25519_CERT,
        expectedOutput: `Version:          1 (0x00)
Serial number:    145199873994292727444641035716316446078879338180 (0x196efccf0d0e2f41a9b498bef9af757416bb0ec4)
Algorithm ID:     1.3.101.112
Validity
  Not Before:     31/03/2019 17:51:22 (dd-mm-yyyy hh:mm:ss) (190331175122Z)
  Not After:      28/02/2021 17:51:22 (dd-mm-yyyy hh:mm:ss) (210228175122Z)
Issuer
  C  = DE
  CN = www.example.com
Subject
  C  = DE
  CN = www.example.com
Fingerprints
  MD5:            a698d411c989e171ef108200808862d2
  SHA1:           00d18e7f0b5081b8056eadf6da8a2b16e9e06e9f
  SHA256:         7f7228553417082195fdc80f49ec39d3b31998003a55044c6b64ce6049e7e0ad
Public Key
  Algorithm:      Ed25519
  Length:         256 bits
  pub:            2b:ce:e0:d1:bf:02:0b:57:80:e6:6b:ca:5e:df:6e:7b:
                  36:70:25:85:84:ca:0e:f8:63:4c:53:64:49:2a:09:cc
Certificate Signature
  Algorithm:      Ed25519
  Signature:      20:8b:bf:69:ad:d0:b6:bd:c8:13:9b:68:fe:7b:d6:55:
                  8f:72:dd:c8:b0:1b:90:e7:03:bd:17:dc:02:d4:84:5b:
                  3e:53:96:8b:b5:f6:3c:b0:d4:f5:36:0e:f6:86:df:94:
                  07:00:72:bb:37:b6:d1:4b:0b:f6:a3:2c:9a:49:d0:08

Extensions
`,
        recipeConfig: [
            {
                op: "Parse X.509 certificate",
                args: ["PEM"]
            }
        ]
    },
    {
        name: "Parse X.509 certificate: Ed448 with extensions",
        input: ED448_CERT,
        expectedOutput: `Version:          3 (0x02)
Serial number:    4660 (0x1234)
Algorithm ID:     1.3.101.113
Validity
  Not Before:     14/10/2026 15:19:38 (dd-mm-yyyy hh:mm:ss) (261014151938Z)
  Not After:      11/10/2036 15:19:38 (dd-mm-yyyy hh:mm:ss) (361011151938Z)
Issuer
  C  = GB
  CN = ed448.example
Subject
  C  = GB
  CN = ed448.example
Fingerprints
  MD5:            3cf71e5cb613752f69ea9682ccc7c765
  SHA1:           3f096cf3324d79299cb6fa11ddf2be482185d707
  SHA256:         c98bbd96e9048dbe3e94db4d5a33ab8a1f7b5975b6a297d8d22e09ef51ddf28b
Public Key
  Algorithm:      Ed448
  Length:         456 bits
  pub:            9c:18:76:2b:fe:bc:c5:c5:c5:fc:40:b9:53:14:3e:a8:
                  b7:1c:84:4b:6e:65:78:18:e3:1a:ff:85:1f:89:a3:9f:
                  7a:05:25:2c:de:67:04:95:5c:cd:73:ff:06:1b:05:47:
                  97:f0:82:51:a6:4c:28:b1:80
Certificate Signature
  Algorithm:      Ed448
  Signature:      c2:ed:39:66:ba:21:80:a7:6a:f4:c3:bb:70:66:9f:6a:
                  cd:a3:dd:ad:02:56:36:0c:58:40:dc:d1:2f:c4:78:8e:
                  56:c0:2f:52:b5:a9:ef:3b:c3:3a:a7:d4:f3:21:d4:83:
                  c9:36:0d:55:50:77:79:0b:80:07:f4:5b:a6:d7:48:90:
                  92:b4:5a:e0:b2:2f:6c:14:4f:35:c4:ac:c5:df:0b:d5:
                  ba:c9:36:2f:d0:3d:79:07:1e:f7:e8:b1:58:7a:19:8e:
                  2e:7b:23:f9:e1:0d:4f:d6:0a:ba:1a:4b:d3:81:da:b0:
                  21:00

Extensions
  subjectKeyIdentifier :
    238d65a1eecec25689a5904c621007dc8b0e8df5
  authorityKeyIdentifier :
    kid=238d65a1eecec25689a5904c621007dc8b0e8df5
  basicConstraints CRITICAL:
    cA=true
  subjectAltName :
    dns: ed448.example
`,
        recipeConfig: [
            {
                op: "Parse X.509 certificate",
                args: ["PEM"]
            }
        ]
    },
]);
