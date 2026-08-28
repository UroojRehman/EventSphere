import waitlist from "../Model/waitlist.mjs";
import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";


// ======================================================
// PARTICIPANT - JOIN WAITLIST
// POST /api/waitlist/:eventId
// ======================================================

export const joinWaitlist = async (req, res) => {
    try {

        const { eventId } = req.params;

        const foundEvent = await event.findOne({
            _id: eventId,
            status: "approved"
        });

        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found"
            });
        }


        if (new Date(foundEvent.date) <= new Date()) {
            return res.status(400).send({
                message:
                    "This event has already started or ended"
            });
        }


        if (
            new Date(foundEvent.registrationDeadline) <
            new Date()
        ) {
            return res.status(400).send({
                message:
                    "Registration deadline has passed"
            });
        }


        // ------------------------------------------------
        // Already registered?
        // ------------------------------------------------

        const existingRegistration =
            await registration.findOne({
                event: eventId,
                participant: req.user.userId
            });


        if (existingRegistration) {
            return res.status(409).send({
                message:
                    "You already have a registration for this event",
                status:
                    existingRegistration.status
            });
        }


        // ------------------------------------------------
        // Already waiting?
        // ------------------------------------------------

        const existingWaitlist =
            await waitlist.findOne({
                event: eventId,
                participant: req.user.userId,
                status: "waiting"
            });


        if (existingWaitlist) {
            return res.status(409).send({
                message:
                    "You are already on the waitlist",
                waitlist:
                    existingWaitlist
            });
        }


        // ------------------------------------------------
        // Seats available?
        // ------------------------------------------------

        if (
            foundEvent.seatsBooked <
            foundEvent.maxParticipants
        ) {
            return res.status(400).send({
                message:
                    "Seats are available. Please register for the event instead of joining the waitlist"
            });
        }


        // ------------------------------------------------
        // Position
        // ------------------------------------------------

        const lastWaitlist =
            await waitlist
                .findOne({
                    event: eventId,
                    status: "waiting"
                })
                .sort({
                    position: -1
                });


        const position =
            lastWaitlist
                ? lastWaitlist.position + 1
                : 1;


        const newWaitlist =
            new waitlist({
                event: eventId,
                participant: req.user.userId,
                position,
                status: "waiting"
            });


        await newWaitlist.save();


        const populatedWaitlist =
            await waitlist
                .findById(newWaitlist._id)
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                )
                .populate(
                    "participant",
                    "name email username contactNumber"
                );


        res.status(201).send({
            message:
                "Added to waitlist successfully",
            waitlist:
                populatedWaitlist
        });


    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({
                message:
                    "You are already on the waitlist for this event"
            });
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// PARTICIPANT - MY WAITLIST
// GET /api/waitlist/my
// ======================================================

export const getMyWaitlist = async (req, res) => {
    try {

        const waitlists =
            await waitlist
                .find({
                    participant: req.user.userId
                })
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).send({
            count: waitlists.length,
            waitlists
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// PARTICIPANT - GET WAITLIST BY ID
// GET /api/waitlist/:id
// ======================================================

export const getWaitlistById = async (req, res) => {
    try {

        const foundWaitlist =
            await waitlist
                .findOne({
                    _id: req.params.id,
                    participant: req.user.userId
                })
                .populate(
                    "event",
                    "title category eventType department venue date time maxParticipants seatsBooked registrationDeadline status"
                )
                .populate(
                    "participant",
                    "name email username contactNumber"
                );


        if (!foundWaitlist) {
            return res.status(404).send({
                message:
                    "Waitlist entry not found"
            });
        }


        res.status(200).send({
            waitlist:
                foundWaitlist
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// PARTICIPANT - LEAVE WAITLIST
// DELETE /api/waitlist/:id
// ======================================================

export const leaveWaitlist = async (req, res) => {
    try {

        const foundWaitlist =
            await waitlist.findOne({
                _id: req.params.id,
                participant: req.user.userId,
                status: "waiting"
            });


        if (!foundWaitlist) {
            return res.status(404).send({
                message:
                    "Active waitlist entry not found"
            });
        }


        const eventId =
            foundWaitlist.event;


        foundWaitlist.status =
            "cancelled";


        await foundWaitlist.save();


        await reorderWaitlist(eventId);


        res.status(200).send({
            message:
                "Removed from waitlist successfully"
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ORGANIZER - EVENT WAITLIST
// GET /api/waitlist/event/:eventId
// ======================================================

export const getEventWaitlist = async (req, res) => {
    try {

        const foundEvent =
            await event.findOne({
                _id: req.params.eventId,
                organizer: req.user.userId
            });


        if (!foundEvent) {
            return res.status(404).send({
                message:
                    "Event not found or you are not the organizer"
            });
        }


        const waitlists =
            await waitlist
                .find({
                    event: req.params.eventId
                })
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .sort({
                    status: 1,
                    position: 1
                });


        res.status(200).send({
            count:
                waitlists.length,
            waitlists
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ORGANIZER - PROMOTE NEXT PARTICIPANT
// POST /api/waitlist/event/:eventId/promote
// ======================================================

export const promoteNextParticipant = async (req, res) => {
    try {

        const foundEvent =
            await event.findOne({
                _id: req.params.eventId,
                organizer: req.user.userId
            });


        if (!foundEvent) {
            return res.status(404).send({
                message:
                    "Event not found or you are not the organizer"
            });
        }


        if (
            foundEvent.seatsBooked >=
            foundEvent.maxParticipants
        ) {
            return res.status(400).send({
                message:
                    "No seats are currently available"
            });
        }


        const nextParticipant =
            await waitlist
                .findOne({
                    event: req.params.eventId,
                    status: "waiting"
                })
                .sort({
                    position: 1,
                    joinedAt: 1
                });


        if (!nextParticipant) {
            return res.status(404).send({
                message:
                    "No participants are waiting"
            });
        }


        const newRegistration =
            new registration({
                event: req.params.eventId,
                participant:
                    nextParticipant.participant,
                status: "confirmed"
            });


        await newRegistration.save();


        foundEvent.seatsBooked += 1;

        await foundEvent.save();


        nextParticipant.status =
            "promoted";

        nextParticipant.promotedAt =
            new Date();

        await nextParticipant.save();


        await reorderWaitlist(
            req.params.eventId
        );


        const populatedRegistration =
            await registration
                .findById(newRegistration._id)
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time"
                );


        res.status(200).send({
            message:
                "Next waitlisted participant promoted successfully",
            registration:
                populatedRegistration
        });


    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({
                message:
                    "Participant already has a registration for this event"
            });
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ADMIN - GET ALL WAITLISTS
// GET /api/waitlist/admin/all
// ======================================================

export const getAllWaitlists = async (req, res) => {
    try {

        const {
            eventId,
            participantId,
            status
        } = req.query;


        const filter = {};


        if (eventId) {
            filter.event = eventId;
        }


        if (participantId) {
            filter.participant =
                participantId;
        }


        if (status) {
            filter.status =
                status;
        }


        const waitlists =
            await waitlist
                .find(filter)
                .populate(
                    "event",
                    "title category eventType department venue date maxParticipants seatsBooked"
                )
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .sort({
                    createdAt: -1
                });


        res.status(200).send({
            count:
                waitlists.length,
            waitlists
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// ADMIN - DELETE WAITLIST ENTRY
// DELETE /api/waitlist/admin/:id
// ======================================================

export const adminDeleteWaitlist = async (req, res) => {
    try {

        const foundWaitlist =
            await waitlist.findById(
                req.params.id
            );


        if (!foundWaitlist) {
            return res.status(404).send({
                message:
                    "Waitlist entry not found"
            });
        }


        const eventId =
            foundWaitlist.event;


        await waitlist.findByIdAndDelete(
            req.params.id
        );


        if (
            foundWaitlist.status ===
            "waiting"
        ) {
            await reorderWaitlist(
                eventId
            );
        }


        res.status(200).send({
            message:
                "Waitlist entry deleted successfully"
        });


    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};



// ======================================================
// HELPER - REORDER WAITLIST
// ======================================================

const reorderWaitlist = async (eventId) => {

    const activeWaitlists =
        await waitlist
            .find({
                event: eventId,
                status: "waiting"
            })
            .sort({
                joinedAt: 1,
                createdAt: 1
            });


    for (
        let index = 0;
        index < activeWaitlists.length;
        index++
    ) {

        activeWaitlists[index].position =
            index + 1;

        await activeWaitlists[index].save();
    }
};



// ======================================================
// AUTO PROMOTE WAITLIST
// ======================================================

export const processWaitlist = async (eventId) => {

    const foundEvent =
        await event.findById(eventId);


    if (!foundEvent) {
        return;
    }


    while (
        foundEvent.seatsBooked <
        foundEvent.maxParticipants
    ) {

        const nextParticipant =
            await waitlist
                .findOne({
                    event: eventId,
                    status: "waiting"
                })
                .sort({
                    position: 1,
                    joinedAt: 1
                });


        if (!nextParticipant) {
            break;
        }


        // ------------------------------------------------
        // Check if participant already has registration
        // ------------------------------------------------

        const existingRegistration =
            await registration.findOne({
                event: eventId,
                participant:
                    nextParticipant.participant
            });


        if (existingRegistration) {

            // If somehow participant already registered,
            // remove them from active waitlist.

            nextParticipant.status =
                "promoted";

            nextParticipant.promotedAt =
                new Date();

            await nextParticipant.save();

            continue;
        }


        // ------------------------------------------------
        // Create confirmed registration
        // ------------------------------------------------

        const newRegistration =
            new registration({
                event: eventId,
                participant:
                    nextParticipant.participant,
                status: "confirmed"
            });


        await newRegistration.save();


        // ------------------------------------------------
        // Increase booked seats
        // ------------------------------------------------

        foundEvent.seatsBooked += 1;


        // ------------------------------------------------
        // Mark waitlist participant promoted
        // ------------------------------------------------

        nextParticipant.status =
            "promoted";

        nextParticipant.promotedAt =
            new Date();

        await nextParticipant.save();
    }


    await foundEvent.save();


    await reorderWaitlist(
        eventId
    );
};