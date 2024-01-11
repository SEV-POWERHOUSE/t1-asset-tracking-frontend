import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/accommodationCategories");
  },
  // Fetch the accommodationCategoryId from the accommodationCategory by categoryName
  getByCategoryName(categoryName) {
    return apiClient.get(`/accommodationCategories?categoryName=${categoryName}`);
  },
  get(id) {
    return apiClient.get(`/accommodationCategories/${id}`);
  },  
  create(data) {
    return apiClient.post('/accommodationCategories', data);
  },  
  update(id, data) {
    return apiClient.put(`/accommodationCategories/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/accommodationCategories/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/accommodationCategories`);
  },
};
