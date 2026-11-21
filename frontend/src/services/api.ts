/**
 * Centralized API service for CampusProtein
 */

const API_BASE = "/proxy/8000/api/v1";

function getAuthHeaders() {
  const token = localStorage.getItem("campus_protein_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}

// Cart API
export async function getCart() {
  return fetchAPI("/orders/cart");
}

export async function addToCart(listingId: number, quantity: number) {
  return fetchAPI("/orders/cart", {
    method: "POST",
    body: JSON.stringify({ listing_id: listingId, quantity }),
  });
}

export async function removeFromCart(listingId: number) {
  return fetchAPI(`/orders/cart/${listingId}`, { method: "DELETE" });
}

export async function clearCart() {
  return fetchAPI("/orders/cart", { method: "DELETE" });
}

// Orders API
export async function createOrder(items: { listing_id: number; quantity: number }[]) {
  return fetchAPI("/orders/", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

export async function getOrders() {
  return fetchAPI("/orders/");
}

export async function getOrder(orderId: number) {
  return fetchAPI(`/orders/${orderId}`);
}

// Consumer Profile API
export async function getConsumerProfile() {
  return fetchAPI("/consumer/profile");
}

export async function updateConsumerProfile(profile: {
  protein_goal_g: number;
  budget_ngn?: number;
  dietary_restrictions?: string;
  preferred_proteins?: string;
}) {
  return fetchAPI("/consumer/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

// Meal Logging API
export async function logMeal(foodId: number, servings: number) {
  return fetchAPI("/consumer/meals", {
    method: "POST",
    body: JSON.stringify({ food_id: foodId, servings }),
  });
}

export async function getMealLogs() {
  return fetchAPI("/consumer/meals");
}

export async function getDailyTotal() {
  return fetchAPI("/consumer/meals/daily-total");
}

// Gamification API
export async function getGamification() {
  return fetchAPI("/consumer/gamification");
}

export async function joinChallenge() {
  return fetchAPI("/consumer/gamification/join-challenge", {
    method: "POST",
  });
}

// Foods API
export async function getFoods(params?: {
  search?: string;
  category?: string;
  min_protein?: number;
  max_price?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.min_protein) query.set("min_protein", params.min_protein.toString());
  if (params?.max_price) query.set("max_price", params.max_price.toString());
  
  const queryString = query.toString();
  return fetchAPI(`/foods/${queryString ? `?${queryString}` : ""}`);
}

export async function getFoodCatalogue() {
  return fetchAPI("/foods/catalogue");
}
