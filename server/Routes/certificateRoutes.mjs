import express from "express";

import {
    issueCertificate,
    getMyCertificates,
    getCertificateById,
    downloadCertificate,
    getAllCertificates,
    getOrganizerCertificates,
    uploadPersonalizedCertificate,
    deleteCertificate
} from "../Controller/certificateController.mjs";

import { authMiddleware } from "../middleware/authMiddleware.mjs";
import { roleMiddleware } from "../middleware/roleMiddleware.mjs";
import certificateUpload from "../middleware/certificateUploadMiddleware.mjs";

const certificateRoutes = express.Router();

certificateRoutes.get(
    "/my",
    authMiddleware,
    roleMiddleware("participant"),
    getMyCertificates
);

certificateRoutes.post(
    "/",
    authMiddleware,
    roleMiddleware("organizer"),
    issueCertificate
);

certificateRoutes.post(
    "/personalized",
    authMiddleware,
    roleMiddleware("organizer"),
    certificateUpload.single("certificate"),
    uploadPersonalizedCertificate
);

certificateRoutes.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllCertificates
);

certificateRoutes.get(
    "/organizer/my",
    authMiddleware,
    roleMiddleware("organizer"),
    getOrganizerCertificates
);

certificateRoutes.get(
    "/:id/download",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    downloadCertificate
);

certificateRoutes.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        "participant",
        "organizer",
        "admin"
    ),
    getCertificateById
);

certificateRoutes.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteCertificate
);

export default certificateRoutes;