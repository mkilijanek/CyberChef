/**
 * StrUtils tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Regex: non-HTML op",
        input: "/<>",
        expectedOutput: "/<>",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "", true, true, false, false, false, false, "Highlight matches"]
            },
            {
                "op": "Remove whitespace",
                "args": [true, true, true, true, true, false]
            }
        ],
    },
    {
        name: "Regex: Dot matches all",
        input: "Hello\nWorld",
        expectedOutput: "Hello\nWorld",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", ".+", true, true, true, false, false, false, "List matches"]
            }
        ],
    },
    {
        name: "Regex: Astral off",
        input: "𝌆😆",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "\\pS", true, true, false, false, false, false, "List matches"]
            }
        ],
    },
    {
        name: "Regex: Astral on",
        input: "𝌆😆",
        expectedOutput: "𝌆\n😆",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "\\pS", true, true, false, false, true, false, "List matches"]
            }
        ],
    },
    {
        name: "Regex: built-in email matches full IPv4 domain literals",
        input: "false_positive@[1.2.3.] is matched\nfalse_negative@[1.2.3.4] is not matched",
        expectedOutput: "false_negative@[1.2.3.4]",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["Email address", "(?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9](?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9-]*[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9])?\\.)+[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9](?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9-]*[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\])", true, true, false, false, false, false, "List matches"]
            }
        ],
    }
]);
