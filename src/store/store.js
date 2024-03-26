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
    isDev(state) {
      return state.loginUser && state.loginUser.devPermission === true;
    },
    canAdd(state) {
      return state.loginUser && state.loginUser.canAdd === true;
    },
    canEdit(state) {
      return state.loginUser && state.loginUser.canEdit === true;
    },
    canDelete(state) {
      return state.loginUser && state.loginUser.canDelete === true;
    },
    canArchive(state) {
      return state.loginUser && state.loginUser.canArchive === true;
    },
    canActivate(state) {
      return state.loginUser && state.loginUser.canActivate === true;
    },
  },
});

export default store;