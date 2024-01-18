import { createStore } from "vuex";
import Utils from "../config/utils";

// Vue.use(Vuex);

const user = Utils.getStore("user");
const testAdminEmails = ["", "z.fike@eagles.oc.edu", "", ""];

// z.fike@eagles.oc.edu
// jaxen.mcray@eagles.oc.edu

const isAdmin =
  user &&
  user.email &&
  ((user.email.endsWith("@oc.edu") && !user.email.endsWith("@eagles.oc.edu")) ||
    testAdminEmails.includes(user.email)); // Check if the email is one of the test emails

const store = createStore({
  state: {
    loginUser: user,
    isAdmin: isAdmin,
  },
  mutations: {
    setLoginUser(state, user) {
      state.loginUser = user;
      Utils.setStore("user", user);
      // Whenever the loginUser is set, update the isAdmin state as well
      state.isAdmin =
        (user.email &&
          user.email.endsWith("@oc.edu") &&
          !user.email.endsWith("@eagles.oc.edu")) ||
        testAdminEmails.includes(user.email);
    },
  },
  actions: {
    login({ commit }, user) {
      // This action can be dispatched when a user logs in
      // Replace this with your actual login logic
      // After login, commit the user to setLoginUser mutation
      commit("setLoginUser", user);
    },
  },
  getters: {
    getLoginUserInfo(state) {
      return state.loginUser;
    },
    isAdmin(state) {
      // This getter can be used to access the isAdmin state in your Vue components
      return state.isAdmin;
    },
  },
});

export default store;
