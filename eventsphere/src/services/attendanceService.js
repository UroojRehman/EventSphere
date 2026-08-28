import api from "./api";

const attendanceService = {
  markAttendance: async (eventId, registrationId, attended = true) => {
    return await api.patch(`/attendance/${registrationId}`, {
      attended,
    });
  },

  getEventAttendance: async (eventId) => {
    return await api.get(`/attendance/event/${eventId}`);
  },

  getMyAttendance: async () => {
    return await api.get("/attendance/my");
  },

  getAllAttendanceAdmin: async () => {
    return await api.get("/attendance");
  },

  updateAttendance: async (id, status) => {
    return await api.patch(`/attendance/admin/${id}`, {
      attended: status === "attended" || status === true,
    });
  },

  deleteAttendance: async (id) => {
    return await api.delete(`/attendance/${id}`);
  },
};

export default attendanceService;