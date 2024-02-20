import apiClient from "./services";

const baseURL = "/assetCategory/";

export default {
  create(data) {
    return apiClient.post(baseURL, data);
  },
  get(id) {
    return apiClient.get(baseURL, `${id}`);
  },  
  getAll() {
    return apiClient.get(baseURL);
  },
  getById(categoryId) {
    return apiClient.get(baseURL + `${categoryId}`);
  },
  // Fetch the categoryId from the assetCategory by categoryName
  getCategoryIdByName(categoryName) {
    return apiClient.get(`/assetCategory/byName?categoryName=${categoryName}`);
  },
  update(categoryId, data) {
    return apiClient.put(baseURL + `${categoryId}`, data);
  },
  delete(categoryId) {
    return apiClient.delete(baseURL + `${categoryId}`);
  },
  deleteAll() {
    return apiClient.delete(baseURL);
  },
};
