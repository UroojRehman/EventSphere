import event from "../Model/event.mjs";
import feedback from "../Model/feedback.mjs";
import registration from "../Model/registration.mjs";
import user from "../Model/user.mjs";
import siteSettings from "../Model/siteSettings.mjs";
import contactMessage from "../Model/contactMessage.mjs";
import { sendContactEmails } from "../utils/mailer.mjs";

export const getPublicContact = async (req, res) => {
    try {
        const settings = await siteSettings.findOne({ key: "default" }).lean();
        res.status(200).send(settings || {});
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const createContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return res.status(400).send({ message: "Name, email, subject, and message are required" });
        }
        await contactMessage.create({ name, email, subject, message });
        await sendContactEmails({ name, email, subject, message });
        res.status(201).send({ message: "Your message was sent successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getPublicStats = async (req, res) => {
    try {
        const now = new Date();
        const [totalEvents, upcomingEvents, students, clubs, registrations, feedbackSummary] = await Promise.all([
            event.countDocuments({ status: "approved" }),
            event.countDocuments({ status: "approved", date: { $gte: now } }),
            user.countDocuments({ role: "participant" }),
            user.countDocuments({ role: "organizer" }),
            registration.countDocuments({ status: { $in: ["confirmed", "waitlist"] } }),
            feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        positive: {
                            $sum: {
                                $cond: [{ $gte: ["$rating", 4] }, 1, 0]
                            }
                        }
                    }
                }
            ])
        ]);

        const feedbackTotals = feedbackSummary[0] || { total: 0, positive: 0 };

        res.status(200).send({
            totalEvents,
            upcomingEvents,
            students,
            clubs,
            registrations,
            positiveFeedback: feedbackTotals.total
                ? Math.round((feedbackTotals.positive / feedbackTotals.total) * 100)
                : 0
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
