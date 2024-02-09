import { createStore } from "vuex";
import Utils from "../config/utils";

const user = Utils.getStore("user");

const store = createStore({
  state: {
    loginUser: user,
  },
  mutations: {
    setLoginUser(state, user) {
      state.loginUser = user; // Assuming `user` includes `profilePictureURL`
      Utils.setStore("user", user); // This utility method should also save the profilePictureURL
    },
  },  
  actions: {
    login({ commit }, user) {
      commit("setLoginUser", user);
    },
  },
  getters: {
    getLoginUserInfo(state) {
      return state.loginUser;
    },
    isAdmin(state) {
      // Assuming `adminGroupId` is the ID for the Admin group, adjust as necessary
      const adminGroupId = 1; // Example ID, adjust based on your actual Admin group ID
      return state.loginUser && state.loginUser.userGroupId === adminGroupId;
    },
    isGroupAssigned(state) {
      return state.loginUser && state.loginUser.userGroupId !== null;
    },
    // Add a getter to check for development permission
    isDev(state) {
      // This will return true if `devPermission` is true, and false otherwise
      return state.loginUser && state.loginUser.devPermission === true;
    },
  },
});

export default store;