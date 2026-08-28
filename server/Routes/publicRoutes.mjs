import express from "express";
import { createContactMessage, getPublicContact, getPublicStats } from "../Controller/publicController.mjs";

const publicRoutes = express.Router();

publicRoutes.get("/stats", getPublicStats);
publicRoutes.get("/contact", getPublicContact);
publicRoutes.post("/contact/messages", createContactMessage);

export default publicRoutes;
