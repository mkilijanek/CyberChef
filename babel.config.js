module.exports = function(api) {
    api.cache.forever();

    return {
        "presets": [
            ["@babel/preset-env", {
                "modules": false,
                "useBuiltIns": "entry",
                "corejs": 3
            }]
        ],
        "plugins": [
            "@babel/plugin-syntax-import-attributes",
            [
                "@babel/plugin-transform-runtime", {
                    "regenerator": true
                }
            ]
        ]
    };
};
