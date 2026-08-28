import attendance from "../Model/attendance.mjs";
import registration from "../Model/registration.mjs";
import event from "../Model/event.mjs";

// ORGANIZER - MARK ATTENDANCE
// PATCH /api/attendance/:registrationId
export const markAttendance = async (req, res) => {
    try {
        const { attended } = req.body;
        if (attended === undefined) {
            return res.status(400).send({
                message: "Attendance status is required"
            });
        }
        if (typeof attended !== "boolean") {
            return res.status(400).send({
                message: "Attendance must be true or false"
            });
        }
        const foundRegistration = await registration.findOne({
            $or: [
                { _id: req.params.registrationId },
                { checkInToken: req.params.registrationId }
            ]
        });
        if (!foundRegistration) {
            return res.status(404).send({
                message: "Registration not found"
            });
        }
        if (foundRegistration.status !== "confirmed") {
            return res.status(400).send({
                message:
                    "Only confirmed participants can have attendance marked"
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
        if (
            foundEvent.organizer.toString() !==
            req.user.userId.toString()
        ) {
            return res.status(403).send({
                message:
                    "You can only manage attendance for your own events"
            });
        }
        const eventDate =
            new Date(foundEvent.date);
        eventDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today < eventDate) {
            return res.status(400).send({
                message:
                    "Attendance cannot be marked before the event date"
            });
        }
        let foundAttendance =
            await attendance.findOne({
                event: foundEvent._id,
                participant:
                    foundRegistration.participant
            });
        if (!foundAttendance) {

            foundAttendance =
                new attendance({
                    event: foundEvent._id,
                    participant:
                        foundRegistration.participant,
                    registration:
                        foundRegistration._id,
                    attended,
                    markedOn:
                        attended ? new Date() : null,
                    markedBy:
                        req.user.userId
                });
        } else {
            foundAttendance.attended =
                attended;
            foundAttendance.markedOn =
                attended ? new Date() : null;
            foundAttendance.markedBy =
                req.user.userId;
        }
        await foundAttendance.save();
        const populatedAttendance =
            await attendance
                .findById(foundAttendance._id)
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time"
                )
                .populate(
                    "registration",
                    "status registeredOn"
                )
                .populate(
                    "markedBy",
                    "name email username"
                );
        res.status(200).send({
            message:
                attended
                    ? "Attendance marked successfully"
                    : "Attendance marked as absent",
            attendance: populatedAttendance
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send({
                message:
                    "Attendance record already exists"
            });
        }
        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

// PARTICIPANT - MY ATTENDANCE
// GET /api/attendance/my
export const getMyAttendance = async (req, res) => {
    try {
        const attendances =
            await attendance
                .find({
                    participant:
                        req.user.userId
                })
                .populate(
                    "event",
                    "title category eventType department venue date time"
                )
                .populate(
                    "registration",
                    "status registeredOn"
                )
                .populate(
                    "markedBy",
                    "name email username"
                )
                .sort({
                    createdAt: -1
                });
        res.status(200).send({
            count: attendances.length,
            attendances
        });
    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

// PARTICIPANT / ORGANIZER / ADMIN
// GET ATTENDANCE BY ID
// GET /api/attendance/:id
export const getAttendanceById = async (req, res) => {
    try {
        const foundAttendance =
            await attendance
                .findById(req.params.id)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    {
                        path: "event",
                        select:
                            "title category eventType department venue date time organizer",
                        populate: {
                            path: "organizer",
                            select:
                                "name email username"
                        }
                    }
                )
                .populate(
                    "registration",
                    "status registeredOn"
                )
                .populate(
                    "markedBy",
                    "name email username"
                );
        if (!foundAttendance) {
            return res.status(404).send({
                message: "Attendance record not found"
            });
        }

        if (req.user.role === "participant") {

            if (
                foundAttendance.participant._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view your own attendance"
                });
            }
        }

        if (req.user.role === "organizer") {

            if (
                foundAttendance.event.organizer._id.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).send({
                    message:
                        "You can only view attendance for your own events"
                });
            }
        }
        res.status(200).send({
            attendance: foundAttendance
        });
    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

// ORGANIZER - GET EVENT ATTENDANCE
// GET /api/attendance/event/:eventId
export const getEventAttendance = async (req, res) => {
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
        const [registrations, attendanceRecords] = await Promise.all([
            registration.find({ event: req.params.eventId, status: "confirmed" })
                .populate("participant", "name email username contactNumber")
                .populate("event", "title category eventType department venue date time")
                .sort({ createdAt: 1 }),
            attendance.find({ event: req.params.eventId })
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .populate(
                    "registration",
                    "status registeredOn"
                )
                .populate(
                    "markedBy",
                    "name email username"
                )
                .sort({
                    createdAt: 1
                })
        ]);
        const attendanceByRegistration = new Map(attendanceRecords.map((item) => [item.registration?.toString(), item]));
        const attendances = registrations.map((item) => attendanceByRegistration.get(item._id.toString()) || {
            _id: `unmarked-${item._id}`,
            event: item.event,
            participant: item.participant,
            registration: item,
            attended: false,
            markedOn: null,
            unmarked: true
        });
        const totalParticipants =
            attendances.length;
        const presentParticipants =
            attendances.filter(
                item => item.attended === true
            ).length;
        const absentParticipants =
            attendances.filter(
                item => item.attended === false
            ).length;
        res.status(200).send({
            event: {
                id: foundEvent._id,
                title: foundEvent.title,
                date: foundEvent.date,
                venue: foundEvent.venue
            },
            summary: {
                totalParticipants,
                presentParticipants,
                absentParticipants
            },
            attendances
        });
    } catch (error) {
        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

// ADMIN - GET ALL ATTENDANCE
// GET /api/attendance
export const getAllAttendance = async (req, res) => {
    try {
        const {
            eventId,
            participantId,
            attended
        } = req.query;
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        }
        if (participantId) {
            filter.participant =
                participantId;
        }
        if (attended !== undefined) {
            filter.attended =
                attended === "true";
        }
        const registrationFilter = { status: "confirmed" };
        if (eventId) registrationFilter.event = eventId;
        if (participantId) registrationFilter.participant = participantId;
        const [registrations, attendanceRecords] = await Promise.all([
            registration.find(registrationFilter)
                .populate("participant", "name email username contactNumber role")
                .populate("event", "title category eventType department venue date time organizer"),
            attendance
                .find(filter)
                .populate(
                    "participant",
                    "name email username contactNumber role"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time organizer"
                )
                .populate(
                    "registration",
                    "status registeredOn"
                )
                .populate(
                    "markedBy",
                    "name email username"
                )
                .sort({
                    createdAt: -1
                })
        ]);
        const attendanceByRegistration = new Map(attendanceRecords.map((item) => [item.registration?.toString(), item]));
        let attendances = registrations.map((item) => attendanceByRegistration.get(item._id.toString()) || {
            _id: `unmarked-${item._id}`,
            event: item.event,
            participant: item.participant,
            registration: item,
            attended: false,
            markedOn: null,
            unmarked: true
        });
        if (attended !== undefined) attendances = attendances.filter((item) => item.attended === (attended === "true"));
        res.status(200).send({
            count: attendances.length,
            attendances
        });
    } catch (error) {

        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};

// ADMIN - UPDATE ATTENDANCE
// PATCH /api/attendance/:id
export const updateAttendance = async (req, res) => {
    try {
        const { attended } =
            req.body;
        if (attended === undefined) {
            return res.status(400).send({
                message:
                    "Attendance status is required"
            });
        }
        if (typeof attended !== "boolean") {
            return res.status(400).send({
                message:
                    "Attendance must be true or false"
            });
        }
        const foundAttendance =
            await attendance.findById(
                req.params.id
            );
        if (!foundAttendance) {
            return res.status(404).send({
                message:
                    "Attendance record not found"
            });
        }
        foundAttendance.attended =
            attended;
        foundAttendance.markedOn =
            attended ? new Date() : null;
        foundAttendance.markedBy =
            req.user.userId;
        await foundAttendance.save();
        const updatedAttendance =
            await attendance
                .findById(foundAttendance._id)
                .populate(
                    "participant",
                    "name email username contactNumber"
                )
                .populate(
                    "event",
                    "title category eventType department venue date time"
                )
                .populate(
                    "markedBy",
                    "name email username"
                );
        res.status(200).send({
            message:
                "Attendance updated successfully",
            attendance:
                updatedAttendance
        });
    } catch (error) {
        res.status(500).send({
            ErrorMessage: error.message
        });
    }
};