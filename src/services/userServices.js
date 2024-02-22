import apiClient from "./services.js";

export default {
  // Retrieve all users
  getAll() {
    return apiClient.get("/user");
  },

  // Find a single user by ID
  get(id) {
    return apiClient.get(`/user/${id}`);
  },

  // Create a new user
  create(data) {
    return apiClient.post("/user", data);
  },

  // Update a user by ID
  update(id, data) {
    return apiClient.put(`/user/${id}`, data);
  },

  // Update a user's role by user ID
  updateRole(userId, roleId) {
    console.log(`Service: Updating user ${userId} role to`, roleId);
    return apiClient.put(`/user/${userId}/role`, { userRoleId: roleId });
  },

  // Delete a user by ID
  delete(id) {
    return apiClient.delete(`/user/${id}`);
  },

  // Delete all users
  deleteAll() {
    return apiClient.delete(`/user`);
  },
};
