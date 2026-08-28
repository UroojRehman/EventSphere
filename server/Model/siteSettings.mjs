import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
    {
        key: { type: String, unique: true, default: "default" },
        contactEmail: { type: String, required: true, trim: true },
        emailTitle: { type: String, required: true, trim: true },
        emailText: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        phoneTitle: { type: String, required: true, trim: true },
        phoneText: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        addressTitle: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        supportTitle: { type: String, required: true, trim: true },
        supportHours: { type: String, required: true, trim: true }
    },
    { timestamps: true }
);

export default mongoose.model("siteSettings", siteSettingsSchema);