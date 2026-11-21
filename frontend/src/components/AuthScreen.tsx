import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { RegisterPayload } from "../services/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  User,
  Store,
} from "lucide-react";
import "./AuthScreen.css";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<"consumer" | "vendor">("consumer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    display_name: "",
    password: "",
    business_name: "",
    location: "",
    description: "",
    opening_time: "08:00",
    closing_time: "18:00",
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        const payload: RegisterPayload = {
          email: form.email,
          display_name: form.display_name,
          password: form.password,
          role,
        };

        if (role === "vendor") {
          payload.business_name = form.business_name;
          payload.location = form.location;
          payload.description = form.description;
          payload.opening_time = form.opening_time;
          payload.closing_time = form.closing_time;
        }

        await register(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </div>

      <div className="auth-container">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Leaf size={24} />
            </div>
            <span>CampusProtein</span>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">THE FUTURE OF CAMPUS FOOD</span>
            <h1>
              Eat better.
              <br />
              <span>Live stronger.</span>
            </h1>

            <p>
              Discover protein-rich meals, support innovative food vendors,
              and build healthier habits right on campus.
            </p>

            <div className="auth-feature-list">
              <div>
                <span className="auth-feature-dot" />
                Discover nutritious campus meals
              </div>
              <div>
                <span className="auth-feature-dot" />
                Track your nutrition goals
              </div>
              <div>
                <span className="auth-feature-dot" />
                Support alternative protein
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Built for a healthier campus food ecosystem.
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-brand">
              <div className="auth-brand-icon">
                <Leaf size={22} />
              </div>
              <span>CampusProtein</span>
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                {mode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}
              </span>

              <h2>
                {mode === "login" ? "Sign in to your account" : "Create your account"}
              </h2>

              <p>
                {mode === "login"
                  ? "Your campus food journey continues here."
                  : "Start discovering better food on campus."}
              </p>
            </div>

            {mode === "register" && (
              <div className="auth-role-selector">
                <button
                  type="button"
                  className={role === "consumer" ? "active" : ""}
                  onClick={() => setRole("consumer")}
                >
                  <User size={18} />
                  Student
                </button>

                <button
                  type="button"
                  className={role === "vendor" ? "active" : ""}
                  onClick={() => setRole("vendor")}
                >
                  <Store size={18} />
                  Vendor
                </button>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="auth-field">
                  <label htmlFor="display_name">Full name</label>
                  <div className="auth-input-wrapper">
                    <User size={18} />
                    <input
                      id="display_name"
                      type="text"
                      placeholder="Your name"
                      value={form.display_name}
                      onChange={(e) => update("display_name", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode === "register" && role === "vendor" && (
                <>
                  <div className="auth-field">
                    <label htmlFor="business_name">Business name</label>
                    <div className="auth-input-wrapper">
                      <Store size={18} />
                      <input
                        id="business_name"
                        placeholder="Your food business"
                        value={form.business_name}
                        onChange={(e) => update("business_name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="location">Campus location</label>
                    <div className="auth-input-wrapper">
                      <input
                        id="location"
                        placeholder="Where students can find you"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="description">Business description</label>
                    <textarea
                      id="description"
                      placeholder="Tell students about your food..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="auth-hours-grid">
                    <div className="auth-field">
                      <label htmlFor="opening_time">Opening time</label>
                      <input
                        id="opening_time"
                        type="time"
                        value={form.opening_time}
                        onChange={(e) => update("opening_time", e.target.value)}
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <label htmlFor="closing_time">Closing time</label>
                      <input
                        id="closing_time"
                        type="time"
                        value={form.closing_time}
                        onChange={(e) => update("closing_time", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    minLength={mode === "register" ? 8 : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              {mode === "register" && role === "vendor" && (
                <div className="auth-vendor-notice">
                  Your vendor account will be reviewed by the campus administrator
                  before your listings become visible.
                </div>
              )}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? (
                  "Please wait..."
                ) : mode === "login" ? (
                  <>
                    Sign in <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Create account <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("register"); setError(""); }}>
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }}>
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="auth-terms">
              CampusProtein · Campus food, reimagined
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
