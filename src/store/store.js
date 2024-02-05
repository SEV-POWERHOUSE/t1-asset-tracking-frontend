import { createStore } from "vuex";
import Utils from "../config/utils";

const user = Utils.getStore("user");

const store = createStore({
  state: {
    loginUser: user,
  },
  mutations: {
    setLoginUser(state, user) {
      state.loginUser = user;
      Utils.setStore("user", user);
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
  },
});

export default store;
