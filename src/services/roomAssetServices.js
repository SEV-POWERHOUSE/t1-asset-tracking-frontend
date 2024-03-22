import apiClient from "./services";

const baseURL = "/roomAsset/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(roomAssetId) {
    return apiClient.get(baseURL + `${roomAssetId}`);
  },
  update(roomAssetId, data) {
    return apiClient.put(baseURL + `${roomAssetId}`, data);
  },
  updateCheckoutStatus(roomAssetId, checkoutStatus) {
    return this.update(roomAssetId, { checkoutStatus: checkoutStatus });
  },
  updateCheckoutStatusAndDate(roomAssetId, checkoutStatus, date) {
    return this.update(roomAssetId, {
      checkoutStatus: checkoutStatus,
      checkinDate: date,
    });
  },
  delete(roomAssetId) {
    return apiClient.delete(baseURL + `${roomAssetId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
