import apiClient from "./services";

const baseURL = "/person/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(personId) {
    return apiClient.get(baseURL + `${personId}`);
  },
  update(personId, data) {
    return apiClient.put(baseURL + `${personId}`, data);
  },
  delete(personId) {
    return apiClient.delete(baseURL + `${personId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
