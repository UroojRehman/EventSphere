import inquiry from "../Model/inquiry.mjs";
import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";

export const createInquiry = async (req, res) => {
    try {
        const { eventId, subject, message } = req.body;
        if (!eventId || !subject?.trim() || !message?.trim()) return res.status(400).send({ message: "Event, subject and message are required" });
        const foundEvent = await event.findById(eventId);
        if (!foundEvent) return res.status(404).send({ message: "Event not found" });
        const registered = await registration.exists({ event: eventId, participant: req.user.userId, status: { $in: ["confirmed", "waitlist"] } });
        if (!registered) return res.status(403).send({ message: "You must be registered for this event" });
        const created = await inquiry.create({ event: eventId, participant: req.user.userId, organizer: foundEvent.organizer, subject: subject.trim(), message: message.trim() });
        res.status(201).send({ inquiry: created });
    } catch (error) { res.status(500).send({ ErrorMessage: error.message }); }
};

export const getOrganizerInquiries = async (req, res) => {
    try {
        const items = await inquiry.find({ organizer: req.user.userId }).populate("event", "title").populate("participant", "name email").sort({ createdAt: -1 });
        res.status(200).send({ inquiries: items });
    } catch (error) { res.status(500).send({ ErrorMessage: error.message }); }
};

export const contactParticipant = async (req, res) => {
    try {
        const { registrationId, message } = req.body;
        const foundRegistration = await registration.findById(registrationId).populate("event", "organizer");
        if (!foundRegistration || foundRegistration.event.organizer.toString() !== req.user.userId.toString()) return res.status(404).send({ message: "Registration not found" });
        if (!message?.trim()) return res.status(400).send({ message: "Message is required" });
        const created = await inquiry.create({ event: foundRegistration.event._id, participant: foundRegistration.participant, organizer: req.user.userId, subject: "Message from event organizer", message: message.trim(), status: "replied" });
        res.status(201).send({ inquiry: created });
    } catch (error) { res.status(500).send({ ErrorMessage: error.message }); }
};

export const replyToInquiry = async (req, res) => {
    try {
        const item = await inquiry.findOne({ _id: req.params.id, organizer: req.user.userId });
        if (!item) return res.status(404).send({ message: "Inquiry not found" });
        if (!req.body.reply?.trim()) return res.status(400).send({ message: "Reply is required" });
        item.reply = req.body.reply.trim();
        item.status = "replied";
        await item.save();
        res.status(200).send({ inquiry: item });
    } catch (error) { res.status(500).send({ ErrorMessage: error.message }); }
};
