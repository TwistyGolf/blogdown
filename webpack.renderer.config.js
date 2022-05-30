const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const assets = ["fonts"]; // asset directories

rules.push({
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
    test: /\.scss$/,
    use: ["style-loader", "css-loader", "sass-loader"],
});

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    },
};
