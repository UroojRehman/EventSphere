import api from "./api";

const faqService = {
  getPublished: () => api.get("/faqs"),
};

export default faqService;
