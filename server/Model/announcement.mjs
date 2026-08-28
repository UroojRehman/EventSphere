import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        text: { type: String, required: true, trim: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: "event" },
        status: {
            type: String,
            enum: ["published", "draft"],
            default: "draft"
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        targetRoles: { type: [String], default: [] },
        targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }]
    },
    { timestamps: true }
);

export default mongoose.model("announcement", announcementSchema);
