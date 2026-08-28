import express from "express";

import {
    uploadMedia,
    getMedia,
    getMediaByEvent,
    getMyMedia,
    deleteMedia,
    getAllMediaAdmin,
    getPendingMedia,
    approveMedia,
    rejectMedia,
    saveMedia,
    removeSavedMedia,
    getMySavedMedia,
    adminDeleteMedia
} from "../Controller/mediaController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";

import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

import upload from "../middleware/uploadMiddleware.mjs";


const mediaRoutes = express.Router();


// ======================================================
// PUBLIC
// ======================================================

mediaRoutes.get(
    "/",
    getMedia
);

mediaRoutes.get(
    "/event/:eventId",
    getMediaByEvent
);


// ======================================================
// PARTICIPANT
// ======================================================

mediaRoutes.get(
    "/saved/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMySavedMedia
);

mediaRoutes.post(
    "/:id/save",
    authMiddleware,
    roleMiddleware("participant"),
    saveMedia
);

mediaRoutes.delete(
    "/:id/save",
    authMiddleware,
    roleMiddleware("participant"),
    removeSavedMedia
);


// ======================================================
// ORGANIZER
// ======================================================

mediaRoutes.post(
    "/upload",
    authMiddleware,
    roleMiddleware("organizer", "admin"),
    upload.single("media"),
    uploadMedia
);

mediaRoutes.get(
    "/organizer/my",
    authMiddleware,
    roleMiddleware("organizer"),
    getMyMedia
);

mediaRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("organizer"),
    deleteMedia
);


// ======================================================
// ADMIN
// ======================================================

mediaRoutes.get(
    "/admin/all",
    authMiddleware,
    roleMiddleware("admin"),
    getAllMediaAdmin
);

mediaRoutes.get(
    "/admin/pending",
    authMiddleware,
    roleMiddleware("admin"),
    getPendingMedia
);

mediaRoutes.put(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveMedia
);

mediaRoutes.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectMedia
);

mediaRoutes.delete(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    adminDeleteMedia
);


export default mediaRoutes;