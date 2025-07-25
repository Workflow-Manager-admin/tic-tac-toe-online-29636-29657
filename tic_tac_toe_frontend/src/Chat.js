import React, { useState, useRef, useEffect } from "react";
import "./Chat.css";

/**
 * AI Chat interface for Tic Tac Toe app.
 * Modern, minimal UI using primary/accent colors.
 * 
 * OpenAI API calls are STUBBED on client for security.
 * For production, you must create a secure backend endpoint 
 * that holds your OPENAI_API_KEY and forward requests from the frontend.
 * See comments below for proxy backend guidance.
 */

// PUBLIC_INTERFACE
function Chat() {
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi! I'm your AI assistant. How can I help with Tic Tac Toe?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll chat to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // PUBLIC_INTERFACE
  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((msgs) => [...msgs, { from: "user", text: question }]);
    setInput("");
    setIsLoading(true);

    // === SAFETY: DO NOT put API keys in frontend code ===
    // This is a safe stub: in production, make a POST request to your backend proxy endpoint.
    // --- Example for backend proxy POST: ---
    //    fetch("/api/openai/chat", { method:'POST', body: JSON.stringify({message:question}) })
    // Your backend will use the OPENAI_API_KEY from env and return the AI's reply.
    // See: https://platform.openai.com/docs/guides/chat
    //
    // Here, we provide a placeholder/stubbed fake AI response for demo security:
    setTimeout(() => {
      let aiText = "(demo) Sorry, I'm an AI stub - your backend must proxy requests to OpenAI securely!";
      // Optionally add a playful fake answer
      if (/who.*win|tips|help|strategy/i.test(question)) {
        aiText = "Pro tip: Try to take the center cell first. Block your opponent and watch for winning moves!";
      } else if (/hello|hi|hey/i.test(question)) {
        aiText = "Hello! Ready for some Tic Tac Toe?";
      } else if (/how.*play|rules/i.test(question)) {
        aiText = "You and your opponent take turns. First to get 3 in a row (horizontally, vertically or diagonally) wins!";
      } 
      setMessages((msgs) => [...msgs, { from: "ai", text: aiText }]);
      setIsLoading(false);
    }, 1200);
  };

  // Keyboard: Enter to submit
  const handleInputKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      handleSend(e);
    }
  };

  return (
    <div className="chat-ai-root" aria-label="AI Chat Assistant">
      <div className="chat-title">
        💬 AI Chat
      </div>
      <div className="chat-messages" ref={scrollRef} aria-live="polite">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={"chat-msg" + (m.from === "user" ? " chat-msg-user" : " chat-msg-ai")}
            aria-label={m.from === "user" ? "User message" : "AI message"}
          >
            {m.text}
          </div>
        ))}
        {isLoading && <div className="chat-msg chat-msg-ai chat-msg-typing">...</div>}
      </div>
      <form className="chat-input-row" onSubmit={handleSend} autoComplete="off">
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKey}
          placeholder="Type your message…"
          disabled={isLoading}
          aria-label="Type your message"
        />
        <button className="chat-send-btn" disabled={!input.trim() || isLoading} type="submit" aria-label="Send message">
          Send
        </button>
      </form>
      <div className="chat-note">
        <span>🚨 Never put your OpenAI API key in frontend code! <br />
        Connect a backend proxy to enable real AI chat.</span>
      </div>
    </div>
  );
}

export default Chat;
