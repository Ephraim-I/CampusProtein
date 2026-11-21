import { useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import "./AIAssistant.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Alternative Protein Coach. I can help you discover Nigerian protein-rich foods, answer nutrition questions, and suggest affordable meals. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fallbackResponses: Record<string, string> = {
    "alternative protein": "Alternative proteins are protein-rich foods from plants, fungi, and insects. In Nigeria, great options include cowpeas, soybeans, groundnuts, bambara nuts, mushrooms, and edible insects. They're affordable, nutritious, and sustainable!",
    "moi moi": "Moi Moi is a delicious steamed bean pudding made from cowpeas. It provides about 12.5g of protein per 100g and is rich in fiber. You can find it at Mama Put Kitchen and other campus vendors!",
    "akara": "Akara (bean fritters) are crispy, protein-packed snacks made from cowpeas. They provide about 10g of protein per 100g. Perfect for breakfast or a quick snack between classes!",
    "soy": "Soy products like Awara (Nigerian tofu), soy milk, and soy chunks are excellent protein sources. Awara provides 16g of protein per 100g. Check out Healthy Bites Café for fresh Awara dishes!",
    "groundnut": "Groundnuts (peanuts) and groundnut soup are rich in protein (25g per 100g when roasted). They're affordable and widely available. Try the Groundnut Soup at Mama Put Kitchen!",
    "mushroom": "Mushrooms are low-calorie, protein-rich foods perfect for students. They provide vitamins, minerals, and about 5-6g protein per 100g. Find mushroom dishes at Healthy Bites Café!",
    "cheap": "For affordable protein, try roasted groundnuts (₦200 for 50g), Akara (₦300 for 3 pieces), or soy milk (₦350). Use the Protein Finder on your dashboard to find the best value options!",
    "prepare": "Most alternative protein foods are easy to prepare! Soak beans overnight, blend, and steam for Moi Moi. For quick options, buy pre-made from campus vendors. I can share specific recipes if you'd like!",
    "default": "That's a great question! While I'm currently in learning mode, I can help you discover affordable alternative proteins available on campus. Check out the Protein Finder and Marketplace to see available options, or ask me about specific Nigerian foods like Moi Moi, Akara, Awara, or groundnut soup!",
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lower.includes(key)) {
        return response;
      }
    }
    
    return fallbackResponses.default;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = getFallbackResponse(userMessage);
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) {
    return (
      <button className="ai-fab" onClick={() => setOpen(true)}>
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="ai-header-content">
          <MessageCircle size={20} />
          <div>
            <strong>Protein Coach</strong>
            <span>Alternative Protein Assistant</span>
          </div>
        </div>
        <button onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ai-input">
        <input
          type="text"
          placeholder="Ask about alternative proteins..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}>
          <Send size={18} />
        </button>
      </div>

      <div className="ai-disclaimer">
        💡 Demo mode: Using curated responses about Nigerian alternative proteins
      </div>
    </div>
  );
}
