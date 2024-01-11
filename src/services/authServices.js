import apiClient from "./services.js";

export default {
  loginUser(user) {
    return apiClient.post("login", user);
  },
  authorizeUser(code) {
    return apiClient.post("authorize", code);
  },
  logoutUser(token) {
    return apiClient.post("logout", token);
  },
};
