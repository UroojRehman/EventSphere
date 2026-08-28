import mongoose from "mongoose";

const { Schema } = mongoose;

const mediaSchema = new Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "event",
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        originalName: {
            type: String,
            default: ""
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

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "deletion_requested"],
            default: "pending"
        },

        adminComment: {
            type: String,
            default: ""
        },

        savedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ]
    },
    {
        timestamps: true
    }
);

mediaSchema.index({
    title: "text",
    description: "text",
    category: "text",
    eventType: "text",
    department: "text"
});

export default mongoose.model("media", mediaSchema);