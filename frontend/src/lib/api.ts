import type { AnalyticsData, PortfolioCoach, Strategy, Trade, TradeAnalysis, User } from "@/lib/types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.DJANGO_API_URL || "http://localhost:8000";
}

function tokenKey(): string {
  return "tradebook_access_token";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${getBaseUrl()}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = Array.isArray(body.detail) ? body.detail[0] : body.detail || body.message || (body.password ? body.password[0] : res.statusText);
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(tokenKey());
}

function setToken(access: string): void {
  localStorage.setItem(tokenKey(), access);
}

function clearToken(): void {
  localStorage.removeItem(tokenKey());
}

export const api = {
  getToken,

  logout(): void {
    clearToken();
  },

  async login(email: string, password: string): Promise<void> {
    const data = await request<{ access: string; refresh: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access);
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    const data = await request<{ access: string; refresh: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
    setToken(data.access);
  },

  async getMe(): Promise<User> {
    return request<User>("/api/auth/me");
  },

  async getAnalytics(params: { year?: string; month?: string }): Promise<AnalyticsData> {
    const qs = new URLSearchParams();
    if (params.year) qs.set("year", params.year);
    if (params.month) qs.set("month", params.month);
    return request<AnalyticsData>(`/api/analytics/dashboard?${qs.toString()}`);
  },

  async getTrades(filter?: Record<string, string>): Promise<Trade[]> {
    const qs = new URLSearchParams();
    if (filter) {
      for (const [k, v] of Object.entries(filter)) {
        if (v) qs.set(k, v);
      }
    }
    const q = qs.toString();
    return request<Trade[]>(`/api/trades${q ? `?${q}` : ""}`);
  },

  async getTrade(id: number): Promise<Trade> {
    return request<Trade>(`/api/trades/${id}`);
  },

  async createTrade(data: Record<string, unknown>): Promise<Trade> {
    return request<Trade>("/api/trades", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteTrade(id: number): Promise<void> {
    return request<void>(`/api/trades/${id}`, { method: "DELETE" });
  },

  async uploadTradeImage(tradeId: number, file: File): Promise<void> {
    const fd = new FormData();
    fd.append("image", file);
    await request<void>(`/api/trades/${tradeId}/upload_image`, {
      method: "POST",
      body: fd,
    });
  },

  async analyzeTrade(id: number): Promise<TradeAnalysis> {
    return request<TradeAnalysis>("/api/ai/analyze-trade", {
      method: "POST",
      body: JSON.stringify({ trade_id: id }),
    });
  },

  async portfolioCoach(): Promise<PortfolioCoach> {
    return request<PortfolioCoach>("/api/ai/portfolio-coach", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async getStrategies(): Promise<Strategy[]> {
    return request<Strategy[]>("/api/strategies");
  },

  async createStrategy(data: Record<string, unknown>): Promise<Strategy> {
    return request<Strategy>("/api/strategies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateStrategy(id: number, data: Record<string, unknown>): Promise<Strategy> {
    return request<Strategy>(`/api/strategies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteStrategy(id: number): Promise<void> {
    return request<void>(`/api/strategies/${id}`, { method: "DELETE" });
  },
};
