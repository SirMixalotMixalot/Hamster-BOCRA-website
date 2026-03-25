import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, MessageCircle, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; sources?: string[] };

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = "http://localhost:8000";
  return (configured || fallback).replace(/\/$/, "");
}

function isHttpLikeLink(value: string): boolean {
  return value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:");
}

const suggestions = [
  "How do I apply for a licence?",
  "How do I file a complaint?",
  "Where can I find telecom statistics?",
  "What is type approval?",
  "Show me BOCRA regulations",
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm BOCRA's AI Assistant. I can help you find services, documents, regulations, and answer questions about communications regulation in Botswana. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-ai-chatbot", handler);
    return () => window.removeEventListener("toggle-ai-chatbot", handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) {
        let detail = "I could not fetch an answer right now. Please try again.";
        try {
          const payload = (await response.json()) as { detail?: string };
          if (typeof payload.detail === "string" && payload.detail.trim()) {
            detail = payload.detail;
          }
        } catch {
          // Keep fallback detail.
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: detail,
          },
        ]);
        return;
      }

      const payload = (await response.json()) as { reply?: string; sources?: string[] };
      const reply = typeof payload.reply === "string" && payload.reply.trim()
        ? payload.reply
        : "I found limited information. Please contact BOCRA via +267 395 7755 or info@bocra.org.bw.";

      const sources = Array.isArray(payload.sources)
        ? payload.sources.filter((source) => typeof source === "string" && source.trim() && isHttpLikeLink(source))
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          sources: sources && sources.length > 0 ? sources : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not reach the BOCRA assistant service right now. Please try again or contact BOCRA at +267 395 7755.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-100px)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <div className="text-sm font-semibold">BOCRA AI Assistant</div>
                <div className="text-[10px] text-primary-foreground/70">Powered by AI · Always ready to help</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {msg.content.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                  {msg.role === "assistant" && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs">
                      {msg.sources.map((source, idx) => (
                        <a
                          key={`${source}-${idx}`}
                          href={source}
                          target={source.startsWith("http") ? "_blank" : undefined}
                          rel={source.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="block underline text-primary hover:opacity-80"
                        >
                          Source {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about BOCRA services..."
                className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
