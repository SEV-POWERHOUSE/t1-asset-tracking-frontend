import apiClient from "./services.js";

export default {
  // Retrieve all UserGroups
  getAll() {
    return apiClient.get("/userGroups");
  },

  // Find a single UserGroup by ID
  get(id) {
    return apiClient.get(`/userGroups/${id}`);
  },

  // Fetch the userGroupId from the userGroup by group name
  getByGroupName(groupName) {
    return apiClient.get(`/userGroups?groupName=${groupName}`);
  },

  // Create a new UserGroup
  create(data) {
    return apiClient.post("/userGroups", data);
  },

  // Update a UserGroup by ID
  update(id, data) {
    return apiClient.put(`/userGroups/${id}`, data);
  },

  // Delete a UserGroup by ID
  delete(id) {
    return apiClient.delete(`/userGroups/${id}`);
  },

  // Delete all UserGroups
  deleteAll() {
    return apiClient.delete(`/userGroups`);
  },
};
