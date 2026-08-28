import api from "./api";

const feedbackService = {
  submitFeedback: async (feedbackData) => {
    return await api.post("/feedback", feedbackData);
  },

  getMyFeedback: async () => {
    return await api.get("/feedback/my");
  },

  getEventFeedback: async (eventId) => {
    return await api.get(`/feedback/event/${eventId}`);
  },

  getPublicEventFeedback: async (eventId) => {
    return await api.get(`/feedback/public/event/${eventId}`);
  },

  getAllFeedback: async () => {
    return await api.get("/feedback");
  },

  getOrganizerFeedback: async () => {
    return await api.get("/feedback/organizer/my");
  },

  getFeedbackById: async (id) => {
    return await api.get(`/feedback/${id}`);
  },

  updateFeedback: async (id, data) => {
    return await api.put(`/feedback/${id}`, data);
  },

  deleteFeedback: async (id) => {
    return await api.delete(`/feedback/${id}`);
  },
};

export default feedbackService;