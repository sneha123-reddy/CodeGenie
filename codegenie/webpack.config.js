// When we press npm run, this file creates a new .js file called dist/extension.js
// This file is created because the browser needs a .js file not .ts file and we wrote the code in .ts
// So it comprises all the .ts files functionality into one file and runs it in one go.


// A configuration file is a file used to define settings and preferences for how software or tools should run.
//  It tells a program how to behave, what options to use, where to find files.

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
