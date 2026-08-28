import api from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const normalizeMedia = (item) => ({
  ...item,
  fileUrl: item.fileUrl?.startsWith("/")
    ? `${API_ORIGIN}${item.fileUrl}`
    : item.fileUrl,
});

const mediaService = {
  uploadMedia: async (file, eventId, title, description = "") => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("media", file);
    formData.append("eventId", eventId);
    formData.append("title", title);
    formData.append("description", description);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Media upload failed");
    }

    return data;
  },

  uploadImage: async (file) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/media/upload`,
      {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Image upload failed"
      );
    }

    return data;
  },

  uploadMultiple: async (files) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(
      `${API_BASE_URL}/media/upload-multiple`,
      {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Images upload failed"
      );
    }

    return data;
  },

  getGallery: async () => {
    const response = await api.get("/media");
    return {
      ...response,
      media: (response.media || []).map(normalizeMedia),
    };
  },
  
  getAllMediaAdmin: async () => {
    const response = await api.get("/media/admin/all");
    return { ...response, media: (response.media || []).map(normalizeMedia) };
  },

  getMyMedia: async () => {
    const response = await api.get("/media/organizer/my");
    return { ...response, media: (response.media || []).map(normalizeMedia) };
  },

  getSavedMedia: async () => {
    const response = await api.get("/media/saved/my");
    return { ...response, media: (response.media || []).map(normalizeMedia) };
  },

  saveMedia: async (id) => {
    return await api.post(`/media/${id}/save`);
  },

  removeSavedMedia: async (id) => {
    return await api.delete(`/media/${id}/save`);
  },
  
  deleteMediaAdmin: async (id) => {
    return await api.delete(`/media/admin/${id}`);
  },

  approveMedia: async (id) => api.put(`/media/${id}/approve`),
  rejectMedia: async (id, comment) => api.put(`/media/${id}/reject`, { comment }),

  deleteMedia: async (id) => {
    return await api.delete(`/media/${id}`);
  },
};

export default mediaService;