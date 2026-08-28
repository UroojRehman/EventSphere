import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import notification from "../Model/notification.mjs";
import { createNotification } from "./notificationHelper.mjs";

export const sendUpcomingEventReminders = async () => {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingEvents = await event.find({ status: "approved", date: { $gte: new Date(now.toDateString()), $lte: reminderWindow } }).select("_id title date time venue").lean();
    if (!upcomingEvents.length) return;

    const eventIds = upcomingEvents.map((item) => item._id);
    const registrations = await registration.find({ event: { $in: eventIds }, status: "confirmed" }).select("event participant").populate("participant", "preferences").lean();
    for (const record of registrations) {
        const currentEvent = upcomingEvents.find((item) => item._id.toString() === record.event.toString());
        const eventDate = new Date(currentEvent.date);
        const timeMatch = String(currentEvent.time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
            let hours = Number(timeMatch[1]);
            if (timeMatch[3]?.toUpperCase() === "PM" && hours !== 12) hours += 12;
            if (timeMatch[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
            eventDate.setHours(hours, Number(timeMatch[2]), 0, 0);
        }
        if (eventDate < now || eventDate > reminderWindow || record.participant?.preferences?.registrationReminders === false) continue;
        const participantId = record.participant?._id || record.participant;
        const alreadySent = await notification.exists({ recipient: participantId, event: record.event, type: "event_reminder" });
        if (alreadySent) continue;
        await createNotification({
            recipient: participantId,
            type: "event_reminder",
            title: "Event reminder",
            message: `Reminder: "${currentEvent.title}" is coming up on ${new Date(currentEvent.date).toLocaleDateString()} at ${currentEvent.venue}.`,
            event: currentEvent._id
        });
    }
};