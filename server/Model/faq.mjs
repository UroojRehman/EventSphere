import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
        category: { type: String, default: "General", trim: true },
        status: { type: String, enum: ["published", "draft"], default: "published" },
        sortOrder: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
    },
    { timestamps: true }
);

export default mongoose.model("faq", faqSchema);
