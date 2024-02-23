import apiClient from "./services.js";

export default {
  // Retrieve all UserRoles
  getAll() {
    return apiClient.get("/userRole");
  },

  // Find a single UserRole by USERROLEID
  get(userRoleId) {
    return apiClient.get(`/userRole/${userRoleId}`);
  },

  // Fetch the userRoleUserRoleId from the userRole by role name
  getByRoleName(roleName) {
    return apiClient.get(`/userRole?roleName=${roleName}`);
  },

  // Create a new UserRole
  create(data) {
    return apiClient.post("/userRole", data);
  },

  // Update a UserRole by ?
  update(userId, data) {
    return apiClient.put(`/userRole/${userId}`, data);
  },

  // Delete a UserRole by USERROLEID
  delete(userRoleid) {
    return apiClient.delete(`/userRole/${userRoleid}`);
  },

  // Delete all UserRoles
  deleteAll() {
    return apiClient.delete(`/userRole`);
  },
};
