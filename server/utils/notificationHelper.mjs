import notification from "../Model/notification.mjs";
import { emitRealtime } from "./realtime.mjs";


// ======================================================
// CREATE NOTIFICATION HELPER
// ======================================================

export const createNotification = async ({
    recipient,
    type,
    title = null,
    message,
    event = null,
    registration = null
}) => {

    try {

        // ==================================================
        // VALIDATION
        // ==================================================

        if (!recipient || !type || !message) {

            throw new Error(
                "Recipient, notification type and message are required"
            );
        }


        // ==================================================
        // AUTO TITLE
        // ==================================================

        let notificationTitle = title;

        if (!notificationTitle) {

            const titles = {

                registration_confirmed:
                    "Registration Confirmed",

                registration_waitlist:
                    "Added to Waitlist",

                registration_cancelled:
                    "Registration Cancelled",

                registration_rejected:
                    "Registration Rejected",

                waitlist_promoted:
                    "Waitlist Promotion",

                event_update:
                    "Event Updated",

                event_reminder:
                    "Event Reminder",

                event_approved:
                    "Event Approved",

                event_rejected:
                    "Event Rejected",

                event_rescheduled:
                    "Event Rescheduled",

                announcement:
                    "Announcement"
            };


            notificationTitle =
                titles[type] || "Notification";
        }


        // ==================================================
        // CREATE NOTIFICATION
        // ==================================================

        const newNotification =
            new notification({

                recipient,

                type,

                title: notificationTitle,

                message,

                event,

                registration

            });


        // ==================================================
        // SAVE
        // ==================================================

        await newNotification.save();
        emitRealtime(recipient, { type: "notification", notification: newNotification });


        // ==================================================
        // RETURN CREATED NOTIFICATION
        // ==================================================

        return newNotification;


    } catch (error) {

        console.error(
            "Notification creation error:",
            error.message
        );

        return null;
    }
};