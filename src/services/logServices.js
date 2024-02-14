import apiClient from "./services";

const baseURL = "/log/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(logId) {
    return apiClient.get(baseURL + `${logId}`);
  },
  update(logId, data) {
    return apiClient.put(baseURL + `${logId}`, data);
  },
  delete(logId) {
    return apiClient.delete(baseURL + `${logId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
