<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>🏰 Micro-Donjon</h1>
        <p>{{ isLogin ? 'Connectez-vous pour continuer' : 'Créez votre compte' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="!isLogin" class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Entrez votre pseudo"
            required
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Entrez votre email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Entrez votre mot de passe"
            required
            minlength="6"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">Chargement...</span>
          <span v-else>{{ isLogin ? 'Se connecter' : "S'inscrire" }}</span>
        </button>
      </form>

      <div class="auth-switch">
        <p v-if="isLogin">
          Pas encore de compte ?
          <a href="#" @click.prevent="toggleMode">S'inscrire</a>
        </p>
        <p v-else>
          Déjà un compte ?
          <a href="#" @click.prevent="toggleMode">Se connecter</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/auth";

const router = useRouter();

const isLogin = ref(true);
const username = ref("");
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = "";
};

const handleSubmit = async () => {
  error.value = "";
  loading.value = true;

  try {
    if (isLogin.value) {
      await authService.login(email.value, password.value);
    } else {
      await authService.register(username.value, email.value, password.value);
    }
    router.push("/");
  } catch (err) {
    error.value = err.message || "Une erreur est survenue";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
}

.auth-card {
  background: rgba(45, 45, 68, 0.9);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 10px;
}

.auth-header p {
  color: #a0a0a0;
  font-size: 0.95rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(30, 30, 46, 0.8);
  color: #e0e0e0;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.form-group input::placeholder {
  color: #666;
}

.error-message {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.submit-btn {
  padding: 14px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  color: #1e1e2e;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 24px;
  color: #a0a0a0;
  font-size: 0.9rem;
}

.auth-switch a {
  color: #ffd700;
  text-decoration: none;
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
