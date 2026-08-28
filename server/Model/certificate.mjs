import mongoose from "mongoose";

const { Schema } = mongoose;

const certificateSchema = new Schema(
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

        attendance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "attendance",
            required: true
        },

        certificateUrl: {
            type: String,
            required: true
        },

        certificateNumber: {
            type: String,
            required: true,
            unique: true
        },

        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        issuedOn: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

certificateSchema.index(
    {
        event: 1,
        participant: 1
    },
    {
        unique: true
    }
);

export default mongoose.model("certificate", certificateSchema);