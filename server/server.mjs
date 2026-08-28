

import express from 'express';
import cors from 'cors';
import { main } from './Connection/Connection.mjs';
import userRoutes from './Routes/userRoutes.mjs';
import eventRoutes from "./Routes/eventRoutes.mjs";
import registrationRoutes from './Routes/registrationRoutes.mjs';
import attendanceRoutes from './Routes/attendanceRoutes.mjs';
import certificateRoutes from './Routes/certificateRoutes.mjs';
import feedbackRoutes from './Routes/feedbackRoutes.mjs';
import mediaRoutes from './Routes/mediaRoutes.mjs';
import waitlistRoutes from './Routes/waitlistRoutes.mjs';
import notificationRoutes from './Routes/notificationRoutes.mjs';
import announcementRoutes from './Routes/announcementRoutes.mjs';
import faqRoutes from './Routes/faqRoutes.mjs';
import categoryRoutes from './Routes/categoryRoutes.mjs';
import publicRoutes from './Routes/publicRoutes.mjs';
import adminRoutes from './Routes/adminRoutes.mjs';
import inquiryRoutes from './Routes/inquiryRoutes.mjs';
import { sendUpcomingEventReminders } from './utils/reminderScheduler.mjs';
import { addRealtimeClient } from './utils/realtime.mjs';
import { authMiddleware } from './middleware/authMiddleware.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.get("/api/realtime", authMiddleware, (req, res) => {
    res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.flushHeaders();
    res.write("retry: 10000\n\n");
    const removeClient = addRealtimeClient(req.user.userId, res);
    const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 25000);
    req.on("close", () => { clearInterval(keepAlive); removeClient(); });
});

const runReminderScheduler = () => sendUpcomingEventReminders().catch((error) => console.error("Reminder scheduler failed:", error.message));
runReminderScheduler();
setInterval(runReminderScheduler, 60 * 1000);

app.get('/', (req, res) => {
    res.send('EventSphere API is running...');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});