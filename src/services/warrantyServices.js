import apiClient from "./services";

const baseURL = "/warranty/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(warrantyId) {
    return apiClient.get(baseURL + warrantyId);
  },
  update(warrantyId, data) {
    return apiClient.put(baseURL + warrantyId, data);
  },
  delete(warrantyId) {
    return apiClient.delete(baseURL + warrantyId);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
