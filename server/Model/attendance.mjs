import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema(
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

        registration: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "registration",
            required: true
        },

        attended: {
            type: Boolean,
            default: false
        },

        markedOn: {
            type: Date,
            default: null
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        }
    },
    {
        timestamps: true
    }
);


// One attendance record per participant per event
attendanceSchema.index(
    {
        event: 1,
        participant: 1
    },
    {
        unique: true
    }
);


export default mongoose.model(
    "attendance",
    attendanceSchema
);