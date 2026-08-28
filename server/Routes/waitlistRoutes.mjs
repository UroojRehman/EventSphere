import express from "express";

import {
    joinWaitlist,
    getMyWaitlist,
    getWaitlistById,
    leaveWaitlist,
    getEventWaitlist,
    promoteNextParticipant,
    getAllWaitlists,
    adminDeleteWaitlist
} from "../Controller/waitlistController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";

import { roleMiddleware } from "../middleware/roleMiddleware.mjs";


const waitlistRoutes = express.Router();


// ======================================================
// PARTICIPANT
// ======================================================

waitlistRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyWaitlist
);

waitlistRoutes.post(
    "/:eventId",
    authMiddleware,
    roleMiddleware("participant"),
    joinWaitlist
);

waitlistRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware("participant"),
    getWaitlistById
);

waitlistRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("participant"),
    leaveWaitlist
);


// ======================================================
// ORGANIZER
// ======================================================

waitlistRoutes.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware("organizer"),
    getEventWaitlist
);

waitlistRoutes.post(
    "/event/:eventId/promote",
    authMiddleware,
    roleMiddleware("organizer"),
    promoteNextParticipant
);


// ======================================================
// ADMIN
// ======================================================

waitlistRoutes.get(
    "/admin/all",
    authMiddleware,
    roleMiddleware("admin"),
    getAllWaitlists
);

waitlistRoutes.delete(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    adminDeleteWaitlist
);


export default waitlistRoutes;