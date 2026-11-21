const API_BASE = "/proxy/8000/api/v1";

export type UserRole = "consumer" | "vendor" | "admin";

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterPayload {
  email: string;
  display_name: string;
  password: string;
  role: "consumer" | "vendor";
  business_name?: string;
  location?: string;
  opening_time?: string;
  closing_time?: string;
  description?: string;
}

const TOKEN_KEY = "campusprotein_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const data = await response.json();

      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        message = data.detail
          .map((error: { msg?: string }) => error.msg ?? "Invalid input")
          .join(", ");
      }
    } catch {
      message = `Request failed (${response.status})`;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  saveToken(result.access_token);
  return result;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const result = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveToken(result.access_token);
  return result;
}

export async function getCurrentUser(): Promise<User> {
  return request<User>("/auth/me");
}

export function logout(): void {
  removeToken();
}
