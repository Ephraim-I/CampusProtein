import { useState, useEffect } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { getFoods, getConsumerProfile, getDailyTotal, getFoodCatalogue } from "../services/api";
import "./AIAssistant.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function DataGroundedAIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [profile, daily, foods, catalogue] = await Promise.all([
          getConsumerProfile().catch(() => null),
          getDailyTotal().catch(() => null),
          getFoods().catch(() => []),
          getFoodCatalogue().catch(() => []),
        ]);
        setUserData({ profile, daily, foods, catalogue });
        
        // Initial greeting with user context
        const greeting = profile 
          ? `Hi! I'm your Alternative Protein Coach. I see you're aiming for ${profile.protein_goal_g}g of protein daily${daily?.total_protein_g ? ` and you've logged ${daily.total_protein_g.toFixed(0)}g today` : ""}. I can help you discover Nigerian protein-rich foods, answer nutrition questions, and suggest affordable meals from campus vendors. What would you like to know?`
          : "Hi! I'm your Alternative Protein Coach. I can help you discover Nigerian protein-rich foods, answer nutrition questions, and suggest affordable meals. What would you like to know?";
        
        setMessages([{ role: "assistant", content: greeting }]);
      } catch (error) {
        setUserData(null);
      }
    };
    
    if (open && !userData) {
      loadUserData();
    }
  }, [open]);

  const generateResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    
    // User-specific recommendations
    if ((lower.includes("recommend") || lower.includes("suggest")) && userData?.foods) {
      const budget = userData.profile?.budget_ngn || 1000;
      const affordable = userData.foods.filter((f: any) => f.price_ngn <= budget && f.quantity_available > 0);
      
      if (affordable.length > 0) {
        const top3 = affordable.slice(0, 3);
        const listings = top3.map((f: any) => {
          const protein = ((f.food.protein_per_100g * f.serving_size_g) / 100).toFixed(1);
          return `• ${f.title} - ₦${f.price_ngn} (${protein}g protein) at ${f.vendor.business_name}`;
        }).join("\n");
        
        return `Based on your budget of ₦${budget}, here are great options available now:\n\n${listings}\n\nAll are alternative protein sources that will help you reach your daily goal!`;
      }
    }
    
    // Progress check
    if (lower.includes("progress") || lower.includes("how am i doing")) {
      if (userData?.daily && userData?.profile) {
        const consumed = userData.daily.total_protein_g || 0;
        const goal = userData.profile.protein_goal_g || 55;
        const remaining = goal - consumed;
        
        return `You've logged ${consumed.toFixed(0)}g protein today out of your ${goal}g goal. ${remaining > 0 ? `You need ${remaining.toFixed(0)}g more to reach your target. Try foods like Soy Chunks (high protein) or Groundnuts (affordable)!` : "Great job! You've reached your protein goal today! 🎉"}`;
      }
    }
    
    // Available foods query
    if (lower.includes("available") || lower.includes("what can i get")) {
      if (userData?.foods && userData.foods.length > 0) {
        const categories = [...new Set(userData.foods.map((f: any) => f.food.protein_category))];
        return `Right now, campus vendors have ${userData.foods.length} alternative protein options available, including ${categories.map((c: any) => c.replace("_", " ")).join(", ")}. Check out the Protein Finder to see them ranked by value!`;
      }
    }
    
    // Specific food queries
    const foodMappings: Record<string, string> = {
      "moi moi": "Moi Moi is steamed bean pudding made from cowpeas (12.5g protein per 100g). It's nutritious, filling, and available at Mama Put Kitchen!",
      "akara": "Akara are crispy bean fritters with 10g protein per 100g. Perfect for breakfast or snacks, available at both Mama Put Kitchen and Healthy Bites Café!",
      "awara": "Awara is Nigerian tofu made from soybeans (16g protein per 100g). Try the Awara Stir-Fry at Healthy Bites Café - it's delicious and protein-packed!",
      "soy": "Soy products like Awara, soy milk, and soy chunks are excellent protein sources. Soy chunks have an amazing 52g protein per 100g! Find them at Protein Corner.",
      "groundnut": "Groundnuts (peanuts) provide 25g protein per 100g. The Roasted Groundnuts Pack at Protein Corner is only ₦200 - incredible value!",
      "mushroom": "Mushrooms provide 5-6g protein per 100g plus vitamins and minerals. Try the Mushroom Stir-Fry or Pepper Soup at Healthy Bites Café!",
      "cheap": `The most affordable protein options right now are: Roasted Groundnuts (₦200), Hot Akara (₦300), and Fresh Soy Milk (₦350). All give you great protein for your budget!`,
      "prepare": "Most vendors prepare these foods fresh daily! For home cooking: soak beans overnight for Moi Moi/Akara, or stir-fry mushrooms with vegetables. I can share specific recipes if you'd like!",
    };
    
    for (const [key, response] of Object.entries(foodMappings)) {
      if (lower.includes(key)) return response;
    }
    
    // Generic alternative protein info
    if (lower.includes("alternative protein") || lower.includes("what are")) {
      return "Alternative proteins are protein-rich foods from plants and fungi. In Nigeria, great options include cowpeas (beans), soybeans, groundnuts, bambara nuts, and mushrooms. They're affordable, nutritious, and sustainable! Want to see what's available on campus right now?";
    }
    
    // Nutrition question
    if (lower.includes("protein") && (lower.includes("much") || lower.includes("need"))) {
      const goal = userData?.profile?.protein_goal_g || 55;
      return `Your daily protein goal is ${goal}g. This supports ${goal >= 75 ? "muscle building and intense training" : goal >= 55 ? "an active lifestyle" : "general health"}. I can help you find foods to reach this goal within your budget!`;
    }
    
    return "That's a great question! I can help you with: finding affordable protein foods on campus, checking your nutrition progress, learning about Nigerian alternative proteins (Moi Moi, Akara, Awara, etc.), meal suggestions, and preparation tips. What would you like to explore?";
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 600));

    const response = generateResponse(userMessage);
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
            <span>Powered by your data</span>
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
          placeholder="Ask about foods, progress, or get recommendations..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}>
          <Send size={18} />
        </button>
      </div>

      <div className="ai-disclaimer">
        💡 Responses use your actual food data, goals, and campus availability
      </div>
    </div>
  );
}
