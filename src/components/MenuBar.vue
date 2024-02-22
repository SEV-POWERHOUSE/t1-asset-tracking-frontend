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
const isRoleAssigned = computed(() => store.getters.isRoleAssigned);
// Compute isDev from store
const isDev = computed(() => store.getters.isDev);

const maintenanceActions = [
  {
    title: "Users",
    component: "userManage",
  },
  {
    title: "Assets",
    component: "assetManage",
  },
  {
    title: "Buildings",
    component: "buildingManage",
  },
];

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
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="user">
        <!-- Conditional rendering based on user role -->
        <template v-if="isAdmin">
          <v-btn text :to="{ name: 'adminDashboard' }">Admin Dashboard</v-btn>
          <v-btn>
            Maintain
            <v-menu activator="parent" open-on-hover>
              <v-list>
                <v-list-item
                  v-for="(item, index) in maintenanceActions"
                  :key="index"
                  :value="index"
                  @click="router.push({ name: item.component })"
                >
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>
        <template v-else-if="isRoleAssigned">
          <v-btn text :to="{ name: 'userDashboard' }">User Dashboard</v-btn>
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
