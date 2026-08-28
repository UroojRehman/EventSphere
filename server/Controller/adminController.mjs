import event from "../Model/event.mjs";
import registration from "../Model/registration.mjs";
import user from "../Model/user.mjs";
import media from "../Model/media.mjs";
import siteSettings from "../Model/siteSettings.mjs";
import contactMessage from "../Model/contactMessage.mjs";
import certificate from "../Model/certificate.mjs";
import PDFDocument from "pdfkit";

export const getContactMessages = async (req, res) => {
    try {
        const messages = await contactMessage.find().sort({ createdAt: -1 }).lean();
        res.status(200).send({ messages });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const buildReport = async () => {
    const [events, registrationCount, attendanceCount, feedbackSummary, usersByMonth, certificateCount, registrationsByMonth, categoryTotals] = await Promise.all([
        event.find({ status: "approved" }).select("title category department eventType seatsBooked maxParticipants date").sort({ date: -1 }).lean(),
        registration.countDocuments({ status: { $in: ["confirmed", "waitlist"] } }),
        (await import("../Model/attendance.mjs")).default.countDocuments({ attended: true }),
        (await import("../Model/feedback.mjs")).default.aggregate([{ $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$rating" } } }]),
        user.aggregate([
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),
        certificate.countDocuments()
        ,registration.aggregate([
            { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]),
        event.aggregate([
            { $match: { status: "approved" } },
            { $group: { _id: "$category", registrations: { $sum: "$seatsBooked" } } },
            { $sort: { registrations: -1 } }
        ])
    ]);
    return {
        summary: {
            events: events.length,
            registrations: registrationCount,
            attendance: attendanceCount,
            feedback: feedbackSummary[0]?.count || 0,
            averageRating: Number((feedbackSummary[0]?.average || 0).toFixed(2)),
            certificates: certificateCount
        },
        usersByMonth,
        registrationsByMonth,
        categoryTotals,
        events
    };
};

export const getReportData = async (_req, res) => {
    try { res.status(200).send(await buildReport()); }
    catch (error) { res.status(500).send({ message: error.message }); }
};

export const exportReports = async (req, res) => {
    try {
        const report = await buildReport();
        if (req.query.format === "pdf") {
            const document = new PDFDocument({ margin: 40 });
            const chunks = [];
            document.on("data", (chunk) => chunks.push(chunk));
            document.on("end", () => {
                res.type("application/pdf").attachment("eventsphere-report.pdf").send(Buffer.concat(chunks));
            });
            document.fontSize(20).text("EventSphere Platform Report");
            document.moveDown().fontSize(11).text(`Events: ${report.summary.events}`);
            document.text(`Registrations: ${report.summary.registrations}`);
            document.text(`Attendance: ${report.summary.attendance}`);
            document.text(`Feedback entries: ${report.summary.feedback}`);
            document.text(`Average rating: ${report.summary.averageRating}`);
            document.text(`Certificates issued: ${report.summary.certificates}`);
            document.moveDown().fontSize(14).text("Approved events");
            report.events.forEach((item) => document.fontSize(10).text(`${item.title} | ${item.category} | ${item.department} | ${item.seatsBooked}/${item.maxParticipants}`));
            document.end();
            return;
        }

        if (req.query.format === "xlsx") {
            const rows = [
                ["Event", "Category", "Department", "Event Type", "Registrations", "Capacity", "Date"],
                ...report.events.map((item) => [item.title, item.category, item.department, item.eventType, item.seatsBooked, item.maxParticipants, item.date?.toISOString?.() || item.date])
            ];
            const escapeXml = (value) => String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
            const worksheet = rows.map((row) => `<Row>${row.map((value) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`).join("")}</Row>`).join("");
            const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Events"><Table>${worksheet}</Table></Worksheet></Workbook>`;
            return res.type("application/vnd.ms-excel").attachment("eventsphere-report.xls").send(workbook);
        }

        const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const rows = [
            ["Event", "Category", "Department", "Event Type", "Registrations", "Capacity", "Date"],
            ...report.events.map((item) => [item.title, item.category, item.department, item.eventType, item.seatsBooked, item.maxParticipants, item.date?.toISOString?.() || item.date])
        ];
        const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
        res.type("text/csv").attachment("eventsphere-report.csv").send(csv);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const defaultContact = {
    contactEmail: "events@eventsphere.edu",
    emailTitle: "Email us",
    emailText: "For general questions and event support.",
    phone: "+92 300 0000000",
    phoneTitle: "Call support",
    phoneText: "Available during campus support hours.",
    address: "College Campus, Karachi",
    addressTitle: "Visit campus",
    country: "Pakistan",
    supportTitle: "Support hours",
    supportHours: "Monday - Friday · 9:00 AM - 5:00 PM"
};

export const getAdminContact = async (req, res) => {
    try {
        const settings = await siteSettings.findOneAndUpdate(
            { key: "default" },
            { $setOnInsert: { key: "default", ...defaultContact } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
        res.status(200).send(settings);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const updateAdminContact = async (req, res) => {
    try {
        const fields = ["contactEmail", "emailTitle", "emailText", "phone", "phoneTitle", "phoneText", "address", "addressTitle", "country", "supportTitle", "supportHours"];
        const updates = Object.fromEntries(fields.map((field) => [field, String(req.body[field] || "").trim()]));
        if (Object.values(updates).some((value) => !value)) {
            return res.status(400).send({ message: "All contact details are required" });
        }
        const settings = await siteSettings.findOneAndUpdate(
            { key: "default" },
            { $set: updates, $setOnInsert: { key: "default" } },
            { upsert: true, new: true, runValidators: true }
        ).lean();
        res.status(200).send({ message: "Contact details updated successfully", settings });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const getAdminDashboard = async (req, res) => {
    try {
        const [usersByRole, eventCounts, departmentPerformance, pendingMedia, recentRegistrations] = await Promise.all([
            user.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
            event.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            event.aggregate([
                { $match: { status: "approved" } },
                { $group: { _id: "$department", events: { $sum: 1 }, registrations: { $sum: "$seatsBooked" } } },
                { $sort: { registrations: -1, events: -1 } },
                { $limit: 5 }
            ]),
            media.countDocuments({ status: "pending" }),
            registration.find({ status: { $in: ["confirmed", "waitlist"] } })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("participant", "name")
                .populate("event", "title")
        ]);

        const roleCounts = usersByRole.reduce((result, item) => ({ ...result, [item._id]: item.count }), {});
        const statusCounts = eventCounts.reduce((result, item) => ({ ...result, [item._id]: item.count }), {});
        const alerts = [
            statusCounts.pending ? `${statusCounts.pending} event approval${statusCounts.pending === 1 ? "" : "s"} require review` : null,
            pendingMedia ? `${pendingMedia} media upload${pendingMedia === 1 ? "" : "s"} require moderation` : null,
            recentRegistrations.length ? `${recentRegistrations.length} recent registration activities detected` : null
        ].filter(Boolean);

        res.status(200).send({
            users: {
                total: Object.values(roleCounts).reduce((total, count) => total + count, 0),
                byRole: roleCounts
            },
            events: {
                total: Object.values(statusCounts).reduce((total, count) => total + count, 0),
                approved: statusCounts.approved || 0,
                pending: statusCounts.pending || 0,
                rejected: statusCounts.rejected || 0
            },
            topDepartments: departmentPerformance.map((item) => ({
                name: item._id || "Unassigned",
                events: item.events,
                registrations: item.registrations
            })),
            alerts,
            recentRegistrations: recentRegistrations.map((item) => ({
                participant: item.participant?.name || "Participant",
                event: item.event?.title || "Event",
                status: item.status,
                createdAt: item.createdAt
            }))
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
