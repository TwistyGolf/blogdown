const path = require("path");
const cpy = require("cpy");

module.exports = {
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "electron_forge_webpack",
            },
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: ["darwin"],
        },
        {
            name: "@electron-forge/maker-deb",
            config: {},
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {},
        },
    ],
    hooks: {
        packageAfterExtract: async () => {
            console.log("On hook packageAfterExtract");
            await cpy(
                [path.resolve(__dirname, ".webpack/renderer/*.*")],
                path.resolve(__dirname, ".webpack/renderer/main_window")
            );
            console.log("Files copied!");
        },
    },
    plugins: [
        [
            "@electron-forge/plugin-webpack",
            {
                mainConfig: "./webpack.main.config.js",
                renderer: {
                    config: "./webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./src/index.html",
                            js: "./src/renderer.js",
                            name: "main_window",
                        },
                    ],
                },
            },
        ],
    ],
};
