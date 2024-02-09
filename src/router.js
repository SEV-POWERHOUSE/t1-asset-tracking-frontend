import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import OtherDashboard from "./views/OtherDashboard.vue";
import UserDashboard from "./views/UserDashboard.vue";
import DevTools from "./views/DevTools.vue";
import GroupAssignment from "./views/GroupAssignment.vue";

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
      path: "/otherDashboard",
      name: "otherDashboard",
      component: OtherDashboard,
    },
    {
      path: "/userDashboard",
      name: "userDashboard",
      component: UserDashboard,
    },
    {
      path: "/devTools",
      name: "devTools",
      component: DevTools,
    },
    {
      path: "/groupAssignment",
      name: "groupAssignment",
      component: GroupAssignment,
    },
  ],
});

export default router;
