import apiClient from "./services";

const baseURL = "/service/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(serviceId) {
    return apiClient.get(baseURL + serviceId);
  },
  update(serviceId, data) {
    return apiClient.put(baseURL + serviceId, data);
  },
  delete(serviceId) {
    return apiClient.delete(baseURL + serviceId);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
