import api from "./api";

const contactService = {
  getPublic: () => api.get("/public/contact"),
  getAdmin: () => api.get("/admin/contact"),
  update: (settings) => api.put("/admin/contact", settings),
  getMessages: () => api.get("/admin/contact/messages"),
  sendMessage: (message) => api.post("/public/contact/messages", message),
};

export default contactService;
