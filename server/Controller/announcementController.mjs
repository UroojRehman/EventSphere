import announcement from "../Model/announcement.mjs";
import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import { createNotification } from "../utils/notificationHelper.mjs";
import user from "../Model/user.mjs";

export const getAnnouncements = async (req, res) => {
    try {
        const filter = req.query.status === "published"
            ? { status: "published", $and: [{ $or: [{ targetRoles: { $size: 0 } }, { targetRoles: { $exists: false } }] }, { $or: [{ targetUsers: { $size: 0 } }, { targetUsers: { $exists: false } }] }] }
            : {};
        const announcements = await announcement.find(filter)
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.status(200).send({ count: announcements.length, announcements });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const { title, category, text, status = "draft", eventId, targetRoles = [], targetUserEmails = [] } = req.body;
        if (!title || !category || !text) {
            return res.status(400).send({ message: "Title, category and text are required" });
        }
        if (eventId) {
            const ownedEvent = await event.findOne({ _id: eventId, organizer: req.user.userId });
            if (!ownedEvent && req.user.role !== "admin") return res.status(403).send({ message: "You can only announce for your own events" });
        }
        const targetUsers = req.user.role === "admin" && Array.isArray(targetUserEmails)
            ? (await user.find({ email: { $in: targetUserEmails }, status: "active" }).select("_id")).map((item) => item._id)
            : [];
        const roles = req.user.role === "admin" && Array.isArray(targetRoles)
            ? targetRoles.filter((role) => ["participant", "organizer", "admin"].includes(role))
            : [];
        const created = await announcement.create({
            title,
            category,
            text,
            status,
            createdBy: req.user.userId,
            event: eventId || undefined,
            targetRoles: roles,
            targetUsers
        });
        if (status === "published" && req.user.role === "admin" && (roles.length || targetUsers.length)) {
            const recipients = await user.find({ $or: [{ role: { $in: roles } }, { _id: { $in: targetUsers } }], status: "active" }).select("_id");
            for (const recipient of recipients) await createNotification({ recipient: recipient._id, type: "announcement", title, message: text });
        }
        if (status === "published" && eventId) {
            const registrations = await registration.find({ event: eventId, status: { $in: ["confirmed", "waitlist"] } });
            for (const record of registrations) {
                await createNotification({ recipient: record.participant, type: "announcement", message: title, event: eventId });
            }
        }
        res.status(201).send({ message: "Announcement created successfully", announcement: created });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const updated = await announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).send({ message: "Announcement not found" });
        res.status(200).send({ message: "Announcement updated successfully", announcement: updated });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const deleted = await announcement.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).send({ message: "Announcement not found" });
        res.status(200).send({ message: "Announcement deleted successfully" });
    } catch (error) {
        res.status(500).send({ ErrorMessage: error.message });
    }
};
