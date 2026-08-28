import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "event", required: true },
    participant: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    reply: { type: String, default: "", trim: true },
    status: { type: String, enum: ["open", "replied", "closed"], default: "open" }
}, { timestamps: true });

export default mongoose.model("inquiry", inquirySchema);
