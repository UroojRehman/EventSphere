import api from "./api";

const certificateService = {
  getMyCertificates: async () => {
    return await api.get("/certificates/my");
  },

  getOrganizerCertificates: async () => {
    return await api.get("/certificates/organizer/my");
  },

  getCertificateById: async (id) => {
    return await api.get(`/certificates/${id}`);
  },

  generateCertificate: async (eventId, participantId) => {
    return await api.post("/certificates", {
      eventId,
      participantId,
    });
  },

  uploadPersonalizedCertificate: async (file, eventId, participantId) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("certificate", file);
    formData.append("eventId", eventId);
    formData.append("participantId", participantId);
    const response = await fetch("http://localhost:3000/api/certificates/personalized", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Personalized certificate upload failed");
    return data;
  },

  generateEventCertificates: async (eventId) => {
    return await api.post(
      `/certificates/event/${eventId}`
    );
  },

  verifyCertificate: async (certificateId) => {
    return await api.get(
      `/certificates/verify/${certificateId}`
    );
  },

  deleteCertificate: async (id) => {
    return await api.delete(`/certificates/${id}`);
  },
};

export default certificateService;