/**
 * Webpack config to bundle TypeScript code for a VS Code extension.
 * - Compiles .ts files into dist/extension.js
 * - Webpack is needed because VS Code runs .js, not .ts
 * - This setup defines how Webpack should behave when you run `npm run build`
 */

// A configuration file is a file used to define settings and preferences for how software or tools should run.
//  It tells a program how to behave, what options to use, where to find files.

const path = require("path"); // Node module for working with file paths

module.exports = {
    mode: "development",        // Keep output readable (not minified)
    target: "node",             // Bundle for Node.js (not browser)

    entry: "./src/extension.ts", // Entry point of the app

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
                use: "ts-loader",        // Transpile TypeScript to JavaScript
                exclude: /node_modules/  // Skip dependencies
            },
        ],
    },

    externals: {
        vscode: "commonjs vscode", // Don't bundle VS Code API
    },
};