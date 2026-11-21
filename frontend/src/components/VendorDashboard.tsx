import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Store,
  Utensils,
  Package,
  CheckCircle,
  XCircle,
  Edit,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../services/auth";
import "./VendorDashboard.css";

const API = "/proxy/8000/api/v1";

type Food = {
  id: number;
  name: string;
  protein_category: string;
  food_type: string;
  protein_per_100g: number;
  calories_per_100g: number;
  carbohydrates_per_100g: number;
  fat_per_100g: number;
  allergens: string;
  dietary_tags: string;
  nutrition_source: string;
  source_url?: string | null;
};

type Listing = {
  id: number;
  title: string;
  description: string;
  price_ngn: number;
  quantity_available: number;
  serving_size_g: number;
  is_available: boolean;
  is_active: boolean;
  food: Food;
  vendor: {
    business_name: string;
    location: string;
  };
};

type FormState = {
  food_id: string;
  title: string;
  description: string;
  price_ngn: string;
  quantity_available: string;
  serving_size_g: string;
};

const emptyForm: FormState = {
  food_id: "",
  title: "",
  description: "",
  price_ngn: "",
  quantity_available: "",
  serving_size_g: "100",
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Request failed (${response.status})`);
  }

  return response.json();
}

export default function VendorDashboard({
  businessName,
  location,
}: {
  businessName: string;
  location?: string | null;
}) {
  const { logout } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const [listingData, catalogueData] = await Promise.all([
        apiRequest<Listing[]>("/vendors/me/listings"),
        apiRequest<Food[]>("/foods/catalogue"),
      ]);

      setListings(listingData);
      setFoods(catalogueData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load vendor dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateForm = () => {
    setEditingListing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (listing: Listing) => {
    setEditingListing(listing);
    setForm({
      food_id: String(listing.food.id),
      title: listing.title,
      description: listing.description,
      price_ngn: String(listing.price_ngn),
      quantity_available: String(listing.quantity_available),
      serving_size_g: String(listing.serving_size_g),
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleFoodChange = (foodId: string) => {
    const selected = foods.find((food) => food.id === Number(foodId));

    setForm((previous) => ({
      ...previous,
      food_id: foodId,
      title: selected ? selected.name : previous.title,
    }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.food_id || !form.title.trim()) {
      setError("Select a food and enter a listing title.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      food_id: Number(form.food_id),
      title: form.title.trim(),
      description: form.description.trim(),
      price_ngn: Number(form.price_ngn),
      quantity_available: Number(form.quantity_available),
      serving_size_g: Number(form.serving_size_g),
    };

    try {
      if (editingListing) {
        await apiRequest<Listing>(
          `/vendors/me/listings/${editingListing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess("Listing updated successfully.");
      } else {
        await apiRequest<Listing>("/vendors/me/listings", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Food listing created successfully.");
      }

      setShowForm(false);
      setEditingListing(null);
      setForm(emptyForm);

      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save listing."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (listing: Listing) => {
    setError("");
    setSuccess("");

    const newAvailability = !listing.is_available;

    try {
      await apiRequest<Listing>(
        `/vendors/me/listings/${listing.id}/availability`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_available: newAvailability }),
        }
      );

      setSuccess(
        newAvailability
          ? `${listing.title} is now available.`
          : `${listing.title} is now unavailable.`
      );

      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update availability."
      );
    }
  };

  const totalListings = listings.length;
  const availableListings = listings.filter(
    (listing) =>
      listing.is_available && listing.quantity_available > 0
  ).length;
  const unavailableListings = totalListings - availableListings;

  if (loading) {
    return (
      <div className="vendor-dashboard-loading">
        <Loader2 className="vendor-spin" size={32} />
        <p>Loading your vendor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <header className="vendor-dashboard-header">
        <div className="vendor-brand">
          <div className="vendor-brand-icon">
            <Store size={22} />
          </div>
          <div>
            <span className="vendor-brand-label">CAMPUSPROTEIN</span>
            <span className="vendor-brand-subtitle">Vendor Portal</span>
          </div>
        </div>

        <button
          className="vendor-logout-button"
          onClick={logout}
          type="button"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </header>

      <main className="vendor-dashboard-main">
        <section className="vendor-welcome">
          <div>
            <p className="vendor-eyebrow">VENDOR DASHBOARD</p>
            <h1>Welcome, {businessName}</h1>
            <p className="vendor-welcome-description">
              Manage your food offerings and keep your campus customers updated.
            </p>
            {location && (
              <div className="vendor-location">
                <Store size={15} />
                {location}
              </div>
            )}
          </div>

          <div className="vendor-approved-badge">
            <CheckCircle size={17} />
            Approved Vendor
          </div>
        </section>

        <section className="vendor-stat-grid">
          <div className="vendor-stat-card">
            <div className="vendor-stat-icon vendor-stat-purple">
              <Utensils size={20} />
            </div>
            <div>
              <span className="vendor-stat-label">Total Listings</span>
              <strong>{totalListings}</strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon vendor-stat-green">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="vendor-stat-label">Available</span>
              <strong>{availableListings}</strong>
            </div>
          </div>

          <div className="vendor-stat-card">
            <div className="vendor-stat-icon vendor-stat-orange">
              <Package size={20} />
            </div>
            <div>
              <span className="vendor-stat-label">Unavailable</span>
              <strong>{unavailableListings}</strong>
            </div>
          </div>
        </section>

        <section className="vendor-listings-section">
          <div className="vendor-section-header">
            <div>
              <p className="vendor-eyebrow">YOUR MENU</p>
              <h2>Food Listings</h2>
              <p>Manage your products, prices, stock and availability.</p>
            </div>

            <div className="vendor-section-actions">
              <button
                className="vendor-refresh-button"
                onClick={() => loadData(true)}
                disabled={refreshing}
                type="button"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "vendor-spin" : ""}
                />
              </button>

              <button
                className="vendor-add-button"
                onClick={openCreateForm}
                type="button"
              >
                <Plus size={17} />
                Add Food
              </button>
            </div>
          </div>

          {error && (
            <div className="vendor-alert vendor-alert-error">
              <XCircle size={17} />
              {error}
            </div>
          )}

          {success && (
            <div className="vendor-alert vendor-alert-success">
              <CheckCircle size={17} />
              {success}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="vendor-empty-state">
              <div className="vendor-empty-icon">
                <Utensils size={32} />
              </div>
              <h3>Your menu is empty</h3>
              <p>
                Add your first food listing to start appearing in the
                CampusProtein marketplace.
              </p>
              <button
                className="vendor-add-button"
                onClick={openCreateForm}
                type="button"
              >
                <Plus size={17} />
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="vendor-listing-grid">
              {listings.map((listing) => {
                const available =
                  listing.is_available && listing.quantity_available > 0;

                return (
                  <article
                    className="vendor-listing-card"
                    key={listing.id}
                  >
                    <div className="vendor-listing-top">
                      <div className="vendor-food-icon">
                        <Utensils size={21} />
                      </div>

                      <span
                        className={`vendor-listing-status ${
                          available
                            ? "vendor-status-available"
                            : "vendor-status-unavailable"
                        }`}
                      >
                        {available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="vendor-listing-content">
                      <h3>{listing.title}</h3>
                      <p className="vendor-listing-food-name">
                        {listing.food.name}
                      </p>

                      {listing.description && (
                        <p className="vendor-listing-description">
                          {listing.description}
                        </p>
                      )}

                      <div className="vendor-listing-price">
                        ₦{listing.price_ngn.toLocaleString("en-NG")}
                      </div>

                      <div className="vendor-listing-meta">
                        <span>
                          <Package size={15} />
                          {listing.quantity_available} in stock
                        </span>
                        <span>
                          {listing.serving_size_g}g serving
                        </span>
                      </div>

                      <div className="vendor-nutrition">
                        <div>
                          <strong>
                            {(
                              listing.food.protein_per_100g *
                              listing.serving_size_g /
                              100
                            ).toFixed(1)}
                            g
                          </strong>
                          <span>Protein</span>
                        </div>
                        <div>
                          <strong>
                            {Math.round(
                              listing.food.calories_per_100g *
                              listing.serving_size_g /
                              100
                            )}
                          </strong>
                          <span>Calories</span>
                        </div>
                        <div>
                          <strong>
                            {listing.food.protein_category}
                          </strong>
                          <span>Category</span>
                        </div>
                      </div>
                    </div>

                    <div className="vendor-listing-actions">
                      <button
                        className="vendor-edit-button"
                        onClick={() => openEditForm(listing)}
                        type="button"
                      >
                        <Edit size={15} />
                        Edit
                      </button>

                      <button
                        className={`vendor-toggle-button ${
                          available ? "is-available" : ""
                        }`}
                        onClick={() => toggleAvailability(listing)}
                        type="button"
                      >
                        {available ? (
                          <ToggleRight size={19} />
                        ) : (
                          <ToggleLeft size={19} />
                        )}
                        {available ? "Turn Off" : "Turn On"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="vendor-modal-overlay">
          <div className="vendor-modal">
            <div className="vendor-modal-header">
              <div>
                <p className="vendor-eyebrow">
                  {editingListing ? "UPDATE MENU ITEM" : "NEW MENU ITEM"}
                </p>
                <h2>
                  {editingListing ? "Edit Food Listing" : "Add Food Listing"}
                </h2>
              </div>

              <button
                className="vendor-modal-close"
                onClick={() => setShowForm(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vendor-listing-form">
              <label>
                Food Catalogue Item
                <select
                  value={form.food_id}
                  onChange={(event) => handleFoodChange(event.target.value)}
                  required
                >
                  <option value="">Select a food</option>
                  {foods.map((food) => (
                    <option value={food.id} key={food.id}>
                      {food.name}
                    </option>
                  ))}
                </select>
              </label>

              {form.food_id && (
                <div className="vendor-food-preview">
                  {(() => {
                    const food = foods.find(
                      (item) => item.id === Number(form.food_id)
                    );

                    if (!food) return null;

                    return (
                      <>
                        <strong>Nutrition per 100g</strong>
                        <div className="vendor-food-preview-grid">
                          <span>Protein: {food.protein_per_100g}g</span>
                          <span>Calories: {food.calories_per_100g}</span>
                          <span>Carbs: {food.carbohydrates_per_100g}g</span>
                          <span>Fat: {food.fat_per_100g}g</span>
                        </div>
                        {food.allergens && (
                          <p>
                            <strong>Allergens:</strong> {food.allergens}
                          </p>
                        )}
                        {food.dietary_tags && (
                          <p>
                            <strong>Dietary:</strong>{" "}
                            {food.dietary_tags.replaceAll(",", ", ")}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <label>
                Listing Title
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Fresh Soy Milk"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe your food offering..."
                  rows={3}
                  maxLength={2000}
                />
              </label>

              <div className="vendor-form-grid">
                <label>
                  Price (₦)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.price_ngn}
                    onChange={(event) =>
                      setForm({ ...form, price_ngn: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Quantity in Stock
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity_available}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        quantity_available: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Serving Size (g)
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    step="0.1"
                    value={form.serving_size_g}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        serving_size_g: event.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>

              {error && (
                <div className="vendor-alert vendor-alert-error">
                  <XCircle size={17} />
                  {error}
                </div>
              )}

              <div className="vendor-form-actions">
                <button
                  type="button"
                  className="vendor-cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vendor-submit-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="vendor-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingListing ? "Save Changes" : "Create Listing"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
