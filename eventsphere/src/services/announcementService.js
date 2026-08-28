import api from "./api";

const announcementService = {
  getAll: () => api.get("/announcements"),
  getPublished: () => api.get("/announcements?status=published"),
  create: (data) => api.post("/announcements", data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  remove: (id) => api.delete(`/announcements/${id}`),
};

export default announcementService;
