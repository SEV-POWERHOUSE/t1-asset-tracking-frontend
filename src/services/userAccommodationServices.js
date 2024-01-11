import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/userAccommodations");
  },
  getAllForUser(userId) {
    return apiClient.get(`/userAccommodations/user/${userId}`);
  }, 
  get(id) {
    return apiClient.get(`/userAccommodations/${id}`);
  },  
  create(data) {
    return apiClient.post('/userAccommodations', data);
  },  
  update(id, data) {
    return apiClient.put(`/userAccommodations/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/userAccommodations/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/userAccommodations`);
  },
  findByTitle(title) {
    return apiClient.get(`/userAccommodations?title=${title}`);
  },
};
