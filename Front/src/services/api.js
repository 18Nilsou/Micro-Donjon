const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Game endpoints
  async getGame() {
    return this.request("/game");
  }

  async startGame(heroId) {
    return this.request("/game/start", {
      method: "POST",
      body: JSON.stringify({ heroId }),
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

  async moveHero(heroId, x, y) {
    return this.request(`/hero/${heroId}/move`, {
      method: "PUT",
      body: JSON.stringify({ x, y }),
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

  async attackInFight(fightId) {
    return this.request(`/fight/${fightId}/attack`, {
      method: "POST",
    });
  }

  async defendInFight(fightId) {
    return this.request(`/fight/${fightId}/defend`, {
      method: "POST",
    });
  }

  async fleeFromFight(fightId) {
    return this.request(`/fight/${fightId}/flee`, {
      method: "POST",
    });
  }

  // Item endpoints
  async getItems() {
    return this.request("/items");
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
