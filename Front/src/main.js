import "./assets/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import GameView from "./views/GameView.vue";
import AuthView from "./views/AuthView.vue";
import { authService } from "./services/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "game",
      component: GameView,
      meta: { requiresAuth: true },
    },
    {
      path: "/auth",
      name: "auth",
      component: AuthView,
      meta: { requiresAuth: false },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "auth" });
  } else if (to.name === "auth" && isAuthenticated) {
    next({ name: "game" });
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount("#app");
