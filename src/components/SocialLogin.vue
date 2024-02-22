<script setup>
import { ref, onMounted } from "vue";
import AuthServices from "../services/authServices";
import Utils from "../config/utils.js";
import { useStore } from "vuex"; // Import useStore
import { useRouter } from "vue-router";

const router = useRouter();
const store = useStore(); // Use the store
const fName = ref("");
const lName = ref("");
const user = ref({});

const loginWithGoogle = () => {
  window.handleCredentialResponse = handleCredentialResponse;
  const client = import.meta.env.VITE_APP_CLIENT_ID;
  window.google.accounts.id.initialize({
    client_id: client,
    cancel_on_tap_outside: false,
    auto_select: true,
    callback: window.handleCredentialResponse,
  });
  window.google.accounts.id.renderButton(document.getElementById("parent_id"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signup_with",
    width: 400,
  });
};

const handleCredentialResponse = async (response) => {
  let token = {
    credential: response.credential,
  };
  await AuthServices.loginUser(token)
    .then((response) => {
      user.value = response.data;
      Utils.setStore("user", user.value);
      fName.value = user.value.fName;
      lName.value = user.value.lName;

      // Set the user in the store, which will also set the isAdmin flag
      store.commit("setLoginUser", user.value);

      // Check if the user is admin and redirect accordingly
      if (store.getters.isAdmin) {
        router.push({ name: "adminDashboard" }); // Redirect to admin dashboard
      } else if (store.getters.isRoleAssigned) {
        router.push({ name: "userDashboard" }); // Redirect to the page for non admin and non-unassigned id
      } else router.push({ name: "unassignedDashboard" }); // Redirect to the page for unassigned id
    })
    .catch((error) => {
      console.log("error", error);
    });
};

onMounted(() => {
  loginWithGoogle();
});
</script>

<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div display="flex" id="parent_id"></div>
    </v-row>
  </div>
</template>
