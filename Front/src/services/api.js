import { authService } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = authService.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (response.status === 401) {
        // Token expired or invalid, logout and redirect
        authService.logout();
        window.location.href = "/auth";
        throw new Error("Session expirée, veuillez vous reconnecter");
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Game endpoints
  async getGame() {
    return this.request("/game");
  }

  async startGame(hero, dungeon) {
    return this.request("/game/start", {
      method: "POST",
      body: JSON.stringify({ hero, dungeon }),
    });
  }

  async deleteGame() {
    return this.request("/game", {
      method: "DELETE",
    });
  }

  // Hero endpoints
  async getHeroes() {
    return this.request("/heroes");
  }

  async addItemToHero(heroId, item) {
    return this.request(`/heroes/${heroId}/inventory`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async consumeHeroItem(heroId, item) {
    return this.request(`/heroes/${heroId}/inventory/consume`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async getHeroClasses() {
    return this.request("/heroes/classes");
  }

  async getHero(id) {
    return this.request(`/heroes/${id}`);
  }

  async createHero(heroData) {
    return this.request("/heroes", {
      method: "POST",
      body: JSON.stringify(heroData),
    });
  }

  async deleteHero(id) {
    return this.request(`/heroes/${id}`, {
      method: "DELETE",
    });
  }

  async moveHero(dungeon, commonMobs, x, y) {
    return this.request(`/hero/move`, {
      method: "POST",
      body: JSON.stringify({ dungeon, commonMobs, x, y }),
    });
  }

  // Dungeon endpoints
  async getDungeons() {
    return this.request("/dungeons");
  }

  async getDungeon(id) {
    return this.request(`/dungeons/${id}`);
  }

  async createDungeon(dungeonData) {
    return this.request("/dungeons", {
      method: "POST",
      body: JSON.stringify(dungeonData),
    });
  }

  // Fight endpoints
  async getFight() {
    return this.request("/fight");
  }

  async startFight(fightData) {
    return this.request("/fight", {
      method: "POST",
      body: JSON.stringify(fightData),
    });
  }

  async updateFight(fightData) {
    return this.request("/fight", {
      method: "PUT",
      body: JSON.stringify(fightData),
    });
  }

  async attackInFight(fightId, hero) {
    return this.request(`/fight/${fightId}/attack`, {
      method: "POST",
      body: JSON.stringify(hero),
    });
  }

  async defendInFight(fightId, hero) {
    return this.request(`/fight/${fightId}/defend`, {
      method: "POST",
      body: JSON.stringify(hero),
    });
  }

  async fleeFromFight(fightId, hero) {
    return this.request(`/fight/${fightId}/flee`, {
      method: "POST",
      body: JSON.stringify(hero),
    });
  }

  // Item endpoints
  async getItems() {
    return this.request("/items");
  }

  async getItemById(id) {
    return this.request(`/items/${id}`);
  }

  async getRandomItem() {
    return this.request("/items/random");
  }

  // Mob endpoints
  async getMobs() {
    return this.request("/mobs");
  }

  async getMobsByType(type) {
    return this.request(`/mobs/type/${type}`);
  }

  async getMob(id) {
    return this.request(`/mobs/${id}`);
  }
}

export default new ApiService();
