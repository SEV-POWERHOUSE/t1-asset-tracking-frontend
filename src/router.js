import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import UnassignedDashboard from "./views/UnassignedDashboard.vue";
import UserDashboard from "./views/UserDashboard.vue";
import DevTools from "./views/DevTools.vue";
import GroupAssignment from "./views/GroupAssignment.vue";
import AssetManage from "./views/AssetManage.vue";
import BuildingManage from "./views/BuildingManage.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
      meta: {
        breadCrumb: [{ text: 'Login' }]
      }
    },
    {
      path: "/adminDashboard",
      name: "adminDashboard",
      component: AdminDashboard,
      meta: {
        breadCrumb: [{ text: 'Admin Dashboard' }]
      }
    },
    {
      path: "/unassignedDashboard",
      name: "unassignedDashboard",
      component: UnassignedDashboard,
      meta: {
        breadCrumb: [{ text: 'Unassigned Dashboard' }]
      }
    },
    {
      path: "/userDashboard",
      name: "userDashboard",
      component: UserDashboard,
      meta: {
        breadCrumb: [
          { text: 'Login', to: {name: 'login'}},
          { text: 'User Dashboard' }
        ]
      }
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
    {
      path: "/assetManage",
      name: "assetManage",
      component: AssetManage,
    },
    {
      path: "/buildingManage",
      name: "buildingManage",
      component: BuildingManage,
    },
  ],
});

export default router;
