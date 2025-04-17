"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const CodeGenieViewProvider_1 = require("./CodeGenieViewProvider");
let EXTENSION_STATUS = true;
let statusBarItem;
let provider;
function activate(context) {
    console.log("✅ CodeGenie Extension Activated!");
    provider = new CodeGenieViewProvider_1.CodeGenieViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(CodeGenieViewProvider_1.CodeGenieViewProvider.viewType, provider));
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    updateStatusBar();
    statusBarItem.show();
    let generateCode = vscode.commands.registerCommand('codegenie.getCode', () => __awaiter(this, void 0, void 0, function* () {
        if (!EXTENSION_STATUS) {
            vscode.window.showErrorMessage("❌ Autocomplete is disabled.");
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('❌ Open a file to use CodeGenie.');
            return;
        }
        const prompt = yield vscode.window.showInputBox({ prompt: 'Enter your AI prompt' });
        if (!prompt)
            return;
        yield generateCodeFromPrompt(editor, prompt);
    }));
    let generateFromComment = vscode.commands.registerCommand('codegenie.generateFromComment', () => __awaiter(this, void 0, void 0, function* () {
        if (!EXTENSION_STATUS) {
            vscode.window.showErrorMessage("❌ Autocomplete is disabled.");
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('❌ Open a file to use CodeGenie.');
            return;
        }
        const document = editor.document;
        const lastComment = findLastComment(document);
        if (!lastComment) {
            vscode.window.showErrorMessage("❌ No comment found.");
            return;
        }
        yield generateCodeFromPrompt(editor, lastComment);
    }));
    let enableAutocomplete = vscode.commands.registerCommand('codegenie.enableAutocomplete', () => {
        EXTENSION_STATUS = true;
        vscode.window.showInformationMessage("✅ CodeGenie Autocomplete Enabled");
        updateStatusBar();
    });
    let disableAutocomplete = vscode.commands.registerCommand('codegenie.disableAutocomplete', () => {
        EXTENSION_STATUS = false;
        vscode.window.showWarningMessage("🛑 CodeGenie Autocomplete Disabled");
        updateStatusBar();
    });
    context.subscriptions.push(generateCode, generateFromComment, enableAutocomplete, disableAutocomplete);
    const inlineProvider = {
        provideInlineCompletionItems: (document, position) => __awaiter(this, void 0, void 0, function* () {
            if (!EXTENSION_STATUS)
                return [];
            let textBeforeCursor = document.getText(new vscode.Range(position.with(undefined, 0), position)).trim();
            if (!textBeforeCursor) {
                for (let line = position.line - 1; line >= 0; line--) {
                    let prevLineText = document.lineAt(line).text.trim();
                    if (prevLineText.length > 0) {
                        textBeforeCursor = prevLineText;
                        break;
                    }
                }
            }
            if (!textBeforeCursor)
                return [];
            try {
                console.log("🔵 Autocomplete for:", textBeforeCursor);
                statusBarItem.text = "$(sync~spin) CodeGenie: Generating...";
                let aiResponse = yield fetchAICompletion(textBeforeCursor);
                if (!aiResponse || aiResponse.trim() === "") {
                    statusBarItem.text = "$(alert) CodeGenie: No response";
                    return [];
                }
                statusBarItem.text = "$(check) CodeGenie: Ready";
                return [
                    new vscode.InlineCompletionItem(new vscode.SnippetString(`\n${aiResponse}`), new vscode.Range(position, position))
                ];
            }
            catch (error) {
                console.error("❌ Autocomplete Error:", error);
                statusBarItem.text = "$(error) CodeGenie: Error";
                return [];
            }
        })
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, inlineProvider);
}
exports.activate = activate;
function generateCodeFromPrompt(editor, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInformationMessage("✨ Generating Code...");
        statusBarItem.text = "$(sync~spin) CodeGenie: Generating...";
        try {
            const rawResponse = yield fetchAICompletionRaw(prompt);
            const aiResponse = extractOnlyCode(rawResponse);
            if (!aiResponse) {
                vscode.window.showErrorMessage("❌ No code generated.");
                statusBarItem.text = "$(alert) CodeGenie: No response";
                return;
            }
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, `\n${aiResponse.trim()}\n`);
            });
            // ✅ Send full explanation + code to Webview
            if (provider && provider._view) {
                provider._view.webview.postMessage({
                    type: "aiResponse",
                    content: rawResponse
                });
            }
            vscode.window.showInformationMessage("✅ Code inserted!");
            updateStatusBar();
        }
        catch (error) {
            vscode.window.showErrorMessage("❌ Error generating code.");
            statusBarItem.text = "$(error) CodeGenie: Error";
        }
    });
}
function findLastComment(document) {
    for (let i = document.lineCount - 1; i >= 0; i--) {
        const text = document.lineAt(i).text.trim();
        if (text.startsWith("//") || text.startsWith("#")) {
            return text.replace(/^[/#]+/, "").trim();
        }
    }
    return null;
}
function fetchAICompletion(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = yield fetchAICompletionRaw(prompt);
        return extractOnlyCode(raw);
    });
}
function fetchAICompletionRaw(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("http://127.0.0.1:8000/generate", {
                prompt,
                max_tokens: 500
            });
            let aiResponse = response.data.response || "";
            if (aiResponse.startsWith(prompt)) {
                aiResponse = aiResponse.replace(prompt, "").trim();
            }
            return aiResponse;
        }
        catch (error) {
            console.error("❌ Fetch Error:", error);
            return "";
        }
    });
}
function extractOnlyCode(response) {
    const match = response.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    if (match)
        return match[1].trim();
    return response
        .split("\n")
        .filter(line => {
        const trimmed = line.trim();
        return (trimmed &&
            !trimmed.startsWith("//") &&
            !trimmed.startsWith("#") &&
            !trimmed.startsWith("*") &&
            !/^(Note|This|Explanation|To solve|In this)/i.test(trimmed));
    })
        .join("\n")
        .trim();
}
function updateStatusBar() {
    statusBarItem.text = EXTENSION_STATUS ? "$(check) CodeGenie: Ready" : "$(x) CodeGenie: Disabled";
}
function deactivate() {
    console.log("🛑 CodeGenie Extension Deactivated");
    statusBarItem.dispose();
}
exports.deactivate = deactivate;
