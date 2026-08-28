import mongoose from "mongoose";

const { Schema } = mongoose;

const eventSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        eventType: {
            type: String,
            required: true,
            trim: true
        },

        department: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        venue: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            default: ""
        },

        timezone: {
            type: String,
            default: "UTC",
            trim: true
        },

        maxParticipants: {
            type: Number,
            required: true,
            min: 1
        },

        seatsBooked: {
            type: Number,
            default: 0,
            min: 0
        },

        registrationDeadline: {
            type: Date,
            required: true
        },

        banner: {
            type: String,
            default: ""
        },

        rulebook: {
            type: String,
            default: ""
        },

        promotionCaption: {
            type: String,
            default: ""
        },

        hashtags: {
            type: [String],
            default: []
        },

        bookmarkedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ],

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "rejected",
                "changes_requested",
                "cancelled"
            ],
            default: "pending"
        },

        adminComment: {
            type: String,
            default: ""
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    {
        timestamps: true
    }
);

eventSchema.index({
    title: "text",
    description: "text",
    venue: "text",
    category: "text",
    eventType: "text",
    department: "text"
});

export default mongoose.model("event", eventSchema);