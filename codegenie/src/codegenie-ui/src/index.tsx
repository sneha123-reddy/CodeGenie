import React from "react";
import ReactDOM from "react-dom/client";
import ChatBox from "./ChatBox"; 
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ChatBox />
  </React.StrictMode>
);
