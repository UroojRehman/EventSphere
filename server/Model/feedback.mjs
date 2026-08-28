import mongoose from "mongoose";

const { Schema } = mongoose;

const feedbackSchema = new Schema(
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

        userType: {
            type: String,
            enum: ["participant", "organizer", "visitor"],
            default: "participant"
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comments: {
            type: String,
            trim: true,
            default: ""
        },

        venueRating: {
            type: Number,
            min: 1,
            max: 5
        },

        coordinationRating: {
            type: Number,
            min: 1,
            max: 5
        },

        technicalRating: {
            type: Number,
            min: 1,
            max: 5
        },

        hospitalityRating: {
            type: Number,
            min: 1,
            max: 5
        },

        submittedOn: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);


// One feedback per participant per event
feedbackSchema.index(
    {
        event: 1,
        participant: 1
    },
    {
        unique: true
    }
);


export default mongoose.model(
    "feedback",
    feedbackSchema
);