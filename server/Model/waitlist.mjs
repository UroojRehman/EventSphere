import mongoose from "mongoose";

const { Schema } = mongoose;

const waitlistSchema = new Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "event",
            required: true
        },

        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        position: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "waiting",
                "promoted",
                "cancelled"
            ],
            default: "waiting"
        },

        joinedAt: {
            type: Date,
            default: Date.now
        },

        promotedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

waitlistSchema.index(
    {
        event: 1,
        participant: 1
    },
    {
        unique: true
    }
);

waitlistSchema.index({
    event: 1,
    status: 1,
    position: 1
});

export default mongoose.model(
    "waitlist",
    waitlistSchema
);