import api from "./api";

const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  adminLogin: (credentials) => api.post("/auth/admin-login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  adminResetUserPassword: (id, password) => api.patch(`/auth/admin/${id}/password`, { password }),
  getMyProfile: () => api.get("/auth/me"),
  updateMyProfile: (data) => api.patch("/auth/me", data),
  getAllUsersAdmin: () => api.get("/auth/admin/all"),
  updateUserAdmin: (id, data) => api.put(`/auth/admin/${id}`, data),
  updateUserStatusAdmin: (id, status) => api.patch(`/auth/admin/${id}/status`, { status }),
  deleteUserAdmin: (id) => api.delete(`/auth/admin/${id}`),
};

export default authService;