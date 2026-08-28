import express from "express";

import {
    createEvent,
    getEvents,
    getEventById,
    getUpcomingEvents,
    getPastEvents,
    getMyEvents,
    getOrganizerEventById,
    updateEvent,
    deleteEvent,
    getAllEventsAdmin,
    getAdminEventById,
    getPendingEvents,
    approveEvent,
    rejectEvent,
    requestEventChanges,
    adminUpdateEvent,
    adminDeleteEvent,
    toggleBookmark,
    getMyBookmarks
} from "../Controller/eventController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";

const eventRoutes = express.Router();


// ======================================================
// PUBLIC
// ======================================================

eventRoutes.get(
    "/upcoming",
    getUpcomingEvents
);

eventRoutes.get(
    "/past",
    getPastEvents
);

eventRoutes.get(
    "/",
    getEvents
);

eventRoutes.get(
    "/bookmarks/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyBookmarks
);

eventRoutes.patch(
    "/:id/bookmark",
    authMiddleware,
    roleMiddleware("participant"),
    toggleBookmark
);


// ======================================================
// ORGANIZER
// ======================================================

eventRoutes.post(
    "/",
    authMiddleware,
    roleMiddleware("organizer"),
    createEvent
);

eventRoutes.get(
    "/organizer/my",
    authMiddleware,
    roleMiddleware("organizer"),
    getMyEvents
);

eventRoutes.get(
    "/organizer/:id",
    authMiddleware,
    roleMiddleware("organizer"),
    getOrganizerEventById
);

eventRoutes.put(
    "/:id",
    authMiddleware,
    roleMiddleware("organizer"),
    updateEvent
);

eventRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("organizer"),
    deleteEvent
);


// ======================================================
// ADMIN
// ======================================================

eventRoutes.get(
    "/admin/all",
    authMiddleware,
    roleMiddleware("admin"),
    getAllEventsAdmin
);

eventRoutes.get(
    "/admin/pending",
    authMiddleware,
    roleMiddleware("admin"),
    getPendingEvents
);

eventRoutes.get(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminEventById
);

eventRoutes.put(
    "/:id/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveEvent
);

eventRoutes.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectEvent
);

eventRoutes.put(
    "/:id/request-changes",
    authMiddleware,
    roleMiddleware("admin"),
    requestEventChanges
);

eventRoutes.put(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    adminUpdateEvent
);

eventRoutes.delete(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    adminDeleteEvent
);


// ======================================================
// PUBLIC - SINGLE EVENT
// IMPORTANT: Keep this AFTER all static routes
// ======================================================

eventRoutes.get(
    "/:id",
    getEventById
);


export default eventRoutes;