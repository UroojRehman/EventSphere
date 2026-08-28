import express from "express";
import {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from "../Controller/announcementController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const announcementRoutes = express.Router();

announcementRoutes.get("/", getAnnouncements);
announcementRoutes.post("/", authMiddleware, roleMiddleware("organizer", "admin"), createAnnouncement);
announcementRoutes.put("/:id", authMiddleware, roleMiddleware("admin"), updateAnnouncement);
announcementRoutes.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteAnnouncement);

export default announcementRoutes;
