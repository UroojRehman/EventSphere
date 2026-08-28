import feedback from "../Model/feedback.mjs";
import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import attendance from "../Model/attendance.mjs";


// ======================================================
// PARTICIPANT - SUBMIT FEEDBACK
// POST /api/feedback
// ======================================================

export const submitFeedback = async (req, res) => {
    try {

        const {
            eventId,
            userType = "participant",
            rating,
            comments,
            venueRating,
            coordinationRating,
            technicalRating,
            hospitalityRating
        } = req.body;

        if (!eventId || !rating) {
            return res.status(400).send({
                message: "Event ID and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).send({
                message: "Rating must be between 1 and 5"
            });
        }

        const foundEvent = await event.findById(eventId);

        if (!foundEvent) {
            return res.status(404).send({
                message: "Event not found"
            });
        }

        const foundRegistration = await registration.findOne({
            event: eventId,
            participant: req.user.userId,
            status: "confirmed"
        });

        if (!foundRegistration) {
            return res.status(403).send({
                message:
                    "You can only submit feedback for an event you registered for"
            });
        }

        const foundAttendance = await attendance.findOne({
            event: eventId,
            participant: req.user.userId,
            attended: true
        });

        if (!foundAttendance) {
            return res.status(403).send({
                message:
                    "You can only submit feedback after attending the event"
            });
        }

        const existingFeedback = await feedback.findOne({
            event: eventId,
            participant: req.user.userId
        });

        if (existingFeedback) {
            return res.status(409).send({
                message:
                    "You have already submitted feedback for this event",
                feedback: existingFeedback
            });
        }

        const newFeedback = new feedback({
            event: eventId,
            participant: req.user.userId,
            rating,
            comments: comments || "",
            venueRating,
            coordinationRating,
            technicalRating,
            hospitalityRating
        });

        await newFeedback.save();

        const populatedFeedback = await feedback
            .findById(newFeedback._id)
            .populate(
                "participant",
                "name email username contactNumber"
            )
            .populate(
                "event",
                "title category eventType department venue date"
            );

        res.status(201).send({
            message: "Feedback submitted successfully",
            feedback: populatedFeedback
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).send({
                message:
                    "You have already submitted feedback for this event"
            });
        }

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - MY FEEDBACK
// GET /api/feedback/my
// ======================================================

export const getMyFeedback = async (req, res) => {
    try {

        const feedbacks = await feedback
            .find({
                participant: req.user.userId
            })
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .sort({
                submittedOn: -1
            });

        res.status(200).send({
            count: feedbacks.length,
            feedbacks
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// PARTICIPANT - FEEDBACK DETAIL
// GET /api/feedback/:id
// ======================================================

export const getFeedbackById = async (req, res) => {
    try {

        const foundFeedback = await feedback
            .findById(req.params.id)
            .populate(
                "participant",
                "name email username contactNumber"
            )
            .populate(
                "event",
                "title category eventType department venue date organizer"
            );

        if (!foundFeedback) {
            return res.status(404).send({
                message: "Feedback not found"
            });
        }

        if (req.user.role === "participant") {

            if (
                foundFeedback.participant._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view your own feedback"
                });
            }
        }

        if (req.user.role === "organizer") {

            if (
                foundFeedback.event.organizer.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view feedback for your own events"
                });
            }
        }

        res.status(200).send({
            feedback: foundFeedback
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - GET FEEDBACK FOR OWN EVENT
// GET /api/feedback/event/:eventId
// ======================================================

export const getEventFeedback = async (req, res) => {
    try {

        const foundEvent = await event.findOne({
            _id: req.params.eventId,
            organizer: req.user.userId
        });

        if (!foundEvent) {
            return res.status(404).send({
                message:
                    "Event not found or you are not the organizer"
            });
        }

        const feedbacks = await feedback
            .find({
                event: req.params.eventId
            })
            .populate(
                "participant",
                "name email username contactNumber"
            )
            .sort({
                submittedOn: -1
            });

        const totalFeedbacks = feedbacks.length;

        let averageRating = 0;

        if (totalFeedbacks > 0) {

            const totalRating = feedbacks.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            averageRating =
                totalRating / totalFeedbacks;
        }

        res.status(200).send({
            event: {
                id: foundEvent._id,
                title: foundEvent.title
            },
            count: totalFeedbacks,
            averageRating: Number(averageRating.toFixed(2)),
            feedbacks
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ORGANIZER - GET ALL OWN EVENT FEEDBACK
// GET /api/feedback/organizer/my
// ======================================================

export const getOrganizerFeedback = async (req, res) => {
    try {

        const events = await event.find({
            organizer: req.user.userId
        }).select("_id title");

        const eventIds = events.map(
            item => item._id
        );

        const feedbacks = await feedback
            .find({
                event: {
                    $in: eventIds
                }
            })
            .populate(
                "participant",
                "name email username contactNumber"
            )
            .populate(
                "event",
                "title category eventType department venue date"
            )
            .sort({
                submittedOn: -1
            });

        let averageRating = 0;

        if (feedbacks.length > 0) {

            const totalRating = feedbacks.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            averageRating =
                totalRating / feedbacks.length;
        }

        res.status(200).send({
            count: feedbacks.length,
            averageRating:
                Number(averageRating.toFixed(2)),
            feedbacks
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - GET ALL FEEDBACK
// GET /api/feedback
// ======================================================

export const getAllFeedback = async (req, res) => {
    try {

        const {
            eventId,
            participantId,
            rating
        } = req.query;

        const filter = {};

        if (eventId) {
            filter.event = eventId;
        }

        if (participantId) {
            filter.participant = participantId;
        }

        if (rating) {
            filter.rating = Number(rating);
        }

        const feedbacks = await feedback
            .find(filter)
            .populate(
                "participant",
                "name email username contactNumber role"
            )
            .populate(
                "event",
                "title category eventType department venue date organizer"
            )
            .sort({
                submittedOn: -1
            });

        let averageRating = 0;

        if (feedbacks.length > 0) {

            const totalRating = feedbacks.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            averageRating =
                totalRating / feedbacks.length;
        }

        res.status(200).send({
            count: feedbacks.length,
            averageRating:
                Number(averageRating.toFixed(2)),
            feedbacks
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};


// ======================================================
// ADMIN - DELETE FEEDBACK
// DELETE /api/feedback/:id
// ======================================================

export const deleteFeedback = async (req, res) => {
    try {

        const foundFeedback =
            await feedback.findById(
                req.params.id
            );

        if (!foundFeedback) {
            return res.status(404).send({
                message: "Feedback not found"
            });
        }

        await feedback.findByIdAndDelete(
            req.params.id
        );

        res.status(200).send({
            message:
                "Feedback deleted successfully"
        });

    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

export const getPublicEventFeedback = async (req, res) => {
    try {
        const foundEvent = await event.findOne({
            _id: req.params.eventId,
            status: "approved"
        });

        if (!foundEvent) {
            return res.status(404).send({ message: "Event not found" });
        }

        const feedbacks = await feedback
            .find({ event: req.params.eventId })
            .select("rating comments venueRating coordinationRating technicalRating hospitalityRating submittedOn")
            .sort({ submittedOn: -1 });

        const averageRating = feedbacks.length
            ? feedbacks.reduce((total, item) => total + item.rating, 0) / feedbacks.length
            : 0;

        res.status(200).send({
            count: feedbacks.length,
            averageRating: Number(averageRating.toFixed(1)),
            feedbacks
        });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};