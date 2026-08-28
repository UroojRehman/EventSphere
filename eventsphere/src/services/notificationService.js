import api from "./api";

const notificationService = {
  subscribeToRealtime: (onMessage) => {
    const token = localStorage.getItem("token");
    if (!token || !window.EventSource) return () => {};
    const source = new EventSource(`${(import.meta.env.VITE_API_URL || "http://localhost:3000/api")}/realtime?token=${encodeURIComponent(token)}`);
    source.onmessage = (event) => onMessage(JSON.parse(event.data));
    return () => source.close();
  },
  getMyNotifications: async () => {
    return await api.get("/notifications/my");
  },

  getUnreadNotifications: async () => {
    return await api.get("/notifications/unread");
  },

  markAsRead: async (id) => {
    return await api.patch(
      `/notifications/${id}/read`
    );
  },

  markAllAsRead: async () => {
    return await api.patch(
      "/notifications/read-all"
    );
  },

  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },

  deleteReadNotifications: async () => {
    return await api.delete("/notifications/read");
  },

  createNotification: async (data) => {
    return await api.post("/notifications", data);
  },
};

export default notificationService;