import apiClient from "./services";

const baseURL = "/building/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(buildingId) {
    return apiClient.get(baseURL + `${buildingId}`);
  },
  update(buildingId, data) {
    return apiClient.put(baseURL + `${buildingId}`, data);
  },
  delete(buildingId) {
    return apiClient.delete(baseURL + `${buildingId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
