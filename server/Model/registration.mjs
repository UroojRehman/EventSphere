import mongoose from "mongoose";

const { Schema } = mongoose;

const registrationSchema = new Schema(
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

        registeredOn: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: [
                "confirmed",
                "waitlist",
                "cancelled",
                "rejected"
            ],
            default: "confirmed"
        },

        certificateFeePaid: {
            type: Boolean,
            default: false
        },

        certificateFeeAmount: {
            type: Number,
            default: 0,
            min: 0
        },

        certificatePaymentStatus: {
            type: String,
            enum: ["not_requested", "requested", "proof_submitted", "approved", "rejected"],
            default: "not_requested"
        },

        certificatePaymentProofUrl: {
            type: String,
            default: ""
        },

        certificatePaymentRequestedOn: {
            type: Date,
            default: null
        },

        certificatePaymentReviewedOn: {
            type: Date,
            default: null
        },

        waitlistPosition: {
            type: Number,
            default: null
        },

        cancelledOn: {
            type: Date,
            default: null
        },

        cancellationReason: {
            type: String,
            default: ""
        },

        checkInToken: {
            type: String,
            unique: true,
            sparse: true,
            default: null
        }
    },
    {
        timestamps: true
    }
);


// Same participant cannot register for same event twice
registrationSchema.index(
    {
        event: 1,
        participant: 1
    },
    {
        unique: true
    }
);


// Useful for event registration listing
registrationSchema.index({
    event: 1,
    status: 1
});


// Useful for participant's registration history
registrationSchema.index({
    participant: 1,
    status: 1
});


export default mongoose.model(
    "registration",
    registrationSchema
);