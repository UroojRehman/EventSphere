import express from "express";

import {
    getMyNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
} from "../Controller/notificationController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";


const notificationRoutes = express.Router();


// ======================================================
// AUTHENTICATED USERS
// PARTICIPANT / ORGANIZER / ADMIN
// ======================================================

notificationRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getMyNotifications
);


notificationRoutes.get(
    "/unread",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getUnreadNotifications
);


notificationRoutes.get(
    "/unread-count",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getUnreadCount
);


notificationRoutes.patch(
    "/read-all",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    markAllAsRead
);


notificationRoutes.delete(
    "/read",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    deleteReadNotifications
);


notificationRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getNotificationById
);


notificationRoutes.patch(
    "/:id/read",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    markAsRead
);


notificationRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    deleteNotification
);


export default notificationRoutes;