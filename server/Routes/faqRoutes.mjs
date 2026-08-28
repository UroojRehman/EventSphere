import express from "express";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../Controller/faqController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const faqRoutes = express.Router();

faqRoutes.get("/", getFaqs);
faqRoutes.post("/", authMiddleware, roleMiddleware("admin"), createFaq);
faqRoutes.put("/:id", authMiddleware, roleMiddleware("admin"), updateFaq);
faqRoutes.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteFaq);

export default faqRoutes;
