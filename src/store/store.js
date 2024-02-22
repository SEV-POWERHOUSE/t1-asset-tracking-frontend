import { createStore } from "vuex";
import Utils from "../config/utils";

const adminRoleId = 1;
const miscUserRoleId = 2;

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
      // Assuming `adminRoleId` is the ID for the Admin role, adjust as necessary
      return state.loginUser && state.loginUser.userRoleId === adminRoleId;
    },
    isRoleAssigned(state) {
      return state.loginUser && state.loginUser.userRoleId !== miscUserRoleId;
    },
    // Add a getter to check for development permission
    isDev(state) {
      // This will return true if `devPermission` is true, and false otherwise
      return state.loginUser && state.loginUser.devPermission === true;
    },
  },
});

export default store;