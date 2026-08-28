import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
    {
        // ======================================================
        // RECIPIENT
        // ======================================================

        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },


        // ======================================================
        // NOTIFICATION TYPE
        // ======================================================

        type: {
            type: String,
            enum: [
                "registration_confirmed",
                "registration_waitlist",
                "registration_cancelled",
                "registration_rejected",
                "event_reminder",
                "waitlist_promoted",
                "event_update",
                "event_approved",
                "event_rejected"
                ,"event_rescheduled",
                "announcement"
            ],
            required: true
        },


        // ======================================================
        // NOTIFICATION TITLE
        // ======================================================

        title: {
            type: String,
            required: true,
            trim: true
        },


        // ======================================================
        // NOTIFICATION MESSAGE
        // ======================================================

        message: {
            type: String,
            required: true,
            trim: true
        },


        // ======================================================
        // RELATED EVENT
        // ======================================================

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "event",
            default: null
        },


        // ======================================================
        // RELATED REGISTRATION
        // ======================================================

        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "registration",
            default: null
        },


        // ======================================================
        // READ STATUS
        // ======================================================

        isRead: {
            type: Boolean,
            default: false
        },


        // ======================================================
        // READ TIME
        // ======================================================

        readAt: {
            type: Date,
            default: null
        }
    },


    // ======================================================
    // TIMESTAMPS
    // ======================================================

    {
        timestamps: true
    }
);


// ======================================================
// INDEXES
// ======================================================

notificationSchema.index({
    recipient: 1,
    createdAt: -1
});


notificationSchema.index({
    recipient: 1,
    isRead: 1
});


// ======================================================
// EXPORT
// ======================================================

export default mongoose.model(
    "notification",
    notificationSchema
);