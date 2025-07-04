import { useRef, useState } from "react";
import { companyInfo } from "/companyInfo";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const fileRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage && !selectedImage) return;

    const newMessages = [];

    if (userMessage) {
      newMessages.push({ role: "user", text: userMessage });
    }

    if (selectedImage) {
      const imageURL = URL.createObjectURL(selectedImage);
      newMessages.push({ role: "user", image: imageURL });
      setSelectedImage(null);
    }

    inputRef.current.value = "";

    setChatHistory((prev) => [...prev, ...newMessages, { role: "model", text: "Thinking..." }]);

    const latestUserText = newMessages.find((msg) => msg.text)?.text || "";
    const updatedHistory = [
      ...chatHistory,
      ...newMessages.filter((msg) => msg.text),
      {
        role: "user",
        text: `${companyInfo}\nNow answer this user query: ${latestUserText}`,
      },
    ];
    generateBotResponse(updatedHistory);
  };

  const handleEmojiSelect = (emoji) => {
    inputRef.current.value += emoji.native;
    setShowEmojiPicker(false); // đóng khung sau khi chọn
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <form className="chat-form" onSubmit={handleFormSubmit} style={{ position: "relative" }}>
      <button
        type="button"
        className="emoji-toggle"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          marginRight: "6px",
        }}
      >
        😊
      </button>

      {showEmojiPicker && (
        <div
          className="emoji-picker"
          style={{
            position: "absolute",
            bottom: "60px",
            left: "10px",
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
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <input
        type="text"
        placeholder="Message..."
        className="message-input"
        required={!selectedImage}
        ref={inputRef}
      />

      <button className="material-symbols-rounded" type="submit">
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;
