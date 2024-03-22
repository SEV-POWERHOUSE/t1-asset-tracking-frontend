import apiClient from "./services";

const baseURL = "/buildingAsset/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(buildingAssetId) {
    return apiClient.get(baseURL + `${buildingAssetId}`);
  },
  update(buildingAssetId, data) {
    return apiClient.put(baseURL + `${buildingAssetId}`, data);
  },
  updateCheckoutStatus(buildingAssetId, checkoutStatus) {
    return this.update(buildingAssetId, { checkoutStatus: checkoutStatus });
  },
  updateCheckoutStatusAndDate(buildingAssetId, checkoutStatus, date) {
    return this.update(buildingAssetId, {
      checkoutStatus: checkoutStatus,
      checkinDate: date,
    });
  },
  delete(buildingAssetId) {
    return apiClient.delete(baseURL + `${buildingAssetId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
