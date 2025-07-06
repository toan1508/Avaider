import { useEffect, useState } from "react";
import AvaiderAIIcon from "./components/AvaiderAiIcon";
import ChatForm from "./components/ChatForm";
import { ChatMessage } from "./components/ChatMessage";
import { companyInfo } from "../companyInfo";

const colors = [
  "#ff4c4c", // đỏ
  "#ff9900", // cam
  "#fcd800", // vàng
  "#33cc33", // lục
  "#3399ff", // lam
  "#6666cc", // chàm
  "#cc33cc", // tím
  "#54575c", // xám (mặc định)
];

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: companyInfo },
  ]);
  const [themeColor, setThemeColor] = useState("#54575c");
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    let light = "",
      dark = "";
    switch (themeColor) {
      case "#ff4c4c":
        light = "#ffd6d6";
        dark = "#660000";
        break;
      case "#ff9900":
        light = "#ffe5cc";
        dark = "#663300";
        break;
      case "#fcd800":
        light = "#fff0a6";
        dark = "#b58b00";
        break;
      case "#33cc33":
        light = "#ccffcc";
        dark = "#004d00";
        break;
      case "#3399ff":
        light = "#cce6ff";
        dark = "#003366";
        break;
      case "#6666cc":
        light = "#dcdcff";
        dark = "#1a1a66";
        break;
      case "#cc33cc":
        light = "#f0ccff";
        dark = "#660066";
        break;
      case "#54575c":
      default:
        light = "#d8dfe4";
        dark = "#161616";
    }

    document.body.style.background = `linear-gradient(${light}, ${themeColor}, ${dark})`;
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  const generateBotResponse = async (history) => {
    const lastUserMessage = history[history.length - 1].text.toLowerCase();
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

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
      });
      const data = await response.json();
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
      <div className="color-button-wrapper">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="color-toggle-button"
          title="Đổi màu giao diện"
          style={{
            background: "none",
          }}
        >
          🎨
        </button>

        <div className={`color-picker ${showColorPicker ? "show" : ""}`}>
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                setThemeColor(c);
                setShowColorPicker(false);
              }}
              style={{
                background: c,
                width: 26,
                height: 26,
                boxShadow: "0 0 6px rgba(0,0,0,0.8)",
                borderRadius: "50%",
                border: c === themeColor ? "3px solid white" : "2px solid #999",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
      <div className="chatbot-popup">
        <div
          className="chat-header"
          style={{ backgroundColor: "var(--theme-color)" }}
        >
          <div className="header-info">
            <AvaiderAIIcon />
            <h2 className="logo-text">Avaider Ai</h2>
          </div>
        </div>

        <div className="chat-body">
          <div className="message bot-message">
            <AvaiderAIIcon />
            <p className="message-text">
              Hey there 👋, I am Avaider AI. <br />
              How can I help you today?
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
