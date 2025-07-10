import AvaiderAIIcon from "./AvaiderAiIcon";

const ChatMessage = ({ chat, setModalImage }) => {
  if (chat.image) {
    return (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message`}
      >
        {chat.role === "model" && <AvaiderAIIcon />}
        <img
          src={chat.image}
          alt="Ảnh phản hồi từ Avaider"
          loading="lazy"
          onClick={() => setModalImage?.(chat.image)}
          className="chat-image"
          style={{
            maxWidth: "220px",
            maxHeight: "150px",
            borderRadius: "10px",
            cursor: "zoom-in",
            marginTop: "6px",
          }}
        />
      </div>
    );
  }

  return (
    !chat.hideInChat && (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message`}
      >
        {chat.role === "model" && <AvaiderAIIcon />}
        <p className="message-text">{chat.text}</p>
      </div>
    )
  );
};

export { ChatMessage };
export default ChatMessage;
