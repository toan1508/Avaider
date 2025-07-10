import { useEffect, useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Dán ảnh từ clipboard
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      const newImages = [];
      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          newImages.push(file);
        }
      }
      if (newImages.length)
        setSelectedImages((prev) => [...prev, ...newImages]);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage && selectedImages.length === 0) return;

    const newMessages = [];

    if (userMessage) {
      newMessages.push({ role: "user", text: userMessage });
    }

    if (selectedImages.length > 0) {
      const imageMessages = selectedImages.map((img) => ({
        role: "user",
        image: URL.createObjectURL(img),
        imageFile: img, // để AI phân tích
      }));
      newMessages.push(...imageMessages);
    }

    inputRef.current.value = "";
    setSelectedImages([]);

    setChatHistory((prev) => [
      ...prev,
      ...newMessages,
      { role: "model", text: "Thinking..." },
    ]);

    const updatedHistory = [
      ...chatHistory,
      ...newMessages, // giữ lại imageFile
    ];

    generateBotResponse(updatedHistory);
  };

  const handleGenerateImage = async () => {
    const prompt = inputRef.current.value.trim();
    if (!prompt) return;

    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: prompt },
      { role: "model", text: "Đang tạo ảnh..." },
    ]);
    inputRef.current.value = "";

    try {
      const res = await fetch(import.meta.env.VITE_IMAGE_GEN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const imageUrl = data.url || data.image_url;

      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Đang tạo ảnh..."),
        imageUrl
          ? { role: "model", image: imageUrl }
          : { role: "model", text: "❌ Không thể tạo ảnh." },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Đang tạo ảnh..."),
        { role: "model", text: "❌ Không thể tạo ảnh." },
      ]);
    }
  };

  const handleEmojiSelect = (emoji) => {
    inputRef.current.value += emoji.native;
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {selectedImages.length > 0 && (
        <div
          className="image-preview-container"
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "6px",
            marginBottom: "6px",
            padding: "2px 4px",
          }}
        >
          {selectedImages.map((img, index) => (
            <div
              key={index}
              style={{ position: "relative", display: "inline-block" }}
            >
              <img
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                style={{
                  height: "70px",
                  borderRadius: "6px",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => removeImage(index)}
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 3px rgba(0,0,0,0.3)",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        className="chat-form"
        onSubmit={handleFormSubmit}
        style={{ position: "relative" }}
      >
        {showEmojiPicker && (
          <div
            className="emoji-picker"
            style={{
              position: "absolute",
              bottom: "65px",
              right: "10px",
              zIndex: 100,
            }}
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              navPosition="top"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          id="image-upload"
          onChange={handleFileChange}
        />

        <input
          type="text"
          placeholder="Message..."
          className="message-input"
          required={selectedImages.length === 0}
          ref={inputRef}
        />

        <label htmlFor="image-upload" title="Tải ảnh lên" style={iconStyle}>
          📁
        </label>

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Chọn emoji"
          style={iconStyle}
        >
          😊
        </button>

        <button
          className="material-symbols-rounded"
          type="submit"
          style={{
            width: "30px",
            height: "30px",
            boxShadow: "0 0 9px rgba(0, 0, 0, 0.95)",
          }}
        >
          {" "}
          arrow_upward{" "}
        </button>
      </form>
    </>
  );
};

const iconStyle = {
  width: "36px",
  height: "36px",
  marginRight: "6px",
  cursor: "pointer",
  background: "none",
  border: "none",
  fontSize: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default ChatForm;
