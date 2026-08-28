import api from "./api";

const categoryService = {
  getAll: (kind = "category") => api.get(`/categories?kind=${kind}`),
  getAllAdmin: (kind = "category") => api.get(`/categories/admin/all?kind=${kind}`),
  create: (name, kind = "category") => api.post("/categories", { name, kind }),
  update: (id, name) => api.put(`/categories/${id}`, { name }),
  requestDelete: (id) => api.delete(`/categories/${id}`),
  adminDelete: (id) => api.delete(`/categories/admin/${id}`),
};

export default categoryService;
