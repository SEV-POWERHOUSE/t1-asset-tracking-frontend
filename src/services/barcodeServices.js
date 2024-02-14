import apiClient from "./services";

const baseURL = "/barcode/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(barcodeId) {
    return apiClient.get(baseURL + `${barcodeId}`);
  },
  update(barcodeId, data) {
    return apiClient.put(baseURL + `${barcodeId}`, data);
  },
  delete(barcodeId) {
    return apiClient.delete(baseURL + `${barcodeId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
