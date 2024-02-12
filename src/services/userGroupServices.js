import apiClient from "./services.js";

export default {
  // Retrieve all UserGroups
  getAll() {
    return apiClient.get("/userGroup");
  },

  // Find a single UserGroup by ID
  get(id) {
    return apiClient.get(`/userGroup/${id}`);
  },

  // Fetch the userGroupId from the userGroup by group name
  getByGroupName(groupName) {
    return apiClient.get(`/userGroup?groupName=${groupName}`);
  },

  // Create a new UserGroup
  create(data) {
    return apiClient.post("/userGroup", data);
  },

  // Update a UserGroup by ID
  update(id, data) {
    return apiClient.put(`/userGroup/${id}`, data);
  },

  // Delete a UserGroup by ID
  delete(id) {
    return apiClient.delete(`/userGroup/${id}`);
  },

  // Delete all UserGroups
  deleteAll() {
    return apiClient.delete(`/userGroup`);
  },
};
