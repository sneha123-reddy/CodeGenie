import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css";
import { IoSendOutline, IoAddCircleOutline } from 'react-icons/io5';
import { HiDesktopComputer } from 'react-icons/hi';
import { BsPciCard } from 'react-icons/bs';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatBox = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const renderMessage = (msg: { text: string; sender: string }) => {
    if (msg.sender === "bot") {
      const { explanation, code } = extractCodeAndExplanation(msg.text);
  
      return (
        <div className="bot-message">
          {explanation && <p>{explanation}</p>}
          {code && (
            <SyntaxHighlighter language="tsx" style={darcula}>
              {code}
            </SyntaxHighlighter>
          )}
        </div>
      );
    }
  
    return <pre className="user-message">{msg.text}</pre>;
  };
  


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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      const minHeight = 40;

      if (scrollHeight > minHeight) {
        textarea.style.height = Math.min(scrollHeight, maxHeight) + "px";
        textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
      } else {
        textarea.style.height = minHeight + "px";
        textarea.style.overflowY = "hidden";
      }
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    try {
      const API_URL = isOnline
        ? "http://<rtx-4050-server-ip>:8000/generate"
        : "http://127.0.0.1:8000/generate";

      const response = await axios.post(API_URL, {
        prompt,
        max_tokens: 50000
      });

      if (!response.data?.response) throw new Error("Empty response");

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

  function extractOnlyCode(response: string): string {
    const codeRegex = /```(?:[\w]*)?\n?([\s\S]*?)```/;
    const match = response.match(codeRegex);
    return match ? match[1].trim() : response.trim();
  }
  
  function extractCodeAndExplanation(text: string): { explanation: string; code: string } {
    const codeRegex = /```(?:[\w]*)?\n?([\s\S]*?)```/;
    const match = text.match(codeRegex);
    const code = match ? match[1].trim() : "";
  
    const explanation = match ? text.replace(match[0], "").trim() : text.trim();
  
    return { explanation, code };
  }
  

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const fileContent = reader.result as string;

      setMessages(prev => [
        ...prev,
        { text: `📎 Attached: ${file.name}\n`, sender: "user" }
      ]);

      try {
        const API_URL = isOnline
          ? "http://<rtx-4050-server-ip>:8000/generate"
          : "http://127.0.0.1:8000/generate";

        const response = await axios.post(API_URL, {
          prompt: `User uploaded file: ${file.name}\n\n${fileContent}`,
          max_tokens: 50000
        });

        const aiResponse = extractOnlyCode(response.data.response);
        setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
      } catch (err) {
        console.error("AI File Upload Error:", err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-history" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
            {renderMessage(msg)}
          </div>
        ))}

        {isTyping && <div className="typing-indicator">CodeGenie is typing...</div>}
      </div>

      <div className="chatbox-input-area">
        <button className="action-button" onClick={() => fileInputRef.current?.click()}>
          <IoAddCircleOutline size={20} />
        </button>

        <button
          className="action-button"
          onClick={() => setIsOnline(prev => !prev)}
          title={isOnline ? "RTX Mode (Remote)" : "Local Mode (on device)"}
        >
          {isOnline ? <BsPciCard size={20} /> : <HiDesktopComputer size={20} />}
        </button>

        <textarea
          ref={textareaRef}
          className="chatbox-input"
          placeholder="Type your task here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        <button className="send-button" onClick={sendMessage}>
          <IoSendOutline size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;