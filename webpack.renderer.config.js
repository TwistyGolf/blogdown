const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const assets = ["img", "pages"]; // asset directories

rules.push({
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
    test: /\.scss$/,
    use: ["style-loader", "css-loader", "sass-loader"],
});

plugins.push(
    new CopyWebpackPlugin({
        patterns: assets.map((asset) => {
            return {
                from: path.resolve(__dirname, "src", asset),
                to: path.resolve(__dirname, ".webpack/renderer", asset),
            };
        }),
    })
);

module.exports = {
    target: "electron-renderer",
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    },
};
