import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("/userAccommodationRequests");
  },
  getAllForUser(userId) {
    return apiClient.get(`/userAccommodationRequests/user/${userId}`);
  }, 
  get(id) {
    return apiClient.get(`/userAccommodationRequests/${id}`);
  },  
  create(data) {
    return apiClient.post('/userAccommodationRequests', data);
  },  
  update(id, data) {
    return apiClient.put(`/userAccommodationRequests/${id}`, data);
  },
  delete(id) {
    return apiClient.delete(`/userAccommodationRequests/${id}`);
  },
  deleteAll() {
    return apiClient.delete(`/userAccommodationRequests`);
  },
  findByTitle(title) {
    return apiClient.get(`/userAccommodationRequests?title=${title}`);
  },
};
