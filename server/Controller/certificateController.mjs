import certificate from "../Model/certificate.mjs";
import attendance from "../Model/attendance.mjs";
import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import user from "../Model/user.mjs";

import {
    generateCertificateNumber,
    generateCertificatePDF
} from "../utils/generateCertificate.mjs";

import path from "path";
import fs from "fs";


// ======================================================
// ORGANIZER - ISSUE CERTIFICATE
// POST /api/certificates
// ======================================================

export const issueCertificate = async (req, res) => {
    try {

        const {
            eventId,
            participantId
        } = req.body;

        if (!eventId || !participantId) {
            return res.status(400).send({
                message: "Event ID and participant ID are required"
            });
        }

        const foundEvent = await event.findOne({
            _id: eventId,
            organizer: req.user.userId
        });

        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found or you are not the organizer"
            });
        }

        const foundParticipant = await user.findById(
            participantId
        );

        if (!foundParticipant) {
            return res.status(404).send({
                message: "Participant not found"
            });
        }

        const foundRegistration = await registration.findOne({
            event: eventId,
            participant: participantId,
            status: "confirmed"
        });

        if (!foundRegistration) {
            return res.status(404).send({
                message: "Confirmed registration not found"
            });
        }
        if (!foundRegistration.certificateFeePaid && foundRegistration.certificatePaymentStatus !== "approved") {
            return res.status(400).send({ message: "Payment must be approved before issuing the certificate" });
        }

        const foundAttendance = await attendance.findOne({
            event: eventId,
            participant: participantId,
            attended: true
        });

        if (!foundAttendance) {
            return res.status(400).send({
                message:
                    "Certificate can only be issued to participants who attended the event"
            });
        }

        const existingCertificate = await certificate.findOne({
            event: eventId,
            participant: participantId
        });

        if (existingCertificate) {
            return res.status(409).send({
                message: "Certificate has already been issued",
                certificate: existingCertificate
            });
        }

        const certificateNumber =
            generateCertificateNumber();

        const issuedOn = new Date();

        const pdf = await generateCertificatePDF({
            certificateNumber,
            participantName: foundParticipant.name,
            eventTitle: foundEvent.title,
            eventDate: foundEvent.date,
            issuedOn
        });

        const certificateUrl =
            `/uploads/certificates/${pdf.fileName}`;

        const newCertificate = new certificate({
            event: eventId,
            participant: participantId,
            attendance: foundAttendance._id,
            certificateUrl,
            certificateNumber,
            issuedBy: req.user.userId,
            issuedOn
        });

        await newCertificate.save();

        const populatedCertificate =
            await certificate
                .findById(newCertificate._id)
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .populate(
                    "event",
                    "title category eventType department venue date"
                )
                .populate(
                    "attendance",
                    "attended markedOn"
                )
                .populate(
                    "issuedBy",
                    "name email username"
                );

        res.status(201).send({
            message: "Certificate issued successfully",
            certificate: populatedCertificate
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({
                message:
                    "Certificate already exists for this participant and event"
            });
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - MY CERTIFICATES
// GET /api/certificates/my
// ======================================================

export const getMyCertificates = async (req, res) => {
    try {

        const certificates =
            await certificate
                .find({
                    participant: req.user.userId
                })
                .populate(
                    "event",
                    "title category eventType department venue date"
                )
                .populate(
                    "attendance",
                    "attended markedOn"
                )
                .populate(
                    "issuedBy",
                    "name email username"
                )
                .sort({
                    issuedOn: -1
                });

        res.status(200).send({
            count: certificates.length,
            certificates
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT / ORGANIZER / ADMIN
// CERTIFICATE DETAIL
// GET /api/certificates/:id
// ======================================================

export const getCertificateById = async (req, res) => {
    try {

        const foundCertificate =
            await certificate
                .findById(req.params.id)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate({
                    path: "event",
                    select:
                        "title category eventType department venue date organizer",
                    populate: {
                        path: "organizer",
                        select:
                            "name email username"
                    }
                })
                .populate(
                    "attendance",
                    "attended markedOn"
                )
                .populate(
                    "issuedBy",
                    "name email username"
                );

        if (!foundCertificate) {
            return res.status(404).send({
                message: "Certificate not found"
            });
        }

        if (req.user.role === "participant") {

            if (
                foundCertificate.participant._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view your own certificate"
                });
            }
        }

        if (req.user.role === "organizer") {

            if (
                foundCertificate.event.organizer._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view certificates for your own events"
                });
            }
        }

        res.status(200).send({
            certificate: foundCertificate
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT / ORGANIZER / ADMIN
// DOWNLOAD CERTIFICATE PDF
// GET /api/certificates/:id/download
// ======================================================

export const downloadCertificate = async (req, res) => {
    try {

        const foundCertificate =
            await certificate
                .findById(req.params.id)
                .populate({
                    path: "event",
                    select: "title organizer",
                    populate: {
                        path: "organizer",
                        select: "name email username"
                    }
                })
                .populate(
                    "participant",
                    "name email username"
                );

        if (!foundCertificate) {
            return res.status(404).send({
                message: "Certificate not found"
            });
        }

        if (req.user.role === "participant") {

            if (
                foundCertificate.participant._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only download your own certificate"
                });
            }
        }

        if (req.user.role === "organizer") {

            if (
                foundCertificate.event.organizer._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only download certificates for your own events"
                });
            }
        }

        if (!foundCertificate.certificateUrl) {
            return res.status(404).send({
                message: "Certificate PDF not found"
            });
        }

        const relativePath =
            foundCertificate.certificateUrl.replace(
                /^\/+/,
                ""
            );

        const filePath = path.join(
            process.cwd(),
            relativePath
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).send({
                message: "Certificate PDF file not found on server"
            });
        }

        res.download(
            filePath,
            `Certificate-${foundCertificate.certificateNumber}.pdf`
        );

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET ALL CERTIFICATES
// GET /api/certificates
// ======================================================

export const getAllCertificates = async (req, res) => {
    try {

        const {
            eventId,
            participantId
        } = req.query;

        const filter = {};

        if (eventId) {
            filter.event = eventId;
        }

        if (participantId) {
            filter.participant = participantId;
        }

        const certificates =
            await certificate
                .find(filter)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    "event",
                    "title category eventType department venue date"
                )
                .populate(
                    "attendance",
                    "attended markedOn"
                )
                .populate(
                    "issuedBy",
                    "name email username"
                )
                .sort({
                    issuedOn: -1
                });

        res.status(200).send({
            count: certificates.length,
            certificates
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - DELETE CERTIFICATE
// DELETE /api/certificates/:id
// ======================================================

export const deleteCertificate = async (req, res) => {
    try {

        const foundCertificate =
            await certificate.findById(
                req.params.id
            );

        if (!foundCertificate) {
            return res.status(404).send({
                message: "Certificate not found"
            });
        }

        await certificate.findByIdAndDelete(
            req.params.id
        );

        res.status(200).send({
            message: "Certificate deleted successfully"
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

export const getOrganizerCertificates = async (req, res) => {
    try {
        const events = await event.find({ organizer: req.user.userId }).select("_id");
        const certificates = await certificate.find({ event: { $in: events.map((item) => item._id) } })
            .populate("participant", "name email username")
            .populate("event", "title category date")
            .sort({ issuedOn: -1 });
        res.status(200).send({ count: certificates.length, certificates });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const uploadPersonalizedCertificate = async (req, res) => {
    try {
        const { eventId, participantId } = req.body;
        if (!eventId || !participantId || !req.file) {
            return res.status(400).send({ message: "Event, participant and PDF certificate are required" });
        }

        const foundEvent = await event.findOne({ _id: eventId, organizer: req.user.userId });
        if (!foundEvent) return res.status(404).send({ message: "Event not found or you are not the organizer" });

        const foundRegistration = await registration.findOne({
            event: eventId,
            participant: participantId,
            status: "confirmed"
        });
        if (!foundRegistration) return res.status(404).send({ message: "Confirmed registration not found" });
        if (!foundRegistration.certificateFeePaid && foundRegistration.certificatePaymentStatus !== "approved") return res.status(400).send({ message: "Payment must be approved before uploading the certificate" });

        const foundAttendance = await attendance.findOne({ event: eventId, participant: participantId, attended: true });
        if (!foundAttendance) return res.status(400).send({ message: "Participant must attend the event first" });

        const existingCertificate = await certificate.findOne({ event: eventId, participant: participantId });
        if (existingCertificate) return res.status(409).send({ message: "Certificate has already been issued", certificate: existingCertificate });

        const created = await certificate.create({
            event: eventId,
            participant: participantId,
            attendance: foundAttendance._id,
            certificateUrl: `/uploads/certificates/${req.file.filename}`,
            certificateNumber: generateCertificateNumber(),
            issuedBy: req.user.userId
        });

        res.status(201).send({ message: "Personalized certificate uploaded successfully", certificate: created });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};