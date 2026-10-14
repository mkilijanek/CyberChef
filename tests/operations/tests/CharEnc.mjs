/**
 * CharEnc tests.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Encode text, Decode text: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["UTF-8 (65001)"]
            },
            {
                "op": "Decode text",
                "args": ["UTF-8 (65001)"]
            },
        ],
    },
    {
        name: "Encode text, Decode text: hello",
        input: "hello",
        expectedOutput: "hello",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["UTF-8 (65001)"]
            },
            {
                "op": "Decode text",
                "args": ["UTF-8 (65001)"]
            },
        ],
    },
    {
        name: "Encode text (EBCDIC): hello",
        input: "hello",
        expectedOutput: "88 85 93 93 96",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["IBM EBCDIC International (500)"]
            },
            {
                "op": "To Hex",
                "args": ["Space"]
            },
        ],
    },
    {
        name: "Decode text (EBCDIC): 88 85 93 93 96",
        input: "88 85 93 93 96",
        expectedOutput: "hello",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "Decode text",
                "args": ["IBM EBCDIC International (500)"]
            },
        ],
    },
    {
        name: "Encode text: empty encoding",
        input: "hello",
        expectedOutput: "Encoding cannot be empty.",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": [""]
            },
        ],
    },
    {
        name: "Decode text: empty encoding",
        input: "68 65 6c 6c 6f",
        expectedOutput: "Encoding cannot be empty.",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "Decode text",
                "args": [""]
            },
        ],
    },
    {
        name: "Generate Base64 Windows PowerShell",
        input: "ZABpAHIAIAAiAGMAOgBcAHAAcgBvAGcAcgBhAG0AIABmAGkAbABlAHMAIgAgAA==",
        expectedOutput: "dir \"c:\\program files\" ",
        recipeConfig: [
            {
                "op": "From Base64",
                "args": ["A-Za-z0-9+/=", true]
            },
            {
                "op": "Decode text",
                "args": ["UTF-16LE (1200)"]
            },
            {
                "op": "Encode text",
                "args": ["UTF-8 (65001)"]
            },
        ],
    },
    {
        name: "Encode text (GB18030): one, two and four byte characters",
        input: "a\u4e2d\u0080\u20ac\u{302F8}\u{1F600}\ue78d",
        expectedOutput: "61 d6 d0 81 30 81 30 a2 e3 9a 34 d0 32 94 39 fc 36 a6 d9",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["Simplified Chinese GB18030 (54936)"]
            },
            {
                "op": "To Hex",
                "args": ["Space"]
            },
        ],
    },
    {
        name: "Decode text (GB18030): one, two and four byte characters",
        input: "61 d6 d0 81 30 81 30 a2 e3 9a 34 d0 32 94 39 fc 36",
        expectedOutput: "a\u4e2d\u0080\u20ac\u{302F8}\u{1F600}",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "Decode text",
                "args": ["Simplified Chinese GB18030 (54936)"]
            },
        ],
    },
    {
        name: "Encode text, Decode text (GB18030): CJK Extension G round trip",
        input: "\u{30000}\u{302F8}\u{3134A}",
        expectedOutput: "\u{30000}\u{302F8}\u{3134A}",
        recipeConfig: [
            {
                "op": "Encode text",
                "args": ["Simplified Chinese GB18030 (54936)"]
            },
            {
                "op": "Decode text",
                "args": ["Simplified Chinese GB18030 (54936)"]
            },
        ],
    },
]);
