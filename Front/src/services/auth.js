const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

class AuthService {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Une erreur est survenue");
    }

    return data;
  }

  async register(username, email, password) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    this.setAuth(data.token, data.user);
    return data;
  }

  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.setAuth(data.token, data.user);
    return data;
  }

  logout() {
    this.clearAuth();
  }

  async getMe() {
    const data = await this.request("/auth/me");
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }

  async linkHero(heroId) {
    const data = await this.request("/auth/hero", {
      method: "PUT",
      body: JSON.stringify({ heroId }),
    });
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }

  async unlinkHero() {
    const data = await this.request("/auth/hero", {
      method: "DELETE",
    });
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }
}

export const authService = new AuthService();
