import apiClient from "./services";

const baseURL = "/assetType/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(typeId) {
    return apiClient.get(baseURL + `${typeId}`);
  },
  update(typeId, data) {
    return apiClient.put(baseURL + `${typeId}`, data);
  },
  delete(typeId) {
    return apiClient.delete(baseURL + `${typeId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
