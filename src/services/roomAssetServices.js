import apiClient from "./services";

const baseURL = "/roomAsset/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getByRoomId(roomId) {
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
