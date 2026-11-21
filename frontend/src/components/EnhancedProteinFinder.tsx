import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, Leaf, Target } from "lucide-react";
import { getFoods, getConsumerProfile } from "../services/api";
import "./ProteinFinder.css";

type Listing = {
  id: number;
  title: string;
  price_ngn: number;
  serving_size_g: number;
  quantity_available: number;
  is_available: boolean;
  food: {
    name: string;
    protein_per_100g: number;
    calories_per_100g: number;
    protein_category: string;
  };
  vendor: {
    business_name: string;
    location: string;
  };
};

export default function EnhancedProteinFinder() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [budget, setBudget] = useState("1000");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [foodsData, profileData] = await Promise.all([
          getFoods(),
          getConsumerProfile().catch(() => null),
        ]);
        setListings(foodsData);
        setProfile(profileData);
        if (profileData?.budget_ngn) {
          setBudget(String(profileData.budget_ngn));
        }
      } catch {
        setError("Unable to load recommendations");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const budgetValue = Math.max(0, Number(budget) || 0);

  const recommendations = useMemo(() => {
    const preferredCategories = profile?.preferred_proteins?.split(",").filter(Boolean) || [];
    
    return listings
      .filter(
        (listing) =>
          listing.is_available &&
          listing.quantity_available > 0 &&
          listing.price_ngn <= budgetValue &&
          listing.food.protein_category !== "conventional"
      )
      .map((listing) => {
        const protein = (listing.food.protein_per_100g * listing.serving_size_g) / 100;
        const proteinPer100Naira = listing.price_ngn > 0 ? (protein / listing.price_ngn) * 100 : 0;
        
        // Scoring factors
        let score = proteinPer100Naira * 10; // Base: protein value
        
        // Preference boost
        if (preferredCategories.includes(listing.food.protein_category)) {
          score += 5;
        }
        
        // Diversity bonus for less common categories
        if (["mushroom", "edible_insect"].includes(listing.food.protein_category)) {
          score += 3;
        }
        
        // Affordability factor
        const affordabilityRatio = budgetValue > 0 ? listing.price_ngn / budgetValue : 1;
        if (affordabilityRatio < 0.5) score += 2; // Very affordable
        
        const reasons = [];
        if (proteinPer100Naira > 0.15) reasons.push("High protein per naira");
        if (affordabilityRatio < 0.5) reasons.push("Very affordable");
        if (preferredCategories.includes(listing.food.protein_category)) reasons.push("Matches your preferences");
        if (protein >= 15) reasons.push("High protein content");
        
        return {
          ...listing,
          protein,
          proteinPer100Naira,
          score,
          reasons: reasons.length > 0 ? reasons : ["Alternative protein source"],
        };
      })
      .sort((a, b) => b.score - a.score);
  }, [listings, budgetValue, profile]);

  const bestOption = recommendations[0];
  const formatCurrency = (value: number) => `₦${value.toLocaleString("en-NG")}`;

  return (
    <section className="protein-finder" id="protein-finder">
      <div className="protein-finder-header">
        <div>
          <span className="pf-eyebrow">PERSONALIZED RECOMMENDATIONS</span>
          <h2>Smart food choices for your goals</h2>
          <p>
            Ranked by protein value, your budget{profile?.preferred_proteins ? ", and your preferences" : ""}.
          </p>
        </div>
        <div className="pf-icon">
          <Leaf size={25} />
        </div>
      </div>

      {profile && (
        <div className="pf-goal-display">
          <Target size={18} />
          <span>Your goal: {profile.protein_goal_g}g protein daily</span>
        </div>
      )}

      <div className="pf-budget-panel">
        <label htmlFor="protein-budget">
          <Wallet size={18} />
          My meal budget
        </label>

        <div className="pf-budget-input">
          <span>₦</span>
          <input
            id="protein-budget"
            type="number"
            min="0"
            step="100"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Enter budget"
          />
        </div>

        <div className="pf-quick-budgets">
          {[300, 500, 1000, 2000].map((amount) => (
            <button
              key={amount}
              className={budget === String(amount) ? "selected" : ""}
              onClick={() => setBudget(String(amount))}
              type="button"
            >
              ₦{amount.toLocaleString("en-NG")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="pf-message">Finding your best options...</div>
      ) : error ? (
        <div className="pf-message error">{error}</div>
      ) : recommendations.length === 0 ? (
        <div className="pf-message">
          No available options fit this budget. Try increasing your budget.
        </div>
      ) : (
        <>
          {bestOption && (
            <div className="pf-best-option">
              <div className="pf-best-label">
                <TrendingUp size={16} />
                TOP RECOMMENDATION
              </div>

              <div className="pf-best-content">
                <div>
                  <h3>{bestOption.title}</h3>
                  <p>{bestOption.protein.toFixed(1)}g protein per serving</p>
                </div>

                <div className="pf-best-price">
                  <strong>{formatCurrency(bestOption.price_ngn)}</strong>
                  <span>per serving</span>
                </div>
              </div>

              <div className="pf-best-metrics">
                <div>
                  <strong>{bestOption.proteinPer100Naira.toFixed(1)}g</strong>
                  <span>protein per ₦100</span>
                </div>
                <div>
                  <strong>{bestOption.serving_size_g}g</strong>
                  <span>serving size</span>
                </div>
                <div>
                  <strong>{bestOption.quantity_available}</strong>
                  <span>available</span>
                </div>
              </div>

              <div className="pf-reasons">
                <strong>Why recommended:</strong>
                <ul>
                  {bestOption.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="pf-results-heading">
            <h3>All options within your budget</h3>
            <span>{recommendations.length} available</span>
          </div>

          <div className="pf-results">
            {recommendations.slice(0, 5).map((item, index) => (
              <div className="pf-result" key={item.id}>
                <div className="pf-rank">{index + 1}</div>

                <div className="pf-result-info">
                  <strong>{item.title}</strong>
                  <span>{item.vendor.business_name}</span>
                </div>

                <div className="pf-result-protein">
                  <strong>{item.protein.toFixed(1)}g</strong>
                  <span>protein</span>
                </div>

                <div className="pf-result-price">
                  <strong>{formatCurrency(item.price_ngn)}</strong>
                  <span>{item.proteinPer100Naira.toFixed(1)}g/₦100</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="pf-disclaimer">
        Ranked using protein content, price, availability, and your preferences.
      </p>
    </section>
  );
}
