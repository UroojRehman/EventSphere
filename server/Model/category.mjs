import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        kind: {
            type: String,
            enum: ["category", "department", "eventType"],
            default: "category",
            index: true
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        deletionRequested: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("category", categorySchema);
