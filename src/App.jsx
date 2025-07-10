import { useEffect, useState } from "react";
import AvaiderAIIcon from "./components/AvaiderAiIcon";
import ChatForm from "./components/ChatForm";
import { ChatMessage } from "./components/ChatMessage";
import { companyInfo } from "../companyInfo";

const colors = [
  "#ff4c4c",
  "#ff9900",
  "#fcd800",
  "#33cc33",
  "#3399ff",
  "#6666cc",
  "#cc33cc",
  "#54575c",
];

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    { hideInChat: true, role: "model", text: companyInfo },
  ]);
  const [themeColor, setThemeColor] = useState("#54575c");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [modalImage, setModalImage] = useState(null);

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
      default:
        light = "#d8dfe4";
        dark = "#161616";
    }
    document.body.style.background = `linear-gradient(${light}, ${themeColor}, ${dark})`;
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  const detectLanguage = (text) =>
    /[ăâêôơưđàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(text) ? "vi" : "en";

  const generateBotResponse = async (history) => {
    const last = history.at(-1);
    const lastText = last?.text?.trim();
    const lastImage = last?.image;
    const lastImageFile = last?.imageFile;

    const updateHistory = (message) => {
      setChatHistory((prev) => [
        ...prev.filter(
          (m) =>
            ![
              "Thinking...",
              "Đang tạo ảnh...",
              "🧠 Đang phân tích ảnh...",
            ].includes(m.text)
        ),
        message,
      ]);
    };

    if (lastImage && lastImageFile) {
      updateHistory({ role: "model", text: "🧠 Đang phân tích ảnh..." });
      try {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(lastImageFile);
        });

        const res = await fetch(import.meta.env.VITE_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: "Describe this image" },
                  {
                    inlineData: { mimeType: lastImageFile.type, data: base64 },
                  },
                ],
              },
            ],
          }),
        });

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        updateHistory({
          role: "model",
          text: text || "🤖 Không thể phân tích ảnh.",
        });
      } catch {
        updateHistory({ role: "model", text: "❌ Lỗi khi xử lý ảnh." });
      }
      return;
    }

    if (/^(vẽ|draw|tạo ảnh|make)/i.test(lastText)) {
      updateHistory({ role: "model", text: "Đang tạo ảnh..." });
      try {
        const res = await fetch(import.meta.env.VITE_IMAGE_GEN_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: lastText }),
        });
        const data = await res.json();
        const url = data.url || data.image_url;
        if (url) updateHistory({ role: "model", image: url });
        else updateHistory({ role: "model", text: "❌ Không thể tạo ảnh." });
      } catch {
        updateHistory({ role: "model", text: "❌ Không thể tạo ảnh." });
      }
      return;
    }

    updateHistory({ role: "model", text: "Thinking..." });
    const lang = detectLanguage(lastText);
    const prompt =
      (lang === "vi" ? "Trả lời bằng tiếng Việt: " : "Reply in English: ") +
      lastText;

    const formatted = history
      .map((m) => m.text && { role: m.role, parts: [{ text: m.text }] })
      .filter(Boolean);

    try {
      const res = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [...formatted, { role: "user", parts: [{ text: prompt }] }],
        }),
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      updateHistory({ role: "model", text: reply || "❌ Không có phản hồi." });
    } catch {
      updateHistory({ role: "model", text: "❌ Lỗi kết nối hoặc API." });
    }
  };

  return (
    <div className="container">
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="zoom" />
        </div>
      )}

      <div className="color-button-wrapper">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="color-toggle-button"
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
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.95)",
                border: c === themeColor ? "3px solid white" : "2px solid #999",
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
            <h2 className="logo-text">Avaider AI</h2>
          </div>
        </div>

        <div className="chat-body">
          <div className="message bot-message">
            <AvaiderAIIcon />
            <p className="message-text">
              Hey there 👋, I am Avaider AI.
              <br />
              How can I help you today?
            </p>
          </div>
          {chatHistory
            .filter((m) => !m.hideInChat)
            .map((msg, i) => (
              <ChatMessage key={i} chat={msg} setModalImage={setModalImage} />
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
