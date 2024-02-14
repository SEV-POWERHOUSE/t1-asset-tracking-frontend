import apiClient from "./services";

const baseURL = "/room/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(roomId) {
    return apiClient.get(baseURL + `${roomId}`);
  },
  update(roomId, data) {
    return apiClient.put(baseURL + `${roomId}`, data);
  },
  delete(roomId) {
    return apiClient.delete(baseURL + `${roomId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
