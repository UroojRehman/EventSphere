import express from "express";
import { exportReports, getReportData, getAdminContact, getAdminDashboard, getContactMessages, updateAdminContact } from "../Controller/adminController.mjs";
import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const adminRoutes = express.Router();

adminRoutes.get("/dashboard", authMiddleware, roleMiddleware("admin"), getAdminDashboard);
adminRoutes.get("/contact", authMiddleware, roleMiddleware("admin"), getAdminContact);
adminRoutes.put("/contact", authMiddleware, roleMiddleware("admin"), updateAdminContact);
adminRoutes.get("/contact/messages", authMiddleware, roleMiddleware("admin"), getContactMessages);
adminRoutes.get("/reports/export", authMiddleware, roleMiddleware("admin"), exportReports);
adminRoutes.get("/reports/data", authMiddleware, roleMiddleware("admin"), getReportData);

export default adminRoutes;
