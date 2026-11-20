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
  Clock,
  MapPin,
  Heart,
  Menu,
} from "lucide-react";
import "./App.css";

type HealthStatus = "checking" | "connected" | "offline";

const foods = [
  {
    name: "Soy Protein Bowl",
    category: "SOY PROTEIN",
    price: 1800,
    protein: 32,
    vendor: "Green Bowl Kitchen",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Peanut & Bean Wrap",
    category: "LEGUMES",
    price: 1200,
    protein: 21,
    vendor: "Campus Bites",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Mushroom Rice Bowl",
    category: "MUSHROOM",
    price: 1500,
    protein: 18,
    vendor: "Fresh Harvest",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85",
  },
];

function App() {
  const [health, setHealth] = useState<HealthStatus>("checking");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/health");
        if (response.ok) {
          setHealth("connected");
        } else {
          setHealth("offline");
        }
      } catch {
        setHealth("offline");
      }
    };

    checkApi();
  }, []);

  const formatPrice = (price: number) =>
    `₦${price.toLocaleString("en-NG")}`;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Leaf size={23} strokeWidth={2.5} />
          </div>
          <div>
            <span className="brand-name">campus<span>protein</span></span>
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
          <a className="nav-item" href="#">
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
            <p>Make every meal count. Start your streak today.</p>
            <a href="#goals">
              View challenge <ArrowRight size={14} />
            </a>
          </div>

          <div className="profile">
            <div className="avatar">S</div>
            <div className="profile-info">
              <strong>Student</strong>
              <span>Campus member</span>
            </div>
            <span className="profile-dots">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <div className={`connection ${health}`}>
              <span className="connection-dot" />
              {health === "connected"
                ? "System online"
                : health === "checking"
                  ? "Connecting..."
                  : "API offline"}
            </div>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">THURSDAY, NOVEMBER 20</p>
              <h1>Good evening, <span>Student</span> 👋</h1>
              <p className="welcome-description">
                Fuel your goals with smarter food choices.
              </p>
            </div>

            <button className="primary-button" onClick={() => {
              document.getElementById("marketplace")?.scrollIntoView({
                behavior: "smooth",
              });
            }}>
              Explore food <ArrowRight size={17} />
            </button>
          </section>

          <section className="hero-card">
            <div className="hero-content">
              <div className="hero-tag">
                <Leaf size={14} /> YOUR FOOD, YOUR FUTURE
              </div>
              <h2>Good food.<br />Stronger you.</h2>
              <p>
                Discover affordable protein-rich meals around campus.
                Every bite moves you closer to your goals.
              </p>
              <button
                className="hero-button"
                onClick={() =>
                  document.getElementById("marketplace")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Discover meals <ArrowRight size={16} />
              </button>
            </div>
            <div className="hero-image" />
            <div className="hero-decoration">01</div>
          </section>

          <section className="stats-grid" id="goals">
            <div className="stat-card protein-stat">
              <div className="stat-top">
                <div className="stat-icon green-icon">
                  <Target size={19} />
                </div>
                <span className="stat-label">DAILY PROTEIN</span>
              </div>
              <div className="stat-value">0 <span>/ 55g</span></div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: "0%" }} />
              </div>
              <p>Log your meals to track your progress</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon orange-icon">
                  <Flame size={19} />
                </div>
                <span className="stat-label">CURRENT STREAK</span>
              </div>
              <div className="stat-value">0 <span>days</span></div>
              <p>Start today and build your habit</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon purple-icon">
                  <TrendingUp size={19} />
                </div>
                <span className="stat-label">PROTEIN POINTS</span>
              </div>
              <div className="stat-value">0 <span>pts</span></div>
              <p>Earn points by making smart choices</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <div className="stat-icon blue-icon">
                  <ShoppingBag size={19} />
                </div>
                <span className="stat-label">YOUR ORDERS</span>
              </div>
              <div className="stat-value">0 <span>orders</span></div>
              <p>Your campus food journey starts here</p>
            </div>
          </section>

          <section className="market-section" id="marketplace">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FRESH PICKS</p>
                <h2>Discover your next meal</h2>
                <p className="section-description">
                  Delicious options. More protein. Friendly prices.
                </p>
              </div>
              <a href="#" className="view-all">
                View marketplace <ArrowRight size={16} />
              </a>
            </div>

            <div className="food-grid">
              {foods.map((food) => (
                <article className="food-card" key={food.name}>
                  <div className="food-image-wrapper">
                    <img src={food.image} alt={food.name} />
                    <span className="food-category">{food.category}</span>
                    <button className="favorite-button" aria-label={`Save ${food.name}`}>
                      <Heart size={17} />
                    </button>
                  </div>

                  <div className="food-details">
                    <h3>{food.name}</h3>
                    <p className="food-vendor">
                      <MapPin size={13} /> {food.vendor}
                    </p>

                    <div className="food-meta">
                      <div className="protein-badge">
                        <Leaf size={13} /> {food.protein}g protein
                      </div>
                      <span className="food-price">{formatPrice(food.price)}</span>
                    </div>

                    <button className="food-action">
                      View meal <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="bottom-section" id="nutrition">
            <div className="nutrition-banner">
              <div className="nutrition-icon">
                <Utensils size={23} />
              </div>
              <div>
                <h3>Every protein source counts</h3>
                <p>
                  Beans, soy, groundnuts, mushrooms and more.
                  Explore affordable alternatives.
                </p>
              </div>
              <ArrowRight className="nutrition-arrow" size={20} />
            </div>

            <div className="quick-card">
              <div className="quick-card-icon">
                <Clock size={20} />
              </div>
              <div>
                <h3>Ready when you are</h3>
                <p>Campus pickup · No delivery fees</p>
              </div>
            </div>
          </section>

          <footer className="footer">
            <span>© 2026 CampusProtein</span>
            <span>Eat better. Grow stronger. 🌱</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
