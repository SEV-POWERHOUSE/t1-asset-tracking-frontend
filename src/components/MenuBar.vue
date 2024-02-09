<script setup>
import ocLogo from "/oc-logo-white.png";
import { computed, ref, onMounted } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const user = ref(null);
const title = ref("Asset Tracking");
const initials = ref("");
const name = ref("");
const logoURL = ref("");
const router = useRouter();
const store = useStore(); // Use the store

const isAdmin = computed(() => store.getters.isAdmin);
const isGroupAssigned = computed(() => store.getters.isGroupAssigned);
// Compute isDev from store
const isDev = computed(() => store.getters.isDev);

const getDashboardRoute = () => {
  if (store.getters.isAdmin) {
    return { name: "adminDashboard" };
  } else if (store.getters.isGroupAssigned) {
    return { name: "userDashboard" };
  } else if (store.getters.isDev) {
  } else {
    return { name: "otherDashboard" };
  }
};

const resetMenu = () => {
  user.value = Utils.getStore("user");
  if (user.value && user.value.fName && user.value.lName) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  }
};

const logout = () => {
  AuthServices.logoutUser(user.value)
    .then((response) => {
      console.log(response);
      Utils.removeItem("user");
      router.push({ name: "login" }).then(() => {
        if (process.env.NODE_ENV === "development") {
          router.go();
        }
      });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

onMounted(() => {
  logoURL.value = ocLogo;
  resetMenu();
});
</script>

<template>
  <div>
    <v-app-bar app>
      <router-link :to="getDashboardRoute()">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <template v-if="user">
        <!-- Conditional rendering based on user group -->
        <template v-if="isAdmin">
          <v-btn text :to="{ name: 'adminDashboard' }">Admin Dashboard</v-btn>
          <v-btn text :to="{ name: 'groupAssignment' }">Group Assignment</v-btn>
        </template>
        <template v-else-if="isGroupAssigned">
          <v-btn text :to="{ name: 'userDashboard' }">User Dashboard</v-btn>
        </template>
        <template v-else>
          <v-btn text :to="{ name: 'otherDashboard' }">Other Dashboard</v-btn>
        </template>
        <template v-if="isDev">
          <v-btn text :to="{ name: 'devTools' }">Dev Tools</v-btn>
        </template>
      </template>

      <template v-if="user">
        <v-menu bottom min-width="200px" rounded offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon x-large>
              <v-avatar color="secondary">
                <span class="accent--text font-weight-bold">{{
                  initials
                }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>
              <div class="mx-auto text-center">
                <v-avatar color="secondary" class="mt-2 mb-2">
                  <span class="accent--text font-weight-bold">{{
                    initials
                  }}</span>
                </v-avatar>
                <h3>{{ name }}</h3>
                <p class="text-caption mt-1">{{ user.email }}</p>
                <v-divider class="my-3"></v-divider>
                <v-btn depressed rounded text @click="logout">Logout</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>
  </div>
</template>
