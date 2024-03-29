import { createRouter, createWebHistory } from "vue-router";

import Login from "./views/Login.vue";
import AdminDashboard from "./views/AdminDashboard.vue";
import UnassignedDashboard from "./views/UnassignedDashboard.vue";
import UserDashboard from "./views/UserDashboard.vue";
import DevTools from "./views/DevTools.vue";
import UserManage from "./views/UserManage.vue";
import AssetManage from "./views/AssetManage.vue";
import FacilityManage from "./views/FacilityManage.vue";
import PersonManage from "./views/PersonManage.vue";
import ProfileView from "./views/ProfileView.vue";
import AssetCheckout from "./views/AssetCheckout.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
      // meta: {
      //   breadCrumb: [{ text: 'Login' }]
      // }
    },
    {
      path: "/adminDashboard",
      name: "adminDashboard",
      component: AdminDashboard,
      // meta: {
      //   breadCrumb: [{ text: 'Admin Dashboard' }]
      // }
    },
    {
      path: "/unassignedDashboard",
      name: "unassignedDashboard",
      component: UnassignedDashboard,
      // meta: {
      //   breadCrumb: [{ text: 'Unassigned Dashboard' }]
      // }
    },
    {
      path: "/userDashboard",
      name: "userDashboard",
      component: UserDashboard,
      // meta: {
      //   breadCrumb: [
      //     { text: 'Login', to: {name: 'login'}},
      //     { text: 'User Dashboard' }
      //   ]
      // }
    },
    {
      path: "/devTools",
      name: "devTools",
      component: DevTools,
      // meta: {
      //   breadCrumb: [
      //     { text: 'Admin Dashboard', to: {name: 'adminDashboard'}},
      //     { text: 'Dev Tools' }
      //   ]
      // }
    },
    {
      path: "/userManage",
      name: "userManage",
      component: UserManage,
      // meta: {
      //   breadCrumb: [
      //     { text: 'Admin Dashboard'},
      //     { text: 'User Manage' }
      //   ]
      // }
    },
    {
      path: "/assetManage",
      name: "assetManage",
      component: AssetManage,
      // meta: {
      //   breadCrumb: [
      //     { text: 'Admin Dashboard'},
      //     { text: 'Asset Manage' }
      //   ]
      // }
    },
    {
      path: "/facilityManage",
      name: "facilityManage",
      component: FacilityManage,
      // meta: {
      //   breadCrumb: [
      //     { text: 'Admin Dashboard'},
      //     { text: 'Building Manage' }
      //   ]
      // }
    },
    {
      path: "/personManage",
      name: "personManage",
      component: PersonManage,
    },
    {
      path: "/profileView:profileId",
      name: "profileView",
      component: ProfileView,
      props: true,
    },
    {
      path: "/assetCheckout",
      name: "assetCheckout",
      component: AssetCheckout,
    },
  ],
});

export default router;

// Template for breadcrumb links
// meta: {
//   breadCrumb: [
//     { text: 'Admin Dashboard', to: {name: 'adminDashboard'}},
//     { text: 'Dev Tools' }
//   ]
// }
