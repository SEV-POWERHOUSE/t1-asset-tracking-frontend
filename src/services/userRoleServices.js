import apiClient from "./services.js";

export default {
  // Retrieve all UserRoles
  getAll() {
    return apiClient.get("/userRole");
  },

  // Find a single UserRole by ID
  get(id) {
    return apiClient.get(`/userRole/${id}`);
  },

  // Fetch the userRoleId from the userRole by role name
  getByRoleName(roleName) {
    return apiClient.get(`/userRole?roleName=${roleName}`);
  },

  // Create a new UserRole
  create(data) {
    return apiClient.post("/userRole", data);
  },

  // Update a UserRole by ID
  update(id, data) {
    return apiClient.put(`/userRole/${id}`, data);
  },

  // Delete a UserRole by ID
  delete(id) {
    return apiClient.delete(`/userRole/${id}`);
  },

  // Delete all UserRoles
  deleteAll() {
    return apiClient.delete(`/userRole`);
  },
};
