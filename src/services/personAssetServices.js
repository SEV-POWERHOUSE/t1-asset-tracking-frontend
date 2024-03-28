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
  updateCheckoutStatus(personAssetId, checkoutStatus) {
    return this.update(personAssetId, { checkoutStatus: checkoutStatus });
  },
  updateCheckoutStatusAndDate(personAssetId, checkoutStatus, date, checkedInBy) {
    return this.update(personAssetId, {
      checkoutStatus: checkoutStatus,
      checkinDate: date,
      checkedInBy: checkedInBy,
    });
  },
  delete(personAssetId) {
    return apiClient.delete(baseURL + `${personAssetId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
