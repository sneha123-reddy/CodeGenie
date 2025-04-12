import * as vscode from 'vscode';
import axios from "axios";
import { CodeGenieViewProvider } from "./CodeGenieViewProvider";

let EXTENSION_STATUS = true;
let statusBarItem: vscode.StatusBarItem;
let provider: CodeGenieViewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log("✅ CodeGenie Extension Activated!");

    provider = new CodeGenieViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CodeGenieViewProvider.viewType, provider)
    );

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    updateStatusBar();
    statusBarItem.show();

    let generateCode = vscode.commands.registerCommand('codegenie.getCode', async () => {
        if (!EXTENSION_STATUS) {
            vscode.window.showErrorMessage("❌ Autocomplete is disabled.");
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('❌ Open a file to use CodeGenie.');
            return;
        }

        const prompt = await vscode.window.showInputBox({ prompt: 'Enter your AI prompt' });
        if (!prompt) return;

        await generateCodeFromPrompt(editor, prompt);
    });

    let generateFromComment = vscode.commands.registerCommand('codegenie.generateFromComment', async () => {
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

        await generateCodeFromPrompt(editor, lastComment);
    });

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

    const inlineProvider: vscode.InlineCompletionItemProvider = {
        provideInlineCompletionItems: async (document, position) => {
            if (!EXTENSION_STATUS) return [];

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

            if (!textBeforeCursor) return [];

            try {
                console.log("🔵 Autocomplete for:", textBeforeCursor);
                statusBarItem.text = "$(sync~spin) CodeGenie: Generating...";

                let aiResponse = await fetchAICompletion(textBeforeCursor);
                if (!aiResponse || aiResponse.trim() === "") {
                    statusBarItem.text = "$(alert) CodeGenie: No response";
                    return [];
                }

                statusBarItem.text = "$(check) CodeGenie: Ready";

                return [
                    new vscode.InlineCompletionItem(
                        new vscode.SnippetString(`\n${aiResponse}`),
                        new vscode.Range(position, position)
                    )
                ];
            } catch (error) {
                console.error("❌ Autocomplete Error:", error);
                statusBarItem.text = "$(error) CodeGenie: Error";
                return [];
            }
        }
    };

    vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, inlineProvider);
}

async function generateCodeFromPrompt(editor: vscode.TextEditor, prompt: string) {
    vscode.window.showInformationMessage("✨ Generating Code...");
    statusBarItem.text = "$(sync~spin) CodeGenie: Generating...";

    try {
        const rawResponse = await fetchAICompletionRaw(prompt);
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
    } catch (error) {
        vscode.window.showErrorMessage("❌ Error generating code.");
        statusBarItem.text = "$(error) CodeGenie: Error";
    }
}

function findLastComment(document: vscode.TextDocument): string | null {
    for (let i = document.lineCount - 1; i >= 0; i--) {
        const text = document.lineAt(i).text.trim();
        if (text.startsWith("//") || text.startsWith("#")) {
            return text.replace(/^[/#]+/, "").trim();
        }
    }
    return null;
}

async function fetchAICompletion(prompt: string): Promise<string> {
    const raw = await fetchAICompletionRaw(prompt);
    return extractOnlyCode(raw);
}

async function fetchAICompletionRaw(prompt: string): Promise<string> {
    try {
        const response = await axios.post("http://127.0.0.1:8000/generate", {
            prompt,
            max_tokens: 500
        });

        let aiResponse = response.data.response || "";
        if (aiResponse.startsWith(prompt)) {
            aiResponse = aiResponse.replace(prompt, "").trim();
        }
        return aiResponse;
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        return "";
    }
}

function extractOnlyCode(response: string): string {
    const match = response.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/);
    if (match) return match[1].trim();

    return response
        .split("\n")
        .filter(line => {
            const trimmed = line.trim();
            return (
                trimmed &&
                !trimmed.startsWith("//") &&
                !trimmed.startsWith("#") &&
                !trimmed.startsWith("*") &&
                !/^(Note|This|Explanation|To solve|In this)/i.test(trimmed)
            );
        })
        .join("\n")
        .trim();
}

function updateStatusBar() {
    statusBarItem.text = EXTENSION_STATUS ? "$(check) CodeGenie: Ready" : "$(x) CodeGenie: Disabled";
}

export function deactivate() {
    console.log("🛑 CodeGenie Extension Deactivated");
    statusBarItem.dispose();
}
