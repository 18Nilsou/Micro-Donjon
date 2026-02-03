<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "./services/auth";

const router = useRouter();
const route = useRoute();

const user = ref(authService.getUser());
const isAuthenticated = computed(() => authService.isAuthenticated());
const showHeader = computed(() => route.name !== "auth");

watch(
  () => route.path,
  () => {
    user.value = authService.getUser();
  }
);

onMounted(() => {
  user.value = authService.getUser();
});

const logout = () => {
  authService.logout();
  router.push("/auth");
};
</script>

<template>
  <div id="app">
    <header v-if="showHeader && isAuthenticated" class="app-header">
      <div class="header-left">
        <span class="logo">🏰 Micro-Donjon</span>
      </div>
      <div class="header-right">
        <span class="user-info" v-if="user">
          👤 {{ user.username }}
        </span>
        <button @click="logout" class="logout-btn">Déconnexion</button>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
  color: #e0e0e0;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(30, 30, 46, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left .logo {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffd700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: #a0a0a0;
  font-size: 0.95rem;
}

.logout-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ff6b6b;
  color: #1e1e2e;
}

.app-main {
  flex: 1;
}
</style>

