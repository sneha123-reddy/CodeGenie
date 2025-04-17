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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
require("./styles.css");
const ChatBox = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const chatRef = (0, react_1.useRef)(null);
    const scrollToBottom = () => {
        if (chatRef.current) {
            chatRef.current.scrollTo({
                top: chatRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };
    (0, react_1.useEffect)(() => {
        scrollToBottom();
    }, [messages, isTyping]);
    const sendMessage = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!input.trim())
            return;
        const prompt = input.trim();
        setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
        setInput("");
        setIsTyping(true);
        try {
            // ✅ Type the Axios response
            const response = yield axios_1.default.post("http://127.0.0.1:8000/generate", {
                prompt,
                max_tokens: 500
            });
            if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.response)) {
                throw new Error("Empty response from server");
            }
            const aiResponse = extractOnlyCode(response.data.response);
            setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
        }
        catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [
                ...prev,
                { text: "❌ Error: Failed to get response from AI backend", sender: "bot" }
            ]);
        }
        setIsTyping(false);
    });
    const extractOnlyCode = (response) => {
        return response
            .split("\n")
            .filter(line => !/^[/#*]+/.test(line.trim()) &&
            !/^\s*(?:This|Explanation|The function)/i.test(line.trim()) &&
            line.trim() !== "")
            .join("\n")
            .trim();
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-container" }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-history", ref: chatRef }, { children: [messages.map((msg, index) => ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: `message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}` }, { children: msg.text }), index))), isTyping && (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "typing-indicator" }, { children: "CodeGenie is typing..." }))] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "chatbox-input-area" }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ className: "action-button" }, { children: "+" })), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "action-button" }, { children: "@" })), (0, jsx_runtime_1.jsx)("input", { className: "chatbox-input", type: "text", placeholder: "Type your task here", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                            if (e.key === "Enter")
                                sendMessage();
                        } }), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "send-button", onClick: sendMessage }, { children: "\u27A4" }))] }))] })));
};
exports.default = ChatBox;
