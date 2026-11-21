import { useEffect, useState } from "react";
import {
  Home,
  Store,
  Utensils,
  Target,
  ShoppingBag,
  Bell,
  Leaf,
  ArrowRight,
  Flame,
  TrendingUp,
  MapPin,
  Heart,
  Menu,
} from "lucide-react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import AdminConsole from "./components/AdminConsole";
import VendorDashboard from "./components/VendorDashboard";
import ProteinFinder from "./components/ProteinFinder";

import { useAuth } from "./context/AuthContext";
import { getToken } from "./services/auth";


type HealthStatus = "checking" | "connected" | "offline";

type MarketplaceListing = {
  id: number;
  title: string;
  description: string;
  price_ngn: number;
  quantity_available: number;
  serving_size_g: number;
  food: {
    name: string;
    protein_category: string;
    food_type: string;
    protein_per_100g: number;
    calories_per_100g: number;
    nutrition_source: string;
    allergens: string[];
    dietary_tags: string[];
  };
  vendor: {
    business_name: string;
    location: string;
  };
};

type FoodCard = {
  id: number;
  name: string;
  category: string;
  price: number;
  protein: number;
  vendor: string;
  stock: number;
  image: string;
};

const foodImages = [
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85",
];

function MarketplaceDashboard() {
  const [health, setHealth] = useState<HealthStatus>("checking");
  const [menuOpen, setMenuOpen] = useState(false);
  const [foods, setFoods] = useState<FoodCard[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const [healthResponse, foodResponse] = await Promise.all([
          fetch("/proxy/8000/api/v1/health"),
          fetch("/proxy/8000/api/v1/foods/"),
        ]);

        setHealth(healthResponse.ok ? "connected" : "offline");

        if (!foodResponse.ok) {
          throw new Error("Unable to load marketplace listings");
        }

        const listings: MarketplaceListing[] = await foodResponse.json();

        const mappedFoods: FoodCard[] = listings.map((listing, index) => ({
          id: listing.id,
          name: listing.title,
          category: listing.food.protein_category
            .replaceAll("_", " ")
            .toUpperCase(),
          price: listing.price_ngn,
          protein:
            (listing.food.protein_per_100g * listing.serving_size_g) / 100,
          vendor: listing.vendor.business_name,
          stock: listing.quantity_available,
          image: foodImages[index % foodImages.length],
        }));

        setFoods(mappedFoods);
        setMarketError("");
      } catch (error) {
        console.error("Marketplace loading error:", error);
        setHealth("offline");
        setMarketError("Marketplace is temporarily unavailable.");
      } finally {
        setMarketLoading(false);
      }
    };

    loadMarketplace();
  }, []);

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Leaf size={23} strokeWidth={2.5} />
          </div>

          <div>
            <span className="brand-name">
              campus<span>protein</span>
            </span>
            <span className="brand-subtitle">Eat better. Grow stronger.</span>
          </div>
        </div>

        <div className="nav-label">MENU</div>

        <nav className="navigation">
          <a className="nav-item active" href="#">
            <Home size={19} />
            <span>Overview</span>
          </a>

          <a className="nav-item" href="#marketplace">
            <Store size={19} />
            <span>Marketplace</span>
          </a>

          <a className="nav-item" href="#nutrition">
            <Utensils size={19} />
            <span>Nutrition</span>
          </a>

          <a className="nav-item" href="#goals">
            <Target size={19} />
            <span>My Goals</span>
          </a>

          <a className="nav-item" href="#orders">
            <ShoppingBag size={19} />
            <span>My Orders</span>
            <span className="nav-count">0</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="challenge-card">
            <div className="challenge-icon">
              <Flame size={20} />
            </div>

            <h3>Protein Challenge</h3>
            <p>Start building healthy eating habits today.</p>

            <a href="#nutrition">
              Explore nutrition <ArrowRight size={14} />
            </a>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-avatar">CP</div>
            <div>
              <strong>CampusProtein</strong>
              <span>Demo account</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER */}
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          <div className="welcome-text">
            <h1>Good day 👋</h1>
            <p>Let's make today a nutritious one.</p>
          </div>

          <div className="topbar-actions">
            <div className={`api-status ${health}`}>
              <span className="status-dot" />
              {health === "checking"
                ? "Connecting..."
                : health === "connected"
                  ? "System connected"
                  : "System offline"}
            </div>

            <button className="notification-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
          </div>
        </header>

        {/* DASHBOARD STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon green-icon">
                <Leaf size={19} />
              </div>
              <span className="stat-label">DAILY PROTEIN</span>
            </div>

            <div className="stat-value">
              0 <span>/ 55g</span>
            </div>

            <p>Your daily protein progress</p>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon orange-icon">
                <Flame size={19} />
              </div>
              <span className="stat-label">CURRENT STREAK</span>
            </div>

            <div className="stat-value">
              0 <span>days</span>
            </div>

            <p>Start your nutrition streak</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon purple-icon">
                <TrendingUp size={19} />
              </div>
              <span className="stat-label">REWARD POINTS</span>
            </div>

            <div className="stat-value">
              0 <span>points</span>
            </div>

            <p>Earn points through healthy habits</p>
          </div>

          <div className="stat-card" id="orders">
            <div className="stat-top">
              <div className="stat-icon blue-icon">
                <ShoppingBag size={19} />
              </div>
              <span className="stat-label">YOUR ORDERS</span>
            </div>

            <div className="stat-value">
              0 <span>orders</span>
            </div>

            <p>Your campus food journey starts here</p>
          </div>
        </section>

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">YOUR NUTRITION JOURNEY</p>

            <h2>
              Good food.
              <br />
              Stronger you.
            </h2>

            <p>
              Discover affordable protein-rich meals, track your nutrition,
              and build better eating habits.
            </p>

            <a href="#marketplace" className="hero-button">
              Explore meals <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* PROTEIN INTELLIGENCE */}
        <ProteinFinder />

        {/* MARKETPLACE */}
        <section className="market-section" id="marketplace">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FRESH PICKS</p>
              <h2>Discover your next meal</h2>
              <p className="section-description">
                Delicious options. More protein. Friendly prices.
              </p>
            </div>

            <a href="#marketplace" className="view-all">
              View marketplace <ArrowRight size={16} />
            </a>
          </div>

          <div className="food-grid">
            {marketLoading ? (
              <div className="marketplace-message">
                <p>Loading marketplace...</p>
              </div>
            ) : marketError ? (
              <div className="marketplace-message">
                <p>{marketError}</p>
              </div>
            ) : foods.length === 0 ? (
              <div className="marketplace-message">
                <p>No available meals at the moment.</p>
              </div>
            ) : (
              foods.map((food) => (
                <article className="food-card" key={food.id}>
                  <div className="food-image-wrapper">
                    <img src={food.image} alt={food.name} />

                    <span className="food-category">{food.category}</span>

                    <button
                      className="favorite-button"
                      aria-label={`Save ${food.name}`}
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  <div className="food-details">
                    <h3>{food.name}</h3>

                    <p className="food-vendor">
                      <MapPin size={13} />
                      {food.vendor}
                    </p>

                    <div className="food-meta">
                      <div className="protein-badge">
                        <Leaf size={13} />
                        {food.protein.toFixed(1)}g protein
                      </div>

                      <span className="food-price">
                        {formatPrice(food.price)}
                      </span>
                    </div>

                    <p className="stock-information">
                      {food.stock > 0
                        ? `${food.stock} available`
                        : "Out of stock"}
                    </p>

                    <button className="food-action">
                      View meal <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* NUTRITION */}
        <section className="bottom-section" id="nutrition">
          <div className="nutrition-banner">
            <div className="nutrition-icon">
              <Utensils size={23} />
            </div>

            <div>
              <h3>Every protein source counts</h3>

              <p>
                Beans, soy, groundnuts, mushrooms and more.
                Explore affordable alternative protein sources
                available around your campus.
              </p>
            </div>

            <a href="#marketplace">
              Explore foods <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* GOALS */}
        <section className="goals-section" id="goals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR NEXT STEP</p>
              <h2>Build your nutrition goals</h2>
            </div>
          </div>

          <div className="goal-card">
            <Target size={22} />

            <div>
              <h3>Set your protein goal</h3>
              <p>
                Personalized nutrition recommendations are coming next.
                Start by exploring the foods available on campus.
              </p>
            </div>

            <a href="#marketplace">
              Get started <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <footer className="app-footer">
          <p>CampusProtein · Hack the Fork</p>
          <p>Demo platform using synthetic data</p>
        </footer>
      </main>
    </div>
  );
}


type VendorStatus = {
  business_name: string;
  approval_status: string;
  rejection_reason?: string | null;
  location?: string | null;
};

function ApplicationShell() {
  const { user, loading, logout } = useAuth();
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "vendor") return;

    const loadVendorStatus = async () => {
      setVendorLoading(true);
      setVendorError("");

      try {
        const token = getToken();
        const response = await fetch("/proxy/8000/api/v1/vendors/me/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Unable to retrieve vendor status.");
        }

        setVendorStatus(await response.json());
      } catch (error) {
        setVendorError(
          error instanceof Error ? error.message : "Unable to load vendor status."
        );
      } finally {
        setVendorLoading(false);
      }
    };

    loadVendorStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Preparing your CampusProtein experience...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (user.role === "consumer") return <MarketplaceDashboard />;

  if (user.role === "admin") return <AdminConsole />;

  if (vendorLoading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Checking your vendor application...</p>
      </div>
    );
  }

  if (vendorError) {
    return (
      <div className="role-screen">
        <div className="role-card">
          <div className="role-icon">⚠️</div>
          <h1>Unable to check application</h1>
          <p>{vendorError}</p>
          <button className="role-primary-button" onClick={() => window.location.reload()}>
            Retry
          </button>
          <button className="role-logout-button" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }

  if (vendorStatus?.approval_status === "approved") {
    return (
      <VendorDashboard
        businessName={vendorStatus.business_name}
        location={vendorStatus.location}
      />
    );
  }

  const status = vendorStatus?.approval_status ?? "unknown";

  const statusContent: Record<string, { icon: string; title: string; message: string }> = {
    pending: {
      icon: "⏳",
      title: "Application under review",
      message: "Your vendor application has been submitted. Our campus administrator will review your business before your food listings become visible.",
    },
    approved: {
      icon: "🎉",
      title: "Your vendor account is approved!",
      message: "Your business is now approved to participate in CampusProtein. The vendor dashboard and listing management tools are coming next.",
    },
    rejected: {
      icon: "📋",
      title: "Application not approved",
      message: vendorStatus?.rejection_reason || "Your application was not approved. Please contact the campus administrator.",
    },
    suspended: {
      icon: "🚫",
      title: "Vendor account suspended",
      message: "Your vendor account is currently suspended. Please contact the campus administrator.",
    },
  };

  const content = statusContent[status] ?? {
    icon: "❓",
    title: "Unknown application status",
    message: "We couldn't determine your vendor application status.",
  };

  return (
    <div className="role-screen">
      <div className="role-card">
        <div className="role-icon">{content.icon}</div>
        <p className="eyebrow">VENDOR PORTAL</p>
        <h1>{content.title}</h1>
        <h3>{vendorStatus?.business_name}</h3>
        <p>{content.message}</p>
        {vendorStatus?.location && (
          <div className="role-location">📍 {vendorStatus.location}</div>
        )}
        <button className="role-logout-button" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}

function App() {
  return <ApplicationShell />;
}


export default App;
