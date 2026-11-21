import { useEffect, useState } from "react";
import {
  Home,
  Store,
  Utensils,
  ShoppingBag,
  Bell,
  Leaf,
  ArrowRight,
  Flame,
  TrendingUp,
  MapPin,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getFoods,
  getCart,
  addToCart,
  removeFromCart,
  createOrder,
  getOrders,
  getConsumerProfile,
  getDailyTotal,
  getGamification,
  logMeal,
  getFoodCatalogue,
} from "../services/api";
import ProteinFinder from "./EnhancedProteinFinder";
import ConsumerOnboarding from "./ConsumerOnboarding";
import AIAssistant from "./DataGroundedAIAssistant";
import "../App.css";

type Food = {
  id: number;
  title: string;
  price_ngn: number;
  quantity_available: number;
  serving_size_g: number;
  food: {
    id: number;
    name: string;
    protein_category: string;
    protein_per_100g: number;
    calories_per_100g: number;
  };
  vendor: {
    business_name: string;
    location: string;
  };
};

type CartItem = {
  id: number;
  listing_id: number;
  quantity: number;
};

type Order = {
  id: number;
  order_code: string;
  status: string;
  total_ngn: number;
  created_at: string;
};

type CatalogueFood = {
  id: number;
  name: string;
  protein_category: string;
  food_type: string;
  protein_per_100g: number;
  calories_per_100g: number;
};

export default function ConsumerDashboard() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"home" | "marketplace" | "nutrition" | "orders" | "cart">("home");
  
  const [foods, setFoods] = useState<Food[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [dailyTotal, setDailyTotal] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [catalogue, setCatalogue] = useState<CatalogueFood[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mealLogOpen, setMealLogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foodsData, cartData, profileData, dailyData, gamData, catalogueData] = await Promise.all([
        getFoods(),
        getCart().catch(() => []),
        getConsumerProfile().catch(() => null),
        getDailyTotal().catch(() => null),
        getGamification().catch(() => null),
        getFoodCatalogue().catch(() => []),
      ]);
      
      setFoods(foodsData);
      setCart(cartData);
      setProfile(profileData);
      setDailyTotal(dailyData);
      setGamification(gamData);
      setCatalogue(catalogueData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const handleAddToCart = async (foodId: number) => {
    try {
      await addToCart(foodId, 1);
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Unable to add to cart");
    }
  };

  const handleRemoveFromCart = async (listingId: number) => {
    try {
      await removeFromCart(listingId);
      const updatedCart = await getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      setLoading(true);
      const items = cart.map(item => ({
        listing_id: item.listing_id,
        quantity: item.quantity,
      }));
      
      await createOrder(items);
      alert("Order placed successfully!");
      setCart([]);
      setCartOpen(false);
      await loadOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error instanceof Error ? error.message : "Unable to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = async () => {
    if (!selectedFoodId) return;
    
    try {
      setLoading(true);
      await logMeal(selectedFoodId, servings);
      alert("Meal logged successfully!");
      setMealLogOpen(false);
      await loadData();
    } catch (error) {
      console.error("Error logging meal:", error);
      alert("Unable to log meal");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const listing = foods.find(f => f.id === item.listing_id);
    return sum + (listing?.price_ngn || 0) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const proteinProgress = profile && dailyTotal
    ? Math.min(100, (dailyTotal.total_protein_g / profile.protein_goal_g) * 100)
    : 0;

  const formatPrice = (price: number) => `₦${price.toLocaleString("en-NG")}`;

  const foodImages = [
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=85",
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85",
  ];

  // Show onboarding if profile is not complete
  if (profile && !profile.onboarding_completed) {
    return <ConsumerOnboarding onComplete={() => loadData()} />;
  }

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
          <button className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => setView("home")}>
            <Home size={19} /><span>Overview</span>
          </button>
          <button className={`nav-item ${view === "marketplace" ? "active" : ""}`} onClick={() => setView("marketplace")}>
            <Store size={19} /><span>Marketplace</span>
          </button>
          <button className={`nav-item ${view === "nutrition" ? "active" : ""}`} onClick={() => setView("nutrition")}>
            <Utensils size={19} /><span>Nutrition</span>
          </button>
          <button className={`nav-item ${view === "orders" ? "active" : ""}`} onClick={() => { setView("orders"); loadOrders(); }}>
            <ShoppingBag size={19} /><span>My Orders</span>
            {orders.length > 0 && <span className="nav-count">{orders.length}</span>}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="challenge-card">
            <div className="challenge-icon"><Flame size={20} /></div>
            <h3>Protein Challenge</h3>
            <p>{gamification?.challenge_joined ? `${gamification.challenge_progress}/5 foods logged` : "Start building healthy habits"}</p>
            <button onClick={() => setView("nutrition")}>View progress <ArrowRight size={14} /></button>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-avatar">{user?.display_name[0] || "C"}</div>
            <div>
              <strong>{user?.display_name}</strong>
              <button onClick={logout} style={{fontSize: "12px", color: "#888", background: "none", border: "none", cursor: "pointer"}}>Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)}><Menu size={22} /></button>
          <div className="welcome-text">
            <h1>Good day, {user?.display_name?.split(" ")[0]} 👋</h1>
            <p>Let's make today a nutritious one.</p>
          </div>
          <div className="topbar-actions">
            <button className="notification-button"><Bell size={19} /></button>
            <button className="cart-button" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={19} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </header>

        {view === "home" && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon green-icon"><Leaf size={19} /></div>
                  <span className="stat-label">DAILY PROTEIN</span>
                </div>
                <div className="stat-value">
                  {dailyTotal?.total_protein_g?.toFixed(0) || 0}<span> / {profile?.protein_goal_g || 55}g</span>
                </div>
                <p>Your daily protein progress</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${proteinProgress}%` }} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon orange-icon"><Flame size={19} /></div>
                  <span className="stat-label">CURRENT STREAK</span>
                </div>
                <div className="stat-value">{gamification?.current_streak || 0} <span>days</span></div>
                <p>{gamification?.current_streak > 0 ? "Keep it going!" : "Start your nutrition streak"}</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon purple-icon"><TrendingUp size={19} /></div>
                  <span className="stat-label">REWARD POINTS</span>
                </div>
                <div className="stat-value">{gamification?.points || 0} <span>points</span></div>
                <p>Earn points through healthy habits</p>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon blue-icon"><ShoppingBag size={19} /></div>
                  <span className="stat-label">YOUR ORDERS</span>
                </div>
                <div className="stat-value">{orders.length} <span>orders</span></div>
                <p>Your campus food journey</p>
              </div>
            </section>

            <ProteinFinder />

            <section className="market-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">FRESH PICKS</p>
                  <h2>Discover your next meal</h2>
                </div>
                <button onClick={() => setView("marketplace")} className="view-all">
                  View marketplace <ArrowRight size={16} />
                </button>
              </div>

              <div className="food-grid">
                {foods.slice(0, 6).map((food, idx) => (
                  <article className="food-card" key={food.id}>
                    <div className="food-image-wrapper">
                      <img src={foodImages[idx % 3]} alt={food.title} />
                      <span className="food-category">{food.food.protein_category.replace("_", " ").toUpperCase()}</span>
                    </div>
                    <div className="food-details">
                      <h3>{food.title}</h3>
                      <p className="food-vendor"><MapPin size={13} />{food.vendor.business_name}</p>
                      <div className="food-meta">
                        <div className="protein-badge">
                          <Leaf size={13} />
                          {((food.food.protein_per_100g * food.serving_size_g) / 100).toFixed(1)}g
                        </div>
                        <span className="food-price">{formatPrice(food.price_ngn)}</span>
                      </div>
                      <button className="food-action" onClick={() => handleAddToCart(food.id)}>Add to cart</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {view === "marketplace" && (
          <section className="market-section">
            <div className="section-heading">
              <div><h2>Campus Marketplace</h2><p>All available meals and snacks</p></div>
            </div>
            <div className="food-grid">
              {foods.map((food, idx) => (
                <article className="food-card" key={food.id}>
                  <div className="food-image-wrapper">
                    <img src={foodImages[idx % 3]} alt={food.title} />
                    <span className="food-category">{food.food.protein_category.replace("_", " ").toUpperCase()}</span>
                  </div>
                  <div className="food-details">
                    <h3>{food.title}</h3>
                    <p className="food-vendor"><MapPin size={13} />{food.vendor.business_name}</p>
                    <div className="food-meta">
                      <div className="protein-badge">
                        <Leaf size={13} />
                        {((food.food.protein_per_100g * food.serving_size_g) / 100).toFixed(1)}g protein
                      </div>
                      <span className="food-price">{formatPrice(food.price_ngn)}</span>
                    </div>
                    <p className="stock-information">
                      {food.quantity_available > 0 ? `${food.quantity_available} available` : "Out of stock"}
                    </p>
                    <button className="food-action" onClick={() => handleAddToCart(food.id)} disabled={food.quantity_available === 0}>
                      {food.quantity_available > 0 ? "Add to cart" : "Sold out"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "orders" && (
          <section className="orders-section">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={48} />
                <p>No orders yet. Browse the marketplace to get started!</p>
                <button onClick={() => setView("marketplace")}>Browse foods</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <strong>Order #{order.order_code}</strong>
                        <span className={`order-status status-${order.status}`}>{order.status}</span>
                      </div>
                      <strong>{formatPrice(order.total_ngn)}</strong>
                    </div>
                    <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "nutrition" && (
          <section className="nutrition-section">
            <h2>Nutrition Tracking</h2>
            <div className="nutrition-dashboard">
              <div className="nutrition-card">
                <h3>Today's Progress</h3>
                <div className="progress-circle">
                  <span className="progress-value">{dailyTotal?.total_protein_g?.toFixed(0) || 0}g</span>
                  <span className="progress-label">of {profile?.protein_goal_g || 55}g</span>
                </div>
                <p>{dailyTotal?.meal_count || 0} meals logged today</p>
                <button className="log-meal-button" onClick={() => setMealLogOpen(true)}>Log a Meal</button>
              </div>
              
              <div className="nutrition-card">
                <h3>Gamification</h3>
                <div className="gamification-stats">
                  <div className="gam-stat">
                    <Flame size={24} />
                    <div>
                      <strong>{gamification?.current_streak || 0} days</strong>
                      <span>Current Streak</span>
                    </div>
                  </div>
                  <div className="gam-stat">
                    <TrendingUp size={24} />
                    <div>
                      <strong>{gamification?.points || 0}</strong>
                      <span>Total Points</span>
                    </div>
                  </div>
                </div>
                {gamification?.challenge_joined && (
                  <p>Challenge progress: {gamification.challenge_progress}/5 unique proteins</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="modal-content cart-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Cart</h2>
              <button onClick={() => setCartOpen(false)}><X size={24} /></button>
            </div>
            
            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={48} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => {
                    const listing = foods.find(f => f.id === item.listing_id);
                    if (!listing) return null;
                    
                    return (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <strong>{listing.title}</strong>
                          <span>{formatPrice(listing.price_ngn)} × {item.quantity}</span>
                        </div>
                        <div className="cart-item-actions">
                          <span>{formatPrice(listing.price_ngn * item.quantity)}</span>
                          <button onClick={() => handleRemoveFromCart(item.listing_id)}><X size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <button className="checkout-button" onClick={handleCheckout} disabled={loading}>
                    {loading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {mealLogOpen && (
        <div className="modal-overlay" onClick={() => setMealLogOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log a Meal</h2>
              <button onClick={() => setMealLogOpen(false)}><X size={24} /></button>
            </div>
            <div style={{padding: "24px"}}>
              <label style={{display: "block", marginBottom: "8px", fontWeight: 600}}>Select Food</label>
              <select
                value={selectedFoodId || ""}
                onChange={e => setSelectedFoodId(Number(e.target.value))}
                style={{width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e5e5e5", marginBottom: "16px"}}
              >
                <option value="">Choose a food...</option>
                {catalogue.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.protein_per_100g.toFixed(1)}g protein per 100g)
                  </option>
                ))}
              </select>

              <label style={{display: "block", marginBottom: "8px", fontWeight: 600}}>Servings</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={servings}
                onChange={e => setServings(Number(e.target.value))}
                style={{width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e5e5e5", marginBottom: "24px"}}
              />

              <button
                onClick={handleLogMeal}
                disabled={!selectedFoodId || loading}
                style={{width: "100%", padding: "14px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer"}}
              >
                {loading ? "Logging..." : "Log Meal"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
}
