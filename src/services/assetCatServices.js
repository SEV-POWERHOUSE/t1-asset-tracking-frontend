import apiClient from "./services";

const baseURL = "/assetCat/"; 

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(catId) {
    return apiClient.get(baseURL + `${catId}`);
  },
  update(catId, data) {
    return apiClient.put(baseURL + `${catId}`, data);
  },
  delete(catId) {
    return apiClient.delete(baseURL + `${catId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
