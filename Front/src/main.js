import "./assets/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import GameView from "./views/GameView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "game",
      component: GameView,
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
