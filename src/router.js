import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import AccommodationsList from "./views/AccommodationsList.vue";
import AdminDashboard from "./views/AdminDashboard.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/adminDashboard",
      name: "adminDashboard",
      component: AdminDashboard,
    },
    {
      path: "/accommodationsList",
      name: "accommodationsList",
      component: AccommodationsList,
    },
  ],
});

export default router;
