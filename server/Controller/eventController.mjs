import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import { createNotification } from "../utils/notificationHelper.mjs";


// ======================================================
// HELPER - RECALCULATE WAITLIST POSITIONS
// ======================================================

const recalculateWaitlistPositions = async (eventId) => {

    const waitlistedUsers = await registration
        .find({
            event: eventId,
            status: "waitlist"
        })
        .sort({
            waitlistPosition: 1,
            createdAt: 1
        });

    for (let i = 0; i < waitlistedUsers.length; i++) {

        waitlistedUsers[i].waitlistPosition = i + 1;

        await waitlistedUsers[i].save();
    }
};


// ======================================================
// HELPER - PROMOTE NEXT WAITLISTED PARTICIPANT
// ======================================================

const promoteNextWaitlisted = async (foundEvent) => {

    if (
        foundEvent.seatsBooked >=
        foundEvent.maxParticipants
    ) {
        return null;
    }

    const nextWaitlisted = await registration
        .findOne({
            event: foundEvent._id,
            status: "waitlist"
        })
        .sort({
            waitlistPosition: 1,
            createdAt: 1
        });

    if (!nextWaitlisted) {
        return null;
    }

    nextWaitlisted.status = "confirmed";
    nextWaitlisted.waitlistPosition = null;
    nextWaitlisted.cancelledOn = null;
    nextWaitlisted.cancellationReason = "";

    await nextWaitlisted.save();

    foundEvent.seatsBooked =
        foundEvent.seatsBooked + 1;

    await foundEvent.save();

    await recalculateWaitlistPositions(
        foundEvent._id
    );

    return nextWaitlisted;
};


// ======================================================
// HELPER - NOTIFY EVENT PARTICIPANTS
// ======================================================

const notifyEventParticipants = async ({
    eventId,
    type,
    message
}) => {

    try {

        const registrations = await registration.find({
            event: eventId,
            status: {
                $in: [
                    "confirmed",
                    "waitlist"
                ]
            }
        });

        for (const registrationRecord of registrations) {

            await createNotification({
                recipient: registrationRecord.participant,
                type,
                message,
                event: eventId
            });
        }

    } catch (error) {

        console.error(
            "Event participants notification error:",
            error.message
        );
    }
};


// ======================================================
// CREATE EVENT - ORGANIZER
// POST /api/events
// ======================================================

export const createEvent = async (req, res) => {

    try {

        const {
            title,
            category,
            eventType,
            department,
            description,
            venue,
            date,
            time,
            endTime,
            timezone,
            maxParticipants,
            registrationDeadline,
            banner,
            rulebook
            ,promotionCaption,
            hashtags
        } = req.body;


        if (
            !title ||
            !category ||
            !eventType ||
            !department ||
            !description ||
            !venue ||
            !date ||
            !time ||
            maxParticipants === undefined ||
            maxParticipants === null ||
            !registrationDeadline
        ) {

            return res.status(400).send({
                message: "All required fields are required"
            });
        }


        const eventDate = new Date(date);

        const deadlineDate =
            new Date(registrationDeadline);


        if (
            Number.isNaN(eventDate.getTime()) ||
            Number.isNaN(deadlineDate.getTime())
        ) {

            return res.status(400).send({
                message:
                    "Invalid event date or registration deadline"
            });
        }


        if (eventDate <= new Date()) {

            return res.status(400).send({
                message:
                    "Event date must be in the future"
            });
        }


        if (deadlineDate >= eventDate) {

            return res.status(400).send({
                message:
                    "Registration deadline must be before event date"
            });
        }


        if (Number(maxParticipants) <= 0) {

            return res.status(400).send({
                message:
                    "Maximum participants must be greater than 0"
            });
        }


        const newEvent = new event({

            title: title.trim(),
            category,
            eventType,
            department,
            description: description.trim(),
            venue: venue.trim(),
            date: eventDate,
            time,
            endTime,
            maxParticipants: Number(maxParticipants),
            seatsBooked: 0,
            registrationDeadline: deadlineDate,
            banner,
            rulebook,
            promotionCaption: promotionCaption || "",
            hashtags: Array.isArray(hashtags) ? hashtags : [],
            organizer: req.user.userId,
            status: "pending",
            adminComment: ""
        });


        await newEvent.save();


        res.status(201).send({

            message:
                "Event created successfully and sent for approval",

            event: newEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// GET EVENTS - PUBLIC
// GET /api/events
// ======================================================

export const getEvents = async (req, res) => {

    try {

        const {
            search,
            category,
            eventType,
            department,
            venue,
            startDate,
            endDate
        } = req.query;


        const filter = {
            status: "approved"
        };


        if (category) {
            filter.category = category;
        }


        if (eventType) {
            filter.eventType = eventType;
        }


        if (department) {
            filter.department = department;
        }


        if (venue) {

            filter.venue = {
                $regex: venue,
                $options: "i"
            };
        }


        if (search) {

            filter.$or = [

                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    venue: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    eventType: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    department: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];
        }


        if (startDate || endDate) {

            filter.date = {};


            if (startDate) {

                const start = new Date(startDate);

                if (Number.isNaN(start.getTime())) {

                    return res.status(400).send({
                        message: "Invalid start date"
                    });
                }

                filter.date.$gte = start;
            }


            if (endDate) {

                const end = new Date(endDate);

                if (Number.isNaN(end.getTime())) {

                    return res.status(400).send({
                        message: "Invalid end date"
                    });
                }

                end.setHours(23, 59, 59, 999);

                filter.date.$lte = end;
            }
        }


        const events = await event
            .find(filter)
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                date: 1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// GET EVENT BY ID - PUBLIC
// GET /api/events/:id
// ======================================================

export const getEventById = async (req, res) => {

    try {

        const foundEvent = await event
            .findOne({
                _id: req.params.id,
                status: "approved"
            })
            .populate(
                "organizer",
                "name email username"
            );


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        res.status(200).send(foundEvent);

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// UPCOMING EVENTS - PUBLIC
// GET /api/events/upcoming
// ======================================================

export const getUpcomingEvents = async (req, res) => {

    try {

        const events = await event
            .find({
                status: "approved",
                date: {
                    $gte: new Date()
                }
            })
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                date: 1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PAST EVENTS - PUBLIC
// GET /api/events/past
// ======================================================

export const getPastEvents = async (req, res) => {

    try {

        const events = await event
            .find({
                status: "approved",
                date: {
                    $lt: new Date()
                }
            })
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                date: -1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - MY EVENTS
// GET /api/events/organizer/my
// ======================================================

export const getMyEvents = async (req, res) => {

    try {

        const events = await event
            .find({
                organizer: req.user.userId
            })
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - GET OWN EVENT
// GET /api/events/organizer/:id
// ======================================================

export const getOrganizerEventById = async (req, res) => {

    try {

        const foundEvent = await event
            .findOne({
                _id: req.params.id,
                organizer: req.user.userId
            })
            .populate(
                "organizer",
                "name email username"
            );


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        res.status(200).send(foundEvent);

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - UPDATE EVENT
// PUT /api/events/:id
// ======================================================

export const updateEvent = async (req, res) => {

    try {

        const foundEvent = await event.findOne({
            _id: req.params.id,
            organizer: req.user.userId
        });


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        if (foundEvent.status === "cancelled") {

            return res.status(400).send({
                message:
                    "Cancelled events cannot be updated"
            });
        }


        if (foundEvent.status === "rejected") {

            return res.status(400).send({
                message:
                    "Rejected events cannot be updated. Please create a new event"
            });
        }


        if (new Date(foundEvent.date) <= new Date()) {

            return res.status(400).send({
                message:
                    "Past events cannot be updated"
            });
        }


        const {
            title,
            category,
            eventType,
            department,
            description,
            venue,
            date,
            time,
            endTime,
            maxParticipants,
            registrationDeadline,
            banner,
            rulebook,
            promotionCaption,
            hashtags
        } = req.body;


        const newDate =
            date !== undefined
                ? new Date(date)
                : new Date(foundEvent.date);


        const newDeadline =
            registrationDeadline !== undefined
                ? new Date(registrationDeadline)
                : new Date(foundEvent.registrationDeadline);

        const wasRescheduled = date !== undefined && newDate.getTime() !== new Date(foundEvent.date).getTime()
            || time !== undefined && time !== foundEvent.time
            || endTime !== undefined && endTime !== foundEvent.endTime
            || venue !== undefined && venue.trim() !== foundEvent.venue;


        if (Number.isNaN(newDate.getTime())) {

            return res.status(400).send({
                message: "Invalid event date"
            });
        }


        if (Number.isNaN(newDeadline.getTime())) {

            return res.status(400).send({
                message:
                    "Invalid registration deadline"
            });
        }


        if (newDate <= new Date()) {

            return res.status(400).send({
                message:
                    "Event date must be in the future"
            });
        }


        if (newDeadline >= newDate) {

            return res.status(400).send({
                message:
                    "Registration deadline must be before event date"
            });
        }


        if (
            maxParticipants !== undefined &&
            (
                Number(maxParticipants) <= 0 ||
                Number.isNaN(Number(maxParticipants))
            )
        ) {

            return res.status(400).send({
                message:
                    "Maximum participants must be greater than 0"
            });
        }


        if (
            maxParticipants !== undefined &&
            Number(maxParticipants) <
            foundEvent.seatsBooked
        ) {

            return res.status(400).send({
                message:
                    "Maximum participants cannot be less than booked seats"
            });
        }


        foundEvent.title =
            title?.trim() ?? foundEvent.title;

        foundEvent.category =
            category ?? foundEvent.category;

        foundEvent.eventType =
            eventType ?? foundEvent.eventType;

        foundEvent.department =
            department ?? foundEvent.department;

        foundEvent.description =
            description?.trim() ?? foundEvent.description;

        foundEvent.venue =
            venue?.trim() ?? foundEvent.venue;

        foundEvent.date = newDate;

        foundEvent.time =
            time ?? foundEvent.time;

        foundEvent.endTime =
            endTime ?? foundEvent.endTime;

        foundEvent.timezone =
            timezone ?? foundEvent.timezone;

        foundEvent.maxParticipants =
            maxParticipants !== undefined
                ? Number(maxParticipants)
                : foundEvent.maxParticipants;

        foundEvent.registrationDeadline =
            newDeadline;

        foundEvent.banner =
            banner ?? foundEvent.banner;

        foundEvent.rulebook =
            rulebook ?? foundEvent.rulebook;

        foundEvent.promotionCaption =
            promotionCaption ?? foundEvent.promotionCaption;

        foundEvent.hashtags =
            Array.isArray(hashtags) ? hashtags : foundEvent.hashtags;


        // Organizer modification requires approval again
        foundEvent.status = "pending";
        foundEvent.adminComment = "";


        await foundEvent.save();


        // ======================================================
        // NOTIFICATION - EVENT UPDATED
        // ======================================================

        await notifyEventParticipants({
            eventId: foundEvent._id,
            type: wasRescheduled ? "event_rescheduled" : "event_update",
            message:
                wasRescheduled
                    ? `The schedule or venue for "${foundEvent.title}" has changed. The updated event is awaiting approval.`
                    : `The event "${foundEvent.title}" has been updated by the organizer and is awaiting approval.`
        });


        res.status(200).send({

            message:
                "Event updated and sent for approval again",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - CANCEL EVENT
// DELETE /api/events/:id
// ======================================================

export const deleteEvent = async (req, res) => {

    try {

        const foundEvent = await event.findOne({
            _id: req.params.id,
            organizer: req.user.userId
        });


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        if (foundEvent.status === "cancelled") {

            return res.status(400).send({
                message: "Event is already cancelled"
            });
        }


        if (new Date(foundEvent.date) <= new Date()) {

            return res.status(400).send({
                message:
                    "Past events cannot be cancelled"
            });
        }


        // ======================================================
        // NOTIFICATION BEFORE CANCELLING REGISTRATIONS
        // ======================================================

        await notifyEventParticipants({
            eventId: foundEvent._id,
            type: "event_update",
            message:
                `The event "${foundEvent.title}" has been cancelled by the organizer.`
        });


        // Cancel all registrations of this event
        await registration.updateMany(
            {
                event: foundEvent._id,
                status: {
                    $in: [
                        "confirmed",
                        "waitlist"
                    ]
                }
            },
            {
                $set: {
                    status: "cancelled",
                    waitlistPosition: null,
                    cancelledOn: new Date(),
                    cancellationReason:
                        "Event cancelled by organizer"
                }
            }
        );


        foundEvent.status = "cancelled";
        foundEvent.seatsBooked = 0;


        await foundEvent.save();


        res.status(200).send({

            message:
                "Event cancelled successfully",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET ALL EVENTS
// GET /api/events/admin/all
// ======================================================

export const getAllEventsAdmin = async (req, res) => {

    try {

        const events = await event
            .find()
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET PENDING EVENTS
// GET /api/events/admin/pending
// ======================================================

export const getPendingEvents = async (req, res) => {

    try {

        const events = await event
            .find({
                status: {
                    $in: [
                        "pending",
                        "changes_requested"
                    ]
                }
            })
            .populate(
                "organizer",
                "name email username"
            )
            .sort({
                createdAt: -1
            });


        res.status(200).send({

            count: events.length,

            events

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - APPROVE EVENT
// PUT /api/events/:id/approve
// ======================================================

export const approveEvent = async (req, res) => {

    try {

        const foundEvent =
            await event.findById(req.params.id);


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        if (foundEvent.status === "approved") {

            return res.status(400).send({
                message:
                    "Event is already approved"
            });
        }


        if (foundEvent.status === "cancelled") {

            return res.status(400).send({
                message:
                    "Cancelled event cannot be approved"
            });
        }


        foundEvent.status = "approved";
        foundEvent.adminComment = "";


        await foundEvent.save();


        // ======================================================
        // NOTIFICATION - EVENT APPROVED
        // ======================================================

        await createNotification({

            recipient: foundEvent.organizer,

            type: "event_approved",

            message:
                `Your event "${foundEvent.title}" has been approved.`,

            event: foundEvent._id
        });


        res.status(200).send({

            message:
                "Event approved successfully",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - REJECT EVENT
// PUT /api/events/:id/reject
// ======================================================

export const rejectEvent = async (req, res) => {

    try {

        const { comment } = req.body;


        const foundEvent =
            await event.findById(req.params.id);


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        if (foundEvent.status === "approved") {

            return res.status(400).send({
                message:
                    "Approved event cannot be rejected directly"
            });
        }


        foundEvent.status = "rejected";

        foundEvent.adminComment =
            comment?.trim() || "";


        await foundEvent.save();


        // ======================================================
        // NOTIFICATION - EVENT REJECTED
        // ======================================================

        await createNotification({

            recipient: foundEvent.organizer,

            type: "event_rejected",

            message:
                `Your event "${foundEvent.title}" has been rejected.${comment?.trim()
                    ? ` Reason: ${comment.trim()}`
                    : ""
                }`,

            event: foundEvent._id
        });


        res.status(200).send({

            message:
                "Event rejected successfully",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - REQUEST CHANGES
// PUT /api/events/:id/request-changes
// ======================================================

export const requestEventChanges = async (req, res) => {

    try {

        const { comment } = req.body;


        if (!comment?.trim()) {

            return res.status(400).send({
                message:
                    "Comment is required when requesting changes"
            });
        }


        const foundEvent =
            await event.findById(req.params.id);


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        foundEvent.status =
            "changes_requested";

        foundEvent.adminComment =
            comment.trim();


        await foundEvent.save();


        // ======================================================
        // NOTIFICATION - CHANGES REQUESTED
        // ======================================================

        await createNotification({

            recipient: foundEvent.organizer,

            type: "event_update",

            message:
                `Changes have been requested for your event "${foundEvent.title}". Comment: ${comment.trim()}`,

            event: foundEvent._id
        });


        res.status(200).send({

            message:
                "Changes requested successfully",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - UPDATE ANY EVENT
// PUT /api/events/admin/:id
// ======================================================

export const adminUpdateEvent = async (req, res) => {

    try {

        const foundEvent =
            await event.findById(req.params.id);


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        const {
            title,
            category,
            eventType,
            department,
            description,
            venue,
            date,
            time,
            endTime,
            maxParticipants,
            registrationDeadline,
            banner,
            rulebook,
            status,
            adminComment,
            promotionCaption,
            hashtags
        } = req.body;


        const newDate =
            date !== undefined
                ? new Date(date)
                : foundEvent.date;


        const newDeadline =
            registrationDeadline !== undefined
                ? new Date(registrationDeadline)
                : foundEvent.registrationDeadline;


        if (
            date !== undefined &&
            Number.isNaN(newDate.getTime())
        ) {

            return res.status(400).send({
                message: "Invalid event date"
            });
        }


        if (
            registrationDeadline !== undefined &&
            Number.isNaN(newDeadline.getTime())
        ) {

            return res.status(400).send({
                message:
                    "Invalid registration deadline"
            });
        }


        if (newDeadline >= newDate) {

            return res.status(400).send({
                message:
                    "Registration deadline must be before event date"
            });
        }


        if (
            maxParticipants !== undefined &&
            (
                Number(maxParticipants) <= 0 ||
                Number.isNaN(Number(maxParticipants))
            )
        ) {

            return res.status(400).send({
                message:
                    "Maximum participants must be greater than 0"
            });
        }


        if (
            maxParticipants !== undefined &&
            Number(maxParticipants) <
            foundEvent.seatsBooked
        ) {

            return res.status(400).send({
                message:
                    "Maximum participants cannot be less than booked seats"
            });
        }


        if (title !== undefined)
            foundEvent.title = title.trim();

        if (category !== undefined)
            foundEvent.category = category;

        if (eventType !== undefined)
            foundEvent.eventType = eventType;

        if (department !== undefined)
            foundEvent.department = department;

        if (description !== undefined)
            foundEvent.description = description.trim();

        if (venue !== undefined)
            foundEvent.venue = venue.trim();

        if (date !== undefined)
            foundEvent.date = newDate;

        if (time !== undefined)
            foundEvent.time = time;

        if (endTime !== undefined)
            foundEvent.endTime = endTime;

        if (maxParticipants !== undefined)
            foundEvent.maxParticipants =
                Number(maxParticipants);

        if (registrationDeadline !== undefined)
            foundEvent.registrationDeadline =
                newDeadline;

        if (banner !== undefined)
            foundEvent.banner = banner;

        if (rulebook !== undefined)
            foundEvent.rulebook = rulebook;

        if (status !== undefined)
            foundEvent.status = status;

        if (adminComment !== undefined)
            foundEvent.adminComment = adminComment;

        if (promotionCaption !== undefined)
            foundEvent.promotionCaption = promotionCaption.trim();

        if (hashtags !== undefined)
            foundEvent.hashtags = Array.isArray(hashtags) ? hashtags : [];


        await foundEvent.save();


        // ======================================================
        // NOTIFICATION - ADMIN UPDATED EVENT
        // ======================================================

        await createNotification({

            recipient: foundEvent.organizer,

            type: "event_update",

            message:
                `Your event "${foundEvent.title}" has been updated by the administrator.`,

            event: foundEvent._id
        });


        // ======================================================
        // NOTIFY PARTICIPANTS IF EVENT IS ALREADY APPROVED
        // ======================================================

        if (foundEvent.status === "approved") {

            await notifyEventParticipants({

                eventId: foundEvent._id,

                type: "event_update",

                message:
                    `The event "${foundEvent.title}" has been updated by the administrator.`
            });
        }


        res.status(200).send({

            message:
                "Event updated successfully by admin",

            event: foundEvent

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - DELETE ANY EVENT
// DELETE /api/events/admin/:id
// ======================================================

export const adminDeleteEvent = async (req, res) => {

    try {

        const foundEvent =
            await event.findById(req.params.id);


        if (!foundEvent) {

            return res.status(404).send({
                message: "Event not found"
            });
        }


        // ======================================================
        // NOTIFY PARTICIPANTS BEFORE DELETE
        // ======================================================

        await notifyEventParticipants({

            eventId: foundEvent._id,

            type: "event_update",

            message:
                `The event "${foundEvent.title}" has been deleted by the administrator.`
        });


        // ======================================================
        // NOTIFY ORGANIZER
        // ======================================================

        await createNotification({

            recipient: foundEvent.organizer,

            type: "event_update",

            message:
                `Your event "${foundEvent.title}" has been deleted by the administrator.`,

            event: foundEvent._id
        });


        // Cancel related registrations first
        await registration.updateMany(
            {
                event: foundEvent._id,
                status: {
                    $in: [
                        "confirmed",
                        "waitlist"
                    ]
                }
            },
            {
                $set: {
                    status: "cancelled",
                    waitlistPosition: null,
                    cancelledOn: new Date(),
                    cancellationReason:
                        "Event deleted by admin"
                }
            }
        );


        await event.findByIdAndDelete(
            req.params.id
        );


        res.status(200).send({

            message:
                "Event deleted successfully by admin"

        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

export const toggleBookmark = async (req, res) => {
    try {
        const foundEvent = await event.findOne({ _id: req.params.id, status: "approved" });
        if (!foundEvent) {
            return res.status(404).send({ message: "Event not found" });
        }

        const userId = req.user.userId.toString();
        const isBookmarked = foundEvent.bookmarkedBy.some((id) => id.toString() === userId);
        foundEvent.bookmarkedBy = isBookmarked
            ? foundEvent.bookmarkedBy.filter((id) => id.toString() !== userId)
            : [...foundEvent.bookmarkedBy, req.user.userId];
        await foundEvent.save();

        res.status(200).send({ bookmarked: !isBookmarked, event: foundEvent });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const getMyBookmarks = async (req, res) => {
    try {
        const events = await event.find({
            status: "approved",
            bookmarkedBy: req.user.userId
        }).populate("organizer", "name email username").sort({ date: 1 });

        res.status(200).send({ count: events.length, events });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const getAdminEventById = async (req, res) => {
    try {
        const foundEvent = await event.findById(req.params.id).populate("organizer", "name email username");
        if (!foundEvent) return res.status(404).send({ message: "Event not found" });
        res.status(200).send(foundEvent);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};