import { useState } from "react";
import AvaiderAIIcon from "./components/AvaiderAiIcon";
import ChatForm from "./components/ChatForm";
import { ChatMessage } from "./components/ChatMessage";
import { companyInfo } from "../companyInfo";

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const searchWikipedia = async (query) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      return data.extract || "I couldn’t find anything on Wikipedia.";
    } catch {
      return "Failed to fetch from Wikipedia.";
    }
  };

  const generateBotResponse = async (history) => {
    const lastUserMessage = history[history.length - 1].text.toLowerCase();
    if (
      lastUserMessage.startsWith("search ") ||
      lastUserMessage.startsWith("who is ") ||
      lastUserMessage.startsWith("what is ") ||
      lastUserMessage.startsWith("tell me about ")
    ) {
      const searchQuery = lastUserMessage.replace(
        /^(search|who is|what is|tell me about)\s+/i,
        ""
      );
      const wikiResult = await searchWikipedia(searchQuery);
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: wikiResult },
      ]);
      return;
    }
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };

    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong!");
      }

      const responseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      updateHistory(responseText);
    } catch (error) {
      updateHistory("Oops! Something went wrong.");
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <AvaiderAIIcon />
            <h2 className="logo-text">Avaider Ai</h2>
          </div>
        </div>

        <div className="chat-body">
          <div className="message bot-message">
            <AvaiderAIIcon />
            <p className="message-text">
              Hey there 👋, I am Avaider AI. <br /> How can I help you today?
            </p>
          </div>

          {chatHistory
            .filter((chat) => !chat.hideInChat)
            .map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
