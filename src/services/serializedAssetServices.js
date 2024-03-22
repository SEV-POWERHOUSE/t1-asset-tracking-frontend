import apiClient from "./services";

const baseURL = "/serializedAsset/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(serializedAssetId) {
    return apiClient.get(baseURL + serializedAssetId);
  },
  update(serializedAssetId, data) {
    return apiClient.put(baseURL + serializedAssetId, data);
  },
  updateCheckoutStatus(serializedAssetId, checkoutStatus) {
    return this.update(serializedAssetId, { checkoutStatus: checkoutStatus });
  },
  delete(serializedAssetId) {
    return apiClient.delete(baseURL + serializedAssetId);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
