import registration from "../Model/registration.mjs";
import event from "../Model/event.mjs";
import user from "../Model/user.mjs";
import certificate from "../Model/certificate.mjs";
import attendance from "../Model/attendance.mjs";
import { createNotification } from "../utils/notificationHelper.mjs";
import { generateCertificateNumber, generateCertificatePDF } from "../utils/generateCertificate.mjs";
import crypto from "crypto";


// ======================================================
// PARTICIPANT - REGISTER FOR EVENT
// POST /api/registrations
// ======================================================

export const registerForEvent = async (req, res) => {
    try {

        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).send({
                message: "Event ID is required"
            });
        }


        // ------------------------------------------------
        // FIND EVENT
        // ------------------------------------------------

        const foundEvent = await event.findById(eventId);

        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found"
            });
        }


        // ------------------------------------------------
        // EVENT MUST BE APPROVED
        // ------------------------------------------------

        if (foundEvent.status !== "approved") {
            return res.status(400).send({
                message: "Registration is not available for this event"
            });
        }

        const participant = await user.findById(req.user.userId).select("department");
        if (foundEvent.department && participant?.department && foundEvent.department !== participant.department) {
            return res.status(403).send({
                message: "You are not eligible for this event"
            });
        }


        // ------------------------------------------------
        // REGISTRATION DEADLINE
        // ------------------------------------------------

        if (new Date() > new Date(foundEvent.registrationDeadline)) {
            return res.status(400).send({
                message: "Registration deadline has passed"
            });
        }


        // ------------------------------------------------
        // EVENT DATE CHECK
        // ------------------------------------------------

        if (new Date(foundEvent.date) <= new Date()) {
            return res.status(400).send({
                message: "This event has already started or ended"
            });
        }


        // ------------------------------------------------
        // CHECK DUPLICATE REGISTRATION
        // ------------------------------------------------

        const existingRegistration = await registration.findOne({
            event: eventId,
            participant: req.user.userId
        });

        if (existingRegistration) {
            return res.status(409).send({
                message: "You have already registered for this event",
                status: existingRegistration.status
            });
        }


        // ==================================================
        // CONFIRMED REGISTRATION
        // ==================================================

        if (
            foundEvent.seatsBooked <
            foundEvent.maxParticipants
        ) {

            const newRegistration = new registration({
                event: eventId,
                participant: req.user.userId,
                status: "confirmed",
                checkInToken: crypto.randomUUID()
            });

            await newRegistration.save();


            // Increase booked seats
            foundEvent.seatsBooked =
                foundEvent.seatsBooked + 1;

            await foundEvent.save();


            // ------------------------------------------------
            // NOTIFICATION - REGISTRATION CONFIRMED
            // ------------------------------------------------

            await createNotification({
                recipient: req.user.userId,
                type: "registration_confirmed",
                message: `Your registration for "${foundEvent.title}" has been confirmed.`,
                event: foundEvent._id
            });


            const populatedRegistration =
                await registration
                    .findById(newRegistration._id)
                    .populate(
                        "participant",
                        "name email username contactNumber role"
                    )
                    .populate(
                        "event",
                        "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                    );


            return res.status(201).send({
                message: "Event registration successful",
                registration: populatedRegistration
            });
        }


        // ==================================================
        // EVENT FULL - WAITLIST
        // ==================================================

        const waitlistCount =
            await registration.countDocuments({
                event: eventId,
                status: "waitlist"
            });


        const newRegistration = new registration({
            event: eventId,
            participant: req.user.userId,
            status: "waitlist",
            waitlistPosition: waitlistCount + 1,
            checkInToken: crypto.randomUUID()
        });

        await newRegistration.save();


        // ------------------------------------------------
        // NOTIFICATION - WAITLIST
        // ------------------------------------------------

        await createNotification({
            recipient: req.user.userId,
            type: "registration_waitlist",
            message: `The event "${foundEvent.title}" is currently full. You have been added to the waitlist at position ${waitlistCount + 1}.`,
            event: foundEvent._id
        });


        const populatedRegistration =
            await registration
                .findById(newRegistration._id)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                );


        return res.status(201).send({
            message: "Event is full. You have been added to the waitlist",
            registration: populatedRegistration
        });


    } catch (error) {

        // Duplicate key error
        if (error.code === 11000) {
            return res.status(409).send({
                message: "You have already registered for this event"
            });
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// PARTICIPANT - MY REGISTRATIONS
// GET /api/registrations/my
// ======================================================

export const getMyRegistrations = async (req, res) => {
    try {

        const registrations =
            await registration
                .find({
                    participant: req.user.userId
                })
                .populate(
                    "event",
                    "title category eventType department description venue date time maxParticipants seatsBooked registrationDeadline status banner rulebook organizer"
                )
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).send({
            count: registrations.length,
            registrations
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// GET REGISTRATION DETAIL
// Participant / Organizer / Admin
// GET /api/registrations/:id
// ======================================================

export const getRegistrationById = async (req, res) => {
    try {

        const foundRegistration =
            await registration
                .findById(req.params.id)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate({
                    path: "event",
                    select:
                        "title category eventType department description venue date time maxParticipants seatsBooked registrationDeadline status organizer",
                    populate: {
                        path: "organizer",
                        select: "name email username"
                    }
                });


        if (!foundRegistration) {
            return res.status(404).send({
                message: "Registration not found"
            });
        }


        // ------------------------------------------------
        // PARTICIPANT
        // ------------------------------------------------

        if (req.user.role === "participant") {

            if (
                foundRegistration.participant._id.toString() !==
                req.user.userId.toString()
            ) {

                return res.status(403).send({
                    message:
                        "You can only view your own registration"
                });
            }
        }


        // ------------------------------------------------
        // ORGANIZER
        // ------------------------------------------------

        if (req.user.role === "organizer") {

            if (
                foundRegistration.event.organizer._id.toString() !==
                req.user.userId.toString()
            ) {

                return res.status(403).send({
                    message:
                        "You can only view registrations for your own events"
                });
            }
        }


        res.status(200).send({
            registration: foundRegistration
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// PARTICIPANT - CANCEL REGISTRATION
// PATCH /api/registrations/:id/cancel
// ======================================================

export const cancelRegistration = async (req, res) => {
    try {

        const foundRegistration =
            await registration.findById(req.params.id);


        if (!foundRegistration) {
            return res.status(404).send({
                message: "Registration not found"
            });
        }


        // ------------------------------------------------
        // CHECK OWNERSHIP
        // ------------------------------------------------

        if (
            foundRegistration.participant.toString() !==
            req.user.userId.toString()
        ) {

            return res.status(403).send({
                message:
                    "You can only cancel your own registration"
            });
        }


        // ------------------------------------------------
        // ALREADY CANCELLED
        // ------------------------------------------------

        if (foundRegistration.status === "cancelled") {
            return res.status(400).send({
                message: "Registration is already cancelled"
            });
        }


        // ------------------------------------------------
        // REJECTED REGISTRATION
        // ------------------------------------------------

        if (foundRegistration.status === "rejected") {
            return res.status(400).send({
                message:
                    "Rejected registration cannot be cancelled"
            });
        }


        const foundEvent =
            await event.findById(foundRegistration.event);


        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found"
            });
        }


        // ------------------------------------------------
        // CHECK CANCELLATION DEADLINE
        // ------------------------------------------------

        if (
            new Date() >=
            new Date(foundEvent.registrationDeadline)
        ) {

            return res.status(400).send({
                message:
                    "Registration can no longer be cancelled because the cancellation deadline has passed"
            });
        }


        const previousStatus =
            foundRegistration.status;


        // ------------------------------------------------
        // CANCEL REGISTRATION
        // ------------------------------------------------

        foundRegistration.status = "cancelled";
        foundRegistration.cancelledOn = new Date();

        foundRegistration.cancellationReason =
            req.body.reason ||
            "Cancelled by participant";

        foundRegistration.waitlistPosition = null;

        await foundRegistration.save();


        // ------------------------------------------------
        // NOTIFICATION - REGISTRATION CANCELLED
        // ------------------------------------------------

        await createNotification({
            recipient: req.user.userId,
            type: "registration_cancelled",
            message: `Your registration for "${foundEvent.title}" has been cancelled.`,
            event: foundEvent._id
        });


        // ==================================================
        // CONFIRMED REGISTRATION CANCELLED
        // ==================================================

        if (previousStatus === "confirmed") {

            if (foundEvent.seatsBooked > 0) {

                foundEvent.seatsBooked =
                    foundEvent.seatsBooked - 1;

                await foundEvent.save();
            }


            // ------------------------------------------------
            // PROMOTE FIRST WAITLISTED PARTICIPANT
            // ------------------------------------------------

            const nextWaitlisted =
                await registration
                    .findOne({
                        event: foundEvent._id,
                        status: "waitlist"
                    })
                    .sort({
                        waitlistPosition: 1,
                        createdAt: 1
                    });


            if (nextWaitlisted) {

                nextWaitlisted.status =
                    "confirmed";

                nextWaitlisted.waitlistPosition =
                    null;

                await nextWaitlisted.save();


                foundEvent.seatsBooked =
                    foundEvent.seatsBooked + 1;

                await foundEvent.save();


                // ------------------------------------------------
                // NOTIFICATION - WAITLIST PROMOTED
                // ------------------------------------------------

                await createNotification({
                    recipient: nextWaitlisted.participant,
                    type: "waitlist_promoted",
                    message: `Good news! You have been promoted from the waitlist and your registration for "${foundEvent.title}" is now confirmed.`,
                    event: foundEvent._id
                });


                // ------------------------------------------------
                // RE-CALCULATE WAITLIST POSITIONS
                // ------------------------------------------------

                const remainingWaitlist =
                    await registration
                        .find({
                            event: foundEvent._id,
                            status: "waitlist"
                        })
                        .sort({
                            waitlistPosition: 1,
                            createdAt: 1
                        });


                for (
                    let i = 0;
                    i < remainingWaitlist.length;
                    i++
                ) {

                    remainingWaitlist[i].waitlistPosition =
                        i + 1;

                    await remainingWaitlist[i].save();
                }
            }
        }


        res.status(200).send({
            message:
                "Registration cancelled successfully",
            registration: foundRegistration
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ORGANIZER - GET EVENT REGISTRATIONS
// GET /api/registrations/event/:eventId
// ======================================================

export const getEventRegistrations = async (req, res) => {
    try {

        const foundEvent =
            await event.findOne({
                _id: req.params.eventId,
                organizer: req.user.userId
            });


        if (!foundEvent) {
            return res.status(404).send({
                message:
                    "Event not found or you are not the organizer of this event"
            });
        }


        const registrations =
            await registration
                .find({
                    event: req.params.eventId
                })
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).send({
            event: {
                id: foundEvent._id,
                title: foundEvent.title,
                maxParticipants:
                    foundEvent.maxParticipants,
                seatsBooked:
                    foundEvent.seatsBooked,
                seatsAvailable:
                    foundEvent.maxParticipants -
                    foundEvent.seatsBooked
            },

            count: registrations.length,

            registrations
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ORGANIZER / ADMIN - UPDATE REGISTRATION STATUS
// PATCH /api/registrations/:id/status
// ======================================================

export const updateRegistrationStatus = async (req, res) => {
    try {

        const { status } = req.body;


        if (!status) {
            return res.status(400).send({
                message: "Status is required"
            });
        }


        const allowedStatuses = [
            "confirmed",
            "cancelled",
            "rejected"
        ];


        if (!allowedStatuses.includes(status)) {
            return res.status(400).send({
                message:
                    "Invalid status. Allowed values are confirmed, cancelled and rejected"
            });
        }


        const foundRegistration =
            await registration.findById(req.params.id);


        if (!foundRegistration) {
            return res.status(404).send({
                message: "Registration not found"
            });
        }


        const foundEvent =
            await event.findById(
                foundRegistration.event
            );


        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found"
            });
        }


        // ------------------------------------------------
        // ORGANIZER CAN ONLY MANAGE OWN EVENT
        // ------------------------------------------------

        if (req.user.role === "organizer") {

            if (
                foundEvent.organizer.toString() !==
                req.user.userId.toString()
            ) {

                return res.status(403).send({
                    message:
                        "You can only manage registrations for your own events"
                });
            }
        }


        const oldStatus =
            foundRegistration.status;


        // ------------------------------------------------
        // SAME STATUS
        // ------------------------------------------------

        if (oldStatus === status) {
            return res.status(400).send({
                message:
                    `Registration is already ${status}`
            });
        }


        // ==================================================
        // CONFIRMED
        // ==================================================

        if (status === "confirmed") {

            if (
                oldStatus !== "confirmed" &&
                foundEvent.seatsBooked >=
                foundEvent.maxParticipants
            ) {

                return res.status(400).send({
                    message:
                        "No seats available for confirmation"
                });
            }


            foundRegistration.status =
                "confirmed";

            foundRegistration.waitlistPosition =
                null;

            foundRegistration.cancelledOn =
                null;

            foundRegistration.cancellationReason =
                "";


            await foundRegistration.save();


            if (oldStatus !== "confirmed") {

                foundEvent.seatsBooked =
                    foundEvent.seatsBooked + 1;

                await foundEvent.save();
            }


            // ------------------------------------------------
            // NOTIFICATION - CONFIRMED
            // ------------------------------------------------

            await createNotification({
                recipient: foundRegistration.participant,
                type: "registration_confirmed",
                message: `Your registration for "${foundEvent.title}" has been confirmed.`,
                event: foundEvent._id
            });
        }


        // ==================================================
        // CANCELLED / REJECTED
        // ==================================================

        if (
            status === "cancelled" ||
            status === "rejected"
        ) {

            foundRegistration.status =
                status;

            foundRegistration.waitlistPosition =
                null;


            if (status === "cancelled") {

                foundRegistration.cancelledOn =
                    new Date();

                foundRegistration.cancellationReason =
                    req.body.reason ||
                    "Cancelled by organizer/admin";
            }


            await foundRegistration.save();


            // ------------------------------------------------
            // NOTIFICATION
            // ------------------------------------------------

            if (status === "cancelled") {

                await createNotification({
                    recipient: foundRegistration.participant,
                    type: "registration_cancelled",
                    message: `Your registration for "${foundEvent.title}" has been cancelled.`,
                    event: foundEvent._id
                });

            } else {

                await createNotification({
                    recipient: foundRegistration.participant,
                    type: "registration_rejected",
                    message: `Your registration for "${foundEvent.title}" has been rejected.`,
                    event: foundEvent._id
                });
            }


            // ------------------------------------------------
            // RELEASE CONFIRMED SEAT
            // ------------------------------------------------

            if (oldStatus === "confirmed") {

                if (foundEvent.seatsBooked > 0) {

                    foundEvent.seatsBooked =
                        foundEvent.seatsBooked - 1;

                    await foundEvent.save();
                }


                // ------------------------------------------------
                // PROMOTE NEXT WAITLISTED PARTICIPANT
                // ------------------------------------------------

                const nextWaitlisted =
                    await registration
                        .findOne({
                            event: foundEvent._id,
                            status: "waitlist"
                        })
                        .sort({
                            waitlistPosition: 1,
                            createdAt: 1
                        });


                if (nextWaitlisted) {

                    nextWaitlisted.status =
                        "confirmed";

                    nextWaitlisted.waitlistPosition =
                        null;

                    await nextWaitlisted.save();


                    foundEvent.seatsBooked =
                        foundEvent.seatsBooked + 1;

                    await foundEvent.save();


                    // ------------------------------------------------
                    // NOTIFICATION - PROMOTED
                    // ------------------------------------------------

                    await createNotification({
                        recipient: nextWaitlisted.participant,
                        type: "waitlist_promoted",
                        message: `Good news! You have been promoted from the waitlist and your registration for "${foundEvent.title}" is now confirmed.`,
                        event: foundEvent._id
                    });


                    // ------------------------------------------------
                    // RE-CALCULATE WAITLIST
                    // ------------------------------------------------

                    const remainingWaitlist =
                        await registration
                            .find({
                                event: foundEvent._id,
                                status: "waitlist"
                            })
                            .sort({
                                waitlistPosition: 1,
                                createdAt: 1
                            });


                    for (
                        let i = 0;
                        i < remainingWaitlist.length;
                        i++
                    ) {

                        remainingWaitlist[i].waitlistPosition =
                            i + 1;

                        await remainingWaitlist[i].save();
                    }
                }
            }


            // ------------------------------------------------
            // WAITLIST ENTRY CANCELLED / REJECTED
            // ------------------------------------------------

            if (oldStatus === "waitlist") {

                const remainingWaitlist =
                    await registration
                        .find({
                            event: foundEvent._id,
                            status: "waitlist"
                        })
                        .sort({
                            waitlistPosition: 1,
                            createdAt: 1
                        });


                for (
                    let i = 0;
                    i < remainingWaitlist.length;
                    i++
                ) {

                    remainingWaitlist[i].waitlistPosition =
                        i + 1;

                    await remainingWaitlist[i].save();
                }
            }
        }


        // ------------------------------------------------
        // GET UPDATED REGISTRATION
        // ------------------------------------------------

        const updatedRegistration =
            await registration
                .findById(foundRegistration._id)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                );


        res.status(200).send({
            message:
                "Registration status updated successfully",
            registration: updatedRegistration
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ADMIN - GET ALL REGISTRATIONS
// GET /api/registrations
// ======================================================

export const getAllRegistrations = async (req, res) => {
    try {

        const {
            status,
            eventId,
            participantId
        } = req.query;


        const filter = {};


        if (status) {
            filter.status = status;
        }


        if (eventId) {
            filter.event = eventId;
        }


        if (participantId) {
            filter.participant = participantId;
        }


        const registrations =
            await registration
                .find(filter)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate({
                    path: "event",
                    select:
                        "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status organizer",
                    populate: {
                        path: "organizer",
                        select:
                            "name email username"
                    }
                })
                .sort({
                    createdAt: -1
                });


        res.status(200).send({
            count: registrations.length,
            registrations
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

const getCertificateRegistration = async (req, res) => {
    const foundRegistration = await registration.findById(req.params.id).populate("event", "organizer title date");
    if (!foundRegistration) return { error: res.status(404).send({ message: "Registration not found" }) };
    return { foundRegistration };
};

export const requestCertificateFee = async (req, res) => {
    try {
        const { foundRegistration, error } = await getCertificateRegistration(req, res);
        if (error) return;
        if (foundRegistration.event.organizer.toString() !== req.user.userId.toString()) return res.status(403).send({ message: "You can only manage fees for your own events" });
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount < 0) return res.status(400).send({ message: "A valid non-negative fee amount is required" });
        foundRegistration.certificateFeeAmount = amount;
        foundRegistration.certificatePaymentStatus = "requested";
        foundRegistration.certificatePaymentRequestedOn = new Date();
        foundRegistration.certificatePaymentProofUrl = "";
        await foundRegistration.save();
        res.status(200).send({ message: "Certificate fee request sent", registration: foundRegistration });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const submitCertificatePaymentProof = async (req, res) => {
    try {
        const { foundRegistration, error } = await getCertificateRegistration(req, res);
        if (error) return;
        if (foundRegistration.participant.toString() !== req.user.userId.toString()) return res.status(403).send({ message: "You can only submit proof for your own registration" });
        if (!req.file) return res.status(400).send({ message: "Payment screenshot is required" });
        if (!["requested", "rejected"].includes(foundRegistration.certificatePaymentStatus)) return res.status(400).send({ message: "The organizer must request payment before proof can be uploaded" });
        foundRegistration.certificatePaymentProofUrl = `/uploads/payment-proofs/${req.file.filename}`;
        foundRegistration.certificatePaymentStatus = "proof_submitted";
        await foundRegistration.save();
        res.status(200).send({ message: "Payment proof submitted for review", registration: foundRegistration });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const reviewCertificatePayment = async (req, res) => {
    try {
        const { foundRegistration, error } = await getCertificateRegistration(req, res);
        if (error) return;
        if (foundRegistration.event.organizer.toString() !== req.user.userId.toString()) return res.status(403).send({ message: "You can only review fees for your own events" });
        if (foundRegistration.certificatePaymentStatus !== "proof_submitted") return res.status(400).send({ message: "A submitted payment proof is required" });
        const approved = req.body.approved === true || req.body.approved === "true";
        let issuedCertificate = null;
        if (approved) {
            const attended = await attendance.findOne({ event: foundRegistration.event._id, participant: foundRegistration.participant, attended: true });
            if (!attended) return res.status(400).send({ message: "Participant must attend the event before approval" });
            const participant = await user.findById(foundRegistration.participant).select("name");
            issuedCertificate = await certificate.findOne({ event: foundRegistration.event._id, participant: foundRegistration.participant });
            if (!issuedCertificate) {
                const certificateNumber = generateCertificateNumber();
                const issuedOn = new Date();
                const pdf = await generateCertificatePDF({
                    certificateNumber,
                    participantName: participant.name,
                    eventTitle: foundRegistration.event.title,
                    eventDate: foundRegistration.event.date,
                    issuedOn
                });
                issuedCertificate = await certificate.create({
                    event: foundRegistration.event._id,
                    participant: foundRegistration.participant,
                    attendance: attended._id,
                    certificateUrl: `/uploads/certificates/${pdf.fileName}`,
                    certificateNumber,
                    issuedBy: req.user.userId,
                    issuedOn
                });
            }
        }
        foundRegistration.certificatePaymentStatus = approved ? "approved" : "rejected";
        foundRegistration.certificateFeePaid = approved;
        foundRegistration.certificatePaymentReviewedOn = new Date();
        await foundRegistration.save();
        res.status(200).send({ message: approved ? "Payment approved and certificate issued" : "Payment proof rejected", registration: foundRegistration, certificate: issuedCertificate });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};