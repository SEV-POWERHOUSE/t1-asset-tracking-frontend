import apiClient from "./services";

const baseURL = "/lease/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(leaseId) {
    return apiClient.get(baseURL + `${leaseId}`);
  },
  update(leaseId, data) {
    return apiClient.put(baseURL + `${leaseId}`, data);
  },
  delete(leaseId) {
    return apiClient.delete(baseURL + `${leaseId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
