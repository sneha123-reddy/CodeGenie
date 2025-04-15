// When we press npm run, this file creates a new .js file called dist/extension.js
// This file is created because the browser needs a .js file not .ts file and we wrote the code in .ts
// So it comprises all the .ts files functionality into one file and runs it in one go.


// A configuration file is a file used to define settings and preferences for how software or tools should run.
//  It tells a program how to behave, what options to use, where to find files.

const path = require("path"); // Node module for working with file paths

module.exports = {
    mode: "development",        // Keep output readable (not minified)
    target: "node",             // Bundle for Node.js (not browser)

    entry: "./src/extension.ts", // Starting point of the app

    output: {
        path: path.resolve(__dirname, "dist"), // Output directory
        filename: "extension.js",              // Output filename
        libraryTarget: "commonjs2",            // Module format for VS Code/Node
    },

    resolve: {
        extensions: [".ts", ".js"], // Auto-resolve these file extensions
    },

    module: {
        rules: [
            {
                test: /\.ts$/,           // Match .ts files
                use: "ts-loader",        // Use ts-loader to transpile
                exclude: /node_modules/  // Skip dependencies
            },
        ],
    },

    externals: {
        vscode: "commonjs vscode", // Don't bundle VS Code API
    },
};