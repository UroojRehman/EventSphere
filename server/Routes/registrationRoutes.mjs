import express from "express";

import {
    registerForEvent,
    getMyRegistrations,
    getRegistrationById,
    cancelRegistration,
    getEventRegistrations,
    updateRegistrationStatus,
    getAllRegistrations,
    requestCertificateFee,
    submitCertificatePaymentProof,
    reviewCertificatePayment
} from "../Controller/registrationController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";

import { roleMiddleware } from "../middleware/roleMiddleware.mjs";
import paymentUpload from "../middleware/paymentUploadMiddleware.mjs";


const registrationRoutes = express.Router();


// ======================================================
// PARTICIPANT
// ======================================================


// REGISTER FOR EVENT
// POST /api/registrations

registrationRoutes.post(
    "/",
    authMiddleware,
    roleMiddleware("participant"),
    registerForEvent
);


// MY REGISTRATIONS
// GET /api/registrations/my

registrationRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyRegistrations
);


// CANCEL REGISTRATION
// PATCH /api/registrations/:id/cancel

registrationRoutes.patch(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("participant"),
    cancelRegistration
);



// ======================================================
// ORGANIZER
// ======================================================


// GET EVENT REGISTRATIONS
// GET /api/registrations/event/:eventId

registrationRoutes.get(
    "/event/:eventId",
    authMiddleware,
    roleMiddleware("organizer"),
    getEventRegistrations
);



// ======================================================
// ADMIN
// ======================================================


// GET ALL REGISTRATIONS
// GET /api/registrations

registrationRoutes.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllRegistrations
);



// ======================================================
// ORGANIZER + ADMIN
// ======================================================


// UPDATE REGISTRATION STATUS
// PATCH /api/registrations/:id/status

registrationRoutes.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("organizer", "admin"),
    updateRegistrationStatus
);

registrationRoutes.post(
    "/:id/certificate-fee/request",
    authMiddleware,
    roleMiddleware("organizer"),
    requestCertificateFee
);

registrationRoutes.post(
    "/:id/certificate-fee/proof",
    authMiddleware,
    roleMiddleware("participant"),
    paymentUpload.single("paymentProof"),
    submitCertificatePaymentProof
);

registrationRoutes.patch(
    "/:id/certificate-fee/review",
    authMiddleware,
    roleMiddleware("organizer"),
    reviewCertificatePayment
);



// ======================================================
// PARTICIPANT + ORGANIZER + ADMIN
// ======================================================


// REGISTRATION DETAIL
// GET /api/registrations/:id

registrationRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getRegistrationById
);


export default registrationRoutes;