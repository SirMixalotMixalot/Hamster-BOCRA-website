import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, MessageCircle, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

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

  const handleSend = (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        licence: "To apply for a licence, visit the **Licensing** section under Services. BOCRA issues licences for telecommunications, broadcasting, postal, and ICT services. You can start your application through our online portal or download the relevant forms from the Documents section.",
        complaint: "To file a complaint, go to the **Complaints** section. You can submit complaints about service quality, billing disputes, or unfair practices by communications service providers. BOCRA investigates all valid complaints.",
        statistics: "Telecom statistics are available in the **Resources** section. You'll find data on mobile subscriptions, internet penetration, service quality metrics, and market reports updated quarterly.",
        "type approval": "**Type Approval** is the process of certifying that communications equipment meets Botswana's technical standards. Manufacturers and importers must obtain type approval before selling equipment in Botswana.",
        regulation: "BOCRA's regulatory framework includes the Communications Regulatory Authority Act (2012), Telecommunications Act, Broadcasting Act amendments, and various sector-specific regulations. Find them in the **Documents & Legislation** section.",
      };

      const key = Object.keys(responses).find((k) => userMsg.toLowerCase().includes(k));
      const reply = key
        ? responses[key]
        : "Thank you for your question. I can help you navigate BOCRA's services including licensing, complaints, type approval, regulations, and telecom statistics. Could you please be more specific about what you're looking for?";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setIsTyping(false);
    }, 1200);
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
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
                  {msg.content.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
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
