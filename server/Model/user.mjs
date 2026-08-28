import mongoose from "mongoose";

const { Schema } = mongoose;
const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        enrollmentNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        passwordResetTokenHash: {
            type: String,
            default: "",
            select: false
        },
        passwordResetExpires: {
            type: Date,
            default: null,
            select: false
        },
        twoFactorSecret: {
            type: String,
            default: "",
            select: false
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ["participant", "organizer", "admin"],
            default: "participant"
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active"
        },
        preferences: {
            eventUpdates: { type: Boolean, default: true },
            registrationReminders: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true }
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("user", userSchema);