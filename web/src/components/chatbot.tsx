"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "./ui/input";

const Chatbot = () => {
  // Initialize conversation with a welcome message from the bot
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot" }[]
  >([
    { text: "Hello! How can I assist you today? Feel free to ask for advice on saving energy.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
  
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, userMessage]),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch bot response");
      }
  
      const data = await response.json();
  
      // Ensure that the response is a string
      const botMessage = {
        text: typeof data === "string" ? data : JSON.stringify(data),
        sender: "bot",
      };
  
      setMessages((prev) => [...prev, botMessage]);
      console.log(messages);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { text: "An error occurred. Please try again.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="w-full rounded-lg shadow-lg bg-white">
      <div className="p-8 min-h-[50svh] flex flex-col">
        <h1 className="text-xl font-bold mb-4">Seek Advice</h1>
        <div className="flex-1 h-0 overflow-y-auto space-y-4 mb-4 p-2 border border-gray-200 rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {message.sender === "bot" ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            onClick={handleSendMessage}
            className={`px-4 py-2 rounded-lg ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
