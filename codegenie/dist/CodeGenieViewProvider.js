"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenieViewProvider = void 0;
class CodeGenieViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(view) {
        this._view = view;
        view.webview.options = { enableScripts: true };
        view.webview.html = this.getWebviewContent();
        view.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            if (message.command === 'generate') {
                const aiResponse = yield this.fetchAICompletion(message.text);
                view.webview.postMessage({ command: 'displayResult', text: aiResponse });
            }
        }));
    }
    fetchAICompletion(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return `// AI-generated code for: ${prompt}\nconsole.log("Hello, world!");`;
            }
            catch (error) {
                console.error("Error:", error);
                return "Error generating code.";
            }
        });
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CodeGenie AI</title>
            <style> body { font-family: Arial; padding: 20px; } </style>
        </head>
        <body>
            <h2>CodeGenie AI</h2>
            <input type="text" id="input" placeholder="Enter prompt..." />
            <button id="generate">Generate</button>
            <pre id="output"></pre>
            <script>
                const vscode = acquireVsCodeApi();
                document.getElementById('generate').addEventListener('click', () => {
                    vscode.postMessage({ command: 'generate', text: document.getElementById('input').value });
                });
                window.addEventListener('message', event => {
                    if (event.data.command === 'displayResult') {
                        document.getElementById('output').textContent = event.data.text;
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
exports.CodeGenieViewProvider = CodeGenieViewProvider;
CodeGenieViewProvider.viewType = 'codegenieView';
