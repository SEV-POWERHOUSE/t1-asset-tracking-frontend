import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/semesters");
  },
  get(id) {
    return apiClient.get(`/semesters/${id}`);
  },  
  create(data) {
    return apiClient.post('/semesters', data);
  },  
  update(id, data) {
    return apiClient.put(`/semesters/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/semesters/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/semesters`);
  },
};