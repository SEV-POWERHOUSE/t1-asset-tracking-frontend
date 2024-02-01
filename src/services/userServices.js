import apiClient from "./services.js";

export default {
  // Retrieve all users
  getAll() {
    return apiClient.get("/users");
  },

  // Find a single user by ID
  get(id) {
    return apiClient.get(`/users/${id}`);
  },

  // Create a new user
  create(data) {
    return apiClient.post("/users", data);
  },

  // Update a user by ID
  update(id, data) {
    return apiClient.put(`/users/${id}`, data);
  },

  // Update a user's group by user ID
  updateGroup(userId, groupId) {
    console.log("Updating user group:", groupId);
    return apiClient.put(`/users/${userId}/group`, { userGroupId: groupId });
  },

  // Delete a user by ID
  delete(id) {
    return apiClient.delete(`/users/${id}`);
  },

  // Delete all users
  deleteAll() {
    return apiClient.delete(`/users`);
  },
};
