import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import AccommodationsList from "./views/AccommodationsList.vue";
import AccommodationsRequest from "./views/AccommodationsRequest.vue";
import AccommodationsRequestList from "./views/AccommodationsRequestList.vue";
import RequestsView from "./views/RequestsView.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import AdminManage from "./views/AdminManage.vue";

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
      path: "/manage",
      name: "manage",
      component: AdminManage,
    },
    {
      path: "/accommodationsList",
      name: "accommodationsList",
      component: AccommodationsList,
    },
    {
      path: "/requestList",
      name: "requestList",
      component: AccommodationsRequestList,
    },
    {
      path: "/request",
      name: "request",
      component: AccommodationsRequest,
    },
    {
      path: "/view/:id",
      name: "view",
      component: RequestsView,
      props: true,
    },
  ],
});

export default router;
