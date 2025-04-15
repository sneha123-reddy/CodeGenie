// When we press npm run, this file creates a new .js file called dist/extension.js
// This file is created because the browser needs a .js file not .ts file and we wrote the code in .ts
// So it comprises all the .ts files functionality into one file and runs it in one go.

const path = require("path");

module.exports = {
    mode: "development",
    target: "node",
    entry: "./src/extension.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        vscode: "commonjs vscode",
    },
};
