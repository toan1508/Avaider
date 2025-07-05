import AvaiderAIIcon from "./AvaiderAiIcon";
const ChatMessage = ({ chat }) => {
  return (
    !chat.hideInChat && (
      <div
        className={`message ${chat.role === "model" ? "bot" : "user"}-message `}
      >
        {chat.role === "model" && <AvaiderAIIcon />}
        <p className="message-text">{chat.text}</p>
      </div>
    )
  );
};
export { ChatMessage };
export default ChatMessage;

