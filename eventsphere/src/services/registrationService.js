import api from "./api";

const registrationService = {
  registerForEvent: async (eventId) => {
    return await api.post("/registrations", {
      eventId,
    });
  },

  cancelRegistration: async (registrationId) => {
    return await api.patch(`/registrations/${registrationId}/cancel`);
  },

  getMyRegistrations: async () => {
    return await api.get("/registrations/my");
  },

  getAllRegistrationsAdmin: async () => {
    return await api.get("/registrations");
  },

  getRegistrationById: async (id) => {
    return await api.get(`/registrations/${id}`);
  },

  getEventRegistrations: async (eventId) => {
    return await api.get(`/registrations/event/${eventId}`);
  },

  updateRegistrationStatus: async (id, status) => {
    return await api.patch(`/registrations/${id}/status`, {
      status,
    });
  },

  requestCertificateFee: async (id, amount) => {
    return await api.post(`/registrations/${id}/certificate-fee/request`, { amount });
  },

  submitCertificatePaymentProof: async (id, file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("paymentProof", file);
    const response = await fetch(`http://localhost:3000/api/registrations/${id}/certificate-fee/proof`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Payment proof upload failed");
    return data;
  },

  reviewCertificatePayment: async (id, approved) => {
    return await api.patch(`/registrations/${id}/certificate-fee/review`, { approved });
  },

  checkRegistration: async (eventId) => {
    return await api.get(
      `/registrations/check/${eventId}`
    );
  },

  contactParticipant: async (registrationId, message) => {
    return await api.post(`/inquiries/organizer/contact`, { registrationId, message });
  },
};

export default registrationService;