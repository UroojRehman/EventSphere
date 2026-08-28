import api from "./api";
import heroImage from "../assets/images/hero.jpg";
import artsImage from "../assets/images/arts.jpg";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api\/?$/, "");
const fallbackImages = {
  Technical: heroImage,
  Sports: heroImage,
  Cultural: artsImage,
  Workshop: heroImage,
  Seminar: artsImage,
};

const normalizeImage = (image, category) => {
  if (!image) return fallbackImages[category] || heroImage;
  if (image.startsWith("/")) return `${API_ORIGIN}${image}`;
  if (image.includes("via.placeholder.com")) return fallbackImages[category] || heroImage;
  return image;
};

const normalizeEvent = (event) => ({
  ...event,
  title: event.title || event.eventName || event.name || "Untitled event",
  image: normalizeImage(event.image || event.banner, event.category),
});

const eventService = {
  getAllEvents: async (params = "") => {
    const query = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    const response = await api.get(`/events${query}`);
    return Array.isArray(response)
      ? response.map(normalizeEvent)
      : { ...response, events: (response.events || []).map(normalizeEvent) };
  },

  getAllEventsAdmin: async () => {
    const response = await api.get("/events/admin/all");
    return { ...response, events: (response.events || []).map(normalizeEvent) };
  },
  getAdminEventById: async (id) => normalizeEvent(await api.get(`/events/admin/${id}`)),

  getPendingEvents: async () => {
    const response = await api.get("/events/admin/pending");
    return { ...response, events: (response.events || []).map(normalizeEvent) };
  },

  getEventById: async (id) => {
    return normalizeEvent(await api.get(`/events/${id}`));
  },

  toggleBookmark: async (id) => {
    return await api.patch(`/events/${id}/bookmark`);
  },

  getMyBookmarks: async () => {
    const response = await api.get("/events/bookmarks/my");
    return { ...response, events: (response.events || []).map(normalizeEvent) };
  },

  createEvent: async (eventData) => {
    return await api.post("/events", eventData);
  },

  updateEvent: async (id, eventData) => {
    return await api.put(`/events/${id}`, eventData);
  },

  deleteEvent: async (id) => {
    return await api.delete(`/events/${id}`);
  },

  getMyEvents: async () => {
    const response = await api.get("/events/organizer/my");
    return { ...response, events: (response.events || []).map(normalizeEvent) };
  },

  getOrganizerEventById: async (id) => {
    return normalizeEvent(await api.get(`/events/organizer/${id}`));
  },

  getUpcomingEvents: async () => {
    const response = await api.get("/events/upcoming");
    return {
      ...response,
      events: (response.events || []).map(normalizeEvent),
    };
  },

  getPublicStats: async () => {
    return await api.get("/public/stats");
  },

  getFeaturedEvents: async () => {
    return await api.get("/events/featured");
  },

  searchEvents: async (query) => {
    return await api.get(
      `/events/search?q=${encodeURIComponent(query)}`
    );
  },

  approveEvent: async (id) => {
    return await api.put(`/events/${id}/approve`);
  },

  rejectEvent: async (id, reason) => {
    return await api.put(`/events/${id}/reject`, {
      comment: reason,
    });
  },

  requestEventChanges: async (id, reason) => {
    return await api.put(`/events/${id}/request-changes`, { comment: reason });
  },

  updateAdminEvent: async (id, eventData) => api.put(`/events/admin/${id}`, eventData),
  deleteAdminEvent: async (id) => api.delete(`/events/admin/${id}`),
};

export default eventService;