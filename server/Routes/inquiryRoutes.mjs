import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";
import { createInquiry, getOrganizerInquiries, replyToInquiry, contactParticipant } from "../Controller/inquiryController.mjs";

const inquiryRoutes = express.Router();
inquiryRoutes.post("/", authMiddleware, roleMiddleware("participant"), createInquiry);
inquiryRoutes.get("/organizer", authMiddleware, roleMiddleware("organizer"), getOrganizerInquiries);
inquiryRoutes.post("/organizer/contact", authMiddleware, roleMiddleware("organizer"), contactParticipant);
inquiryRoutes.patch("/:id/reply", authMiddleware, roleMiddleware("organizer"), replyToInquiry);
export default inquiryRoutes;
