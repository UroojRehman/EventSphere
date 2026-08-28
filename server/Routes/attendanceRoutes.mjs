import express from "express";

import {
    markAttendance,
    getMyAttendance,
    getAttendanceById,
    getEventAttendance,
    getAllAttendance,
    updateAttendance
} from "../Controller/attendanceController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";

import { roleMiddleware } from "../middleware/roleMiddleware.mjs";


const attendanceRoutes = express.Router();


// ======================================================
// PARTICIPANT
// ======================================================


// MY ATTENDANCE
// GET /api/attendance/my

attendanceRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyAttendance
);



// ======================================================
// ORGANIZER
// ======================================================


// MARK ATTENDANCE
// PATCH /api/attendance/:registrationId (registration id or participant check-in token)

attendanceRoutes.patch(
    "/:registrationId",
    authMiddleware,
    roleMiddleware("organizer"),
    markAttendance
);


// GET EVENT ATTENDANCE
// GET /api/attendance/event/:eventId

attendanceRoutes.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware("organizer"),
    getEventAttendance
);



// ======================================================
// ADMIN
// ======================================================


// GET ALL ATTENDANCE
// GET /api/attendance

attendanceRoutes.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllAttendance
);


// UPDATE ATTENDANCE
// PATCH /api/attendance/:id

attendanceRoutes.patch(
    "/admin/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateAttendance
);



// ======================================================
// PARTICIPANT + ORGANIZER + ADMIN
// ======================================================


// ATTENDANCE DETAIL
// GET /api/attendance/:id

attendanceRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getAttendanceById
);


export default attendanceRoutes;