import apiClient from "./services";

const baseURL = "/logType/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(logTypeId) {
    return apiClient.get(baseURL + `${logTypeId}`);
  },
  update(logTypeId, data) {
    return apiClient.put(baseURL + `${logTypeId}`, data);
  },
  delete(logTypeId) {
    return apiClient.delete(baseURL + `${logTypeId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
