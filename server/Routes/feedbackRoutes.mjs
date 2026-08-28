import express from "express";

import {
    submitFeedback,
    getMyFeedback,
    getFeedbackById,
    getEventFeedback,
    getOrganizerFeedback,
    getPublicEventFeedback,
    getAllFeedback,
    deleteFeedback
} from "../Controller/feedbackController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const feedbackRoutes = express.Router();

feedbackRoutes.get("/public/event/:eventId", getPublicEventFeedback);


// ======================================================
// PARTICIPANT
// ======================================================

feedbackRoutes.post(
    "/",
    authMiddleware,
    roleMiddleware("participant"),
    submitFeedback
);

feedbackRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyFeedback
);


// ======================================================
// ORGANIZER
// ======================================================

feedbackRoutes.get(
    "/organizer/my",
    authMiddleware,
    roleMiddleware("organizer"),
    getOrganizerFeedback
);

feedbackRoutes.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware("organizer"),
    getEventFeedback
);


// ======================================================
// ADMIN
// ======================================================

feedbackRoutes.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllFeedback
);

feedbackRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteFeedback
);


// ======================================================
// PARTICIPANT + ORGANIZER + ADMIN
// ======================================================

feedbackRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getFeedbackById
);


export default feedbackRoutes;