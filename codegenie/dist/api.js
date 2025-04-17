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
exports.fetchAICompletion = void 0;
const axios_1 = __importDefault(require("axios"));
const API_URL = "http://localhost:8000/generate";
function fetchAICompletion(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(API_URL, { prompt, max_tokens: 1000 });
            return response.data.response.trim();
        }
        catch (error) {
            console.error("❌ FastAPI Error:", error);
            return "Error generating code.";
        }
    });
}
exports.fetchAICompletion = fetchAICompletion;
