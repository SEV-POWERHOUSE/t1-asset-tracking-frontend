import apiClient from "./services";

const baseURL = "/personAsset/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(personAssetId) {
    return apiClient.get(baseURL + `${personAssetId}`);
  },
  update(personAssetId, data) {
    return apiClient.put(baseURL + `${personAssetId}`, data);
  },
  delete(personAssetId) {
    return apiClient.delete(baseURL + `${personAssetId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
