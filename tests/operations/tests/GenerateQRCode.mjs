/**
 * Generate QR Code tests
 *
 * @author GCHQDeveloper581
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate QR Code : PNG",
        input: "Hello world!",
        expectedOutput: "Hello world!",
        recipeConfig: [
            {
                "op": "Generate QR Code",
                "args": ["PNG", 5, 4, "Medium"]
            },
            {
                "op": "Parse QR Code",
                "args": [false]
            }
        ],
    },
    {
        name: "Generate QR Code : SVG",
        input: "Hello world!",
        expectedOutput: '<svg xmlns="http://www.w3.org/2000/svg" width="145" height="145" viewBox="0 0 29 29"><path d="M4 4h7v7h-7zM12 4h5v2h-1v-1h-1v1h1v1h1v1h-2v3h-1v-1h-1v-1h1v-4h-1v1h-1zM18 4h7v7h-7zM5 5v5h5v-5zM19 5v5h5v-5zM6 6h3v3h-3zM20 6h3v3h-3zM12 7h1v1h-1zM12 10h1v1h1v1h-2zM16 10h1v1h-1zM4 12h1v1h-1zM6 12h2v2h-1v1h1v-1h3v1h-1v1h-2v1h-2v-1h-1v-1h-1v-1h2zM9 12h3v2h-1v-1h-2zM14 12h1v2h-2v-1h1zM18 12h1v1h2v-1h1v1h1v1h-3v2h-1v-2h-1v1h-1v1h-1v-3h2zM23 12h2v3h-1v1h-1v-2h1v-1h-1zM12 14h1v1h-1zM11 15h1v2h-2v-1h1zM14 15h1v1h-1zM21 15h1v1h-1zM15 16h1v2h-1v1h2v-1h1v-1h-1v-1h2v1h2v2h-1v1h-1v-1h-1v1h-2v1h-1v-1h-1v1h-1v-1h-1v-3h3zM24 16h1v2h-1zM22 17h1v1h-1zM4 18h7v7h-7zM13 18v1h1v-1zM5 19v5h5v-5zM21 19h2v1h1v2h-1v1h-1v-1h-1zM6 20h3v3h-3zM12 21h1v2h-1zM14 21h1v1h-1zM16 21h1v2h-1zM18 21h1v1h-1zM19 22h1v1h1v1h-1v1h-3v-2h2zM13 23h1v1h-1zM15 23h1v2h-2v-1h1zM24 23h1v1h-1zM12 24h1v1h-1zM22 24h1v1h-1z"/></svg>',
        recipeConfig: [
            {
                "op": "Generate QR Code",
                "args": ["SVG", 5, 4, "Medium"]
            },
        ],
    },
    {
        name: "Generate QR Code : EPS",
        input: "Hello world!",
        expectedOutput: "%!PS-Adobe-3.0 EPSF-3.0%%BoundingBox: 0 0 315 315/h { 0 rlineto } bind def/v { 0 exch neg rlineto } bind def/M { neg 30 add moveto } bind def/z { closepath } bind def9 9 scale5 0 M 7 h 7 v -7 h z13 0 M 1 h 1 v -1 h z16 0 M 2 h 1 v -1 h 1 v 1 h 1 v -2 h -1 v -1 h 2 v -1 h -3 v 2 h z20 0 M 2 h 1 v -2 h z23 0 M 7 h 7 v -7 h z6 1 M 5 v 5 h -5 v z24 1 M 5 v 5 h -5 v z7 2 M 3 h 3 v -3 h z19 2 M 1 h 1 v -1 h z21 2 M 1 h 2 v -1 h z25 2 M 3 h 3 v -3 h z13 4 M 1 h 3 v -1 h z17 4 M 4 h 1 v 1 h 2 v -1 h -1 v -1 h 1 v -1 h -1 v -1 h -1 v -1 h z15 6 M 1 h 1 v -1 h z17 6 M 1 h 1 v -1 h z16 7 M 1 h 1 v -1 h z18 7 M 1 h 1 v -1 h z20 7 M 1 h 2 v 1 h 1 v -2 h -1 v -1 h -1 v 1 h z6 8 M 7 h 1 v 2 h 1 v -2 h 1 v -2 h -1 v 1 h -1 v -4 h 1 v -1 h -1 v -1 h z17 8 M 1 h 1 v -1 h z24 8 M 2 h 1 v -1 h 1 v -1 h z29 8 M 1 h 1 v -1 h z27 9 M 1 h 1 v -1 h z6 10 M 1 h 1 v 1 h 1 v -1 h 1 v -1 h z8 10 M 2 h 5 v 1 h 1 v -3 h 1 v -1 h -4 v 1 h 1 v 1 h -1 v -1 h -1 v 1 h -1 v -1 h z16 10 M 2 h 4 v 1 h -1 v 2 h 1 v 3 h -1 v -3 h -2 v 1 h 1 v 1 h -1 v 1 h 1 v 4 h -2 v 2 h 3 v -2 h 1 v -1 h -1 v -2 h 1 v 2 h 1 v -1 h 1 v 2 h 2 v 1 h -1 v 1 h 3 v -1 h -1 v -2 h -2 v -1 h 2 v 1 h 1 v 2 h 1 v -2 h 2 v -1 h -1 v -1 h -1 v -1 h 1 v -1 h -1 v -1 h 2 v -1 h -1 v -1 h -1 v 1 h -2 v -1 h -1 v -1 h 1 v 1 h 2 v -1 h -1 v -1 h 1 v -1 h -3 v 1 h -1 v -1 h 1 v -1 h -1 v -1 h -1 v 4 h 1 v 1 h -2 v -3 h -1 v -1 h 1 v -1 h -1 v -1 h 2 v -1 h 1 v -2 h -1 v 1 h -1 v -1 h -1 v 1 h -1 v 1 h -1 v 1 h 1 v 1 h -1 v 1 h 1 v 1 h -1 v -1 h z22 10 M 1 h 1 v -1 h z25 10 M 2 h 1 v -2 h z19 11 M 1 h 1 v -1 h z11 12 M 1 h 1 v -1 h z5 13 M 1 h 4 v -1 h z28 14 M 2 h 2 v -1 h -1 v -1 h z21 15 M 1 v 2 h -1 v z13 17 M 1 h 1 v 2 h 1 v -2 h 1 v 1 h 1 v 1 h 1 v -2 h 1 v 2 h 2 v -1 h -1 v -2 h z22 17 M 3 v 3 h -3 v z5 18 M 7 h 7 v -7 h z23 18 M 1 h 1 v -1 h z6 19 M 5 v 5 h -5 v z7 20 M 3 h 3 v -3 h z29 21 M 1 h 4 v -3 h -1 v 2 h z17 22 M 2 h 3 v -2 h -1 v 1 h -1 v -1 h z24 22 M 1 h 1 v 1 h 1 v -1 h 1 v -3 h -1 v 1 h -1 v 1 h z20 23 M 1 h 2 v -1 h zfill%%EOF",
        recipeConfig: [
            {
                "op": "Generate QR Code",
                "args": ["EPS", 6, 5, "Quartile"]
            },
            {
                "op": "Remove whitespace",
                "args": [false, true, true, false, false, false]
            },
        ],
    },
    {
        name: "Generate QR Code : PDF",
        input: "Hello world!",
        expectedOutput: "%PDF-1.01 0 obj << /Type /Catalog /Pages 2 0 R >> endobj2 0 obj << /Type /Pages /Count 1 /Kids [ 3 0 R ] >> endobj3 0 obj << /Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R /MediaBox [ 0 0 261 261 ] >> endobj4 0 obj << /Length 1837 >> stream9 0 0 9 0 0 cm4 25 m 11 25 l 11 18 l 4 18 l h12 25 m 14 25 l 14 23 l 13 23 l 13 24 l 12 24 l h16 25 m 17 25 l 17 22 l 16 22 l h18 25 m 25 25 l 25 18 l 18 18 l h5 24 m 5 19 l 10 19 l 10 24 l h19 24 m 19 19 l 24 19 l 24 24 l h6 23 m 9 23 l 9 20 l 6 20 l h12 23 m 13 23 l 13 21 l 15 21 l 15 20 l 12 20 l h14 23 m 15 23 l 15 22 l 14 22 l h20 23 m 23 23 l 23 20 l 20 20 l h15 22 m 16 22 l 16 21 l 15 21 l h12 19 m 13 19 l 13 18 l 12 18 l h14 19 m 15 19 l 15 13 l 13 13 l 13 11 l 12 11 l 12 14 l 14 14 l 14 15 l 11 15 l 11 16 l 12 16 l 12 17 l 13 17 l 13 16 l 14 16 l 14 17 l 13 17 l 13 18 l 14 18 l h16 19 m 17 19 l 17 18 l 16 18 l h4 17 m 8 17 l 8 16 l 10 16 l 10 15 l 11 15 l 11 14 l 10 14 l 10 13 l 11 13 l 11 12 l 9 12 l 9 15 l 8 15 l 8 13 l 6 13 l 6 15 l 7 15 l 7 16 l 4 16 l h10 17 m 11 17 l 11 16 l 10 16 l h17 17 m 18 17 l 18 16 l 20 16 l 20 17 l 23 17 l 23 15 l 20 15 l 20 13 l 19 13 l 19 15 l 18 15 l 18 14 l 17 14 l 17 13 l 16 13 l 16 16 l 17 16 l h24 17 m 25 17 l 25 14 l 24 14 l 24 13 l 23 13 l 23 15 l 24 15 l h21 14 m 22 14 l 22 13 l 21 13 l h15 13 m 16 13 l 16 11 l 15 11 l h17 13 m 19 13 l 19 12 l 21 12 l 21 10 l 20 10 l 20 9 l 19 9 l 19 10 l 18 10 l 18 9 l 16 9 l 16 8 l 15 8 l 15 10 l 17 10 l 17 11 l 18 11 l 18 12 l 17 12 l h24 13 m 25 13 l 25 11 l 24 11 l h22 12 m 23 12 l 23 11 l 22 11 l h4 11 m 11 11 l 11 4 l 4 4 l h14 11 m 15 11 l 15 10 l 14 10 l h5 10 m 5 5 l 10 5 l 10 10 l h13 10 m 14 10 l 14 9 l 13 9 l h21 10 m 23 10 l 23 9 l 24 9 l 24 7 l 23 7 l 23 6 l 22 6 l 22 7 l 21 7 l h6 9 m 9 9 l 9 6 l 6 6 l h12 8 m 15 8 l 15 7 l 13 7 l 13 6 l 16 6 l 16 4 l 15 4 l 15 5 l 14 5 l 14 4 l 12 4 l h16 8 m 17 8 l 17 6 l 16 6 l h18 8 m 19 8 l 19 7 l 18 7 l h19 7 m 20 7 l 20 6 l 21 6 l 21 5 l 20 5 l 20 4 l 17 4 l 17 6 l 19 6 l h24 6 m 25 6 l 25 5 l 24 5 l h22 5 m 23 5 l 23 4 l 22 4 l hfendstreamendobjxref0 50000000000 65535 f 0000000010 00000 n 0000000059 00000 n 0000000118 00000 n 0000000223 00000 n trailer << /Root 1 0 R /Size 5 >>startxref2111%%EOF",
        recipeConfig: [
            {
                "op": "Generate QR Code",
                "args": ["PDF", 5, 4, "Low"]
            },
            {
                "op": "Remove whitespace",
                "args": [false, true, true, false, false, false]
            },
        ],
    },
]);
