import { useEffect, useMemo, useState } from "react";
import { Search, Wallet, TrendingUp, Leaf } from "lucide-react";
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

export default function ProteinFinder() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [budget, setBudget] = useState("1000");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/proxy/8000/api/v1/foods/")
      .then((response) => {
        if (!response.ok) throw new Error("Marketplace unavailable");
        return response.json();
      })
      .then((data: Listing[]) => setListings(data))
      .catch(() => setError("Unable to load food options right now."))
      .finally(() => setLoading(false));
  }, []);

  const budgetValue = Math.max(0, Number(budget) || 0);

  const recommendations = useMemo(() => {
    return listings
      .filter(
        (listing) =>
          listing.is_available &&
          listing.quantity_available > 0 &&
          listing.price_ngn <= budgetValue,
      )
      .map((listing) => {
        const protein =
          (listing.food.protein_per_100g * listing.serving_size_g) / 100;

        return {
          ...listing,
          protein,
          proteinPer100Naira:
            listing.price_ngn > 0
              ? (protein / listing.price_ngn) * 100
              : 0,
        };
      })
      .sort((a, b) => b.proteinPer100Naira - a.proteinPer100Naira);
  }, [listings, budgetValue]);

  const bestOption = recommendations[0];

  const formatCurrency = (value: number) =>
    `₦${value.toLocaleString("en-NG")}`;

  return (
    <section className="protein-finder" id="protein-finder">
      <div className="protein-finder-header">
        <div>
          <span className="pf-eyebrow">SMART FOOD DISCOVERY</span>
          <h2>Make your money count.</h2>
          <p>
            Find affordable protein options based on your budget and
            what's currently available in the marketplace.
          </p>
        </div>
        <div className="pf-icon">
          <Leaf size={25} />
        </div>
      </div>

      <div className="pf-budget-panel">
        <label htmlFor="protein-budget">
          <Wallet size={18} />
          My food budget
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
        <div className="pf-message">Finding affordable protein...</div>
      ) : error ? (
        <div className="pf-message error">{error}</div>
      ) : recommendations.length === 0 ? (
        <div className="pf-message">
          No available listing fits this budget yet. Try increasing your budget.
        </div>
      ) : (
        <>
          {bestOption && (
            <div className="pf-best-option">
              <div className="pf-best-label">
                <TrendingUp size={16} />
                BEST VALUE IN YOUR BUDGET
              </div>

              <div className="pf-best-content">
                <div>
                  <h3>{bestOption.title}</h3>
                  <p>
                    {bestOption.protein.toFixed(1)}g protein per listed serving
                  </p>
                </div>

                <div className="pf-best-price">
                  <strong>{formatCurrency(bestOption.price_ngn)}</strong>
                  <span>per serving</span>
                </div>
              </div>

              <div className="pf-best-metrics">
                <div>
                  <strong>
                    {bestOption.proteinPer100Naira.toFixed(1)}g
                  </strong>
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
            </div>
          )}

          <div className="pf-results-heading">
            <h3>Options within your budget</h3>
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
                  <span>
                    {item.proteinPer100Naira.toFixed(1)}g/₦100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="pf-disclaimer">
        Recommendations use food nutrition data and current demo marketplace
        listings. Protein-per-naira rankings compare listed serving prices;
        actual prices and availability may change.
      </p>
    </section>
  );
}
