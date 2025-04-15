import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css";

// ✅ Define the response structure expected from the backend
interface GenerateResponse {
  response: string;
}

const ChatBox = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    try {
      // ✅ Type the Axios response
      const response = await axios.post<GenerateResponse>("http://127.0.0.1:8000/generate", {
        prompt,
        max_tokens: 500
      });

      if (!response.data?.response) {
        throw new Error("Empty response from server");
      }

      const aiResponse = extractOnlyCode(response.data.response);
      setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [
        ...prev,
        { text: "❌ Error: Failed to get response from AI backend", sender: "bot" }
      ]);
    }

    setIsTyping(false);
  };

  const extractOnlyCode = (response: string) => {
    return response
      .split("\n")
      .filter(line =>
        !/^[/#*]+/.test(line.trim()) &&
        !/^\s*(?:This|Explanation|The function)/i.test(line.trim()) &&
        line.trim() !== ""
      )
      .join("\n")
      .trim();
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-history" ref={chatRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">CodeGenie is typing...</div>}
      </div>

      <div className="chatbox-input-area">
        <button className="action-button">+</button>
        <button className="action-button">@</button>
        <input
          className="chatbox-input"
          type="text"
          placeholder="Type your task here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button className="send-button" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
};

export default ChatBox;
