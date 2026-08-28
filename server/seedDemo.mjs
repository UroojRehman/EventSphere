import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import user from "./Model/user.mjs";
import event from "./Model/event.mjs";
import registration from "./Model/registration.mjs";
import attendance from "./Model/attendance.mjs";
import feedback from "./Model/feedback.mjs";
import announcement from "./Model/announcement.mjs";
import media from "./Model/media.mjs";
import notification from "./Model/notification.mjs";

const DEMO_EMAILS = [
    "demo.admin@eventsphere.test",
    "demo.organizer@eventsphere.test",
    "demo.student@eventsphere.test",
    "demo.student2@eventsphere.test",
    "ali@gmail.com"
];

const imageUrls = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=90",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=90",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=90",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=90",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=90"
];

const makeDate = (date, time = "10:00") => new Date(`${date}T${time}:00`);

const seed = async () => {
    await mongoose.connect(process.env.Db_Connection);

    const password = await bcrypt.hash("Demo@12345", 10);
    const [admin, organizer, student, student2, ali] = await Promise.all([
        user.findOneAndUpdate(
            { email: DEMO_EMAILS[0] },
            { name: "Amina Rahman", username: "demo_admin", email: DEMO_EMAILS[0], contactNumber: "03001234567", department: "Student Affairs", enrollmentNumber: "DEMO-ADMIN", password, role: "admin" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ),
        user.findOneAndUpdate(
            { email: DEMO_EMAILS[1] },
            { name: "Dr. Hamza Siddiqui", username: "demo_organizer", email: DEMO_EMAILS[1], contactNumber: "03007654321", department: "Computer Science", enrollmentNumber: "DEMO-ORG", password, role: "organizer" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ),
        user.findOneAndUpdate(
            { email: DEMO_EMAILS[2] },
            { name: "Sara Ahmed", username: "demo_student", email: DEMO_EMAILS[2], contactNumber: "03001112222", department: "Computer Science", enrollmentNumber: "DEMO-STU-01", password, role: "participant" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ),
        user.findOneAndUpdate(
            { email: DEMO_EMAILS[3] },
            { name: "Bilal Hassan", username: "demo_student2", email: DEMO_EMAILS[3], contactNumber: "03003334444", department: "Business Management", enrollmentNumber: "DEMO-STU-02", password, role: "participant" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ),
        user.findOneAndUpdate(
            { email: DEMO_EMAILS[4] },
            { name: "Ali Khan", username: "ali_organizer", email: DEMO_EMAILS[4], contactNumber: "03009876543", department: "Events Management", enrollmentNumber: "ALI-ORG-01", password, role: "organizer" },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
    ]);

    const demoEventTitles = [
        "Tech Innovation Summit 2026",
        "Inter-College Sports Championship",
        "Cultural Night: Voices of Campus",
        "Modern Web Development Workshop",
        "Annual Day Leadership Forum",
        "Intercollegiate Innovation Challenge"
    ];
    const oldEvents = await event.find({ title: { $in: demoEventTitles } }).select("_id");
    const oldEventIds = oldEvents.map((item) => item._id);
    await Promise.all([
        registration.deleteMany({ event: { $in: oldEventIds } }),
        attendance.deleteMany({ event: { $in: oldEventIds } }),
        feedback.deleteMany({ event: { $in: oldEventIds } }),
        announcement.deleteMany({ event: { $in: oldEventIds } }),
        media.deleteMany({ event: { $in: oldEventIds } }),
        event.deleteMany({ _id: { $in: oldEventIds } })
    ]);

    const events = await event.insertMany([
        {
            title: demoEventTitles[0], category: "Technical Fests", eventType: "Conference", department: "Computer Science",
            description: "A practical day of emerging technology talks, student projects, and responsible innovation.", venue: "Main Auditorium, Block A",
            date: makeDate("2026-09-12", "10:00"), time: "10:00 AM", endTime: "16:00", maxParticipants: 320, seatsBooked: 2,
            registrationDeadline: makeDate("2026-09-10", "23:59"), banner: imageUrls[0], organizer: organizer._id, status: "approved",
            promotionCaption: "Meet the ideas shaping tomorrow's campus.", hashtags: ["#EventSphere", "#TechInnovation"]
        },
        {
            title: demoEventTitles[1], category: "Sports Meets", eventType: "Competition", department: "Student Affairs", description: "A spirited inter-college tournament featuring futsal, athletics, and badminton.",
            venue: "University Sports Complex", date: makeDate("2026-09-20", "09:00"), time: "09:00 AM", endTime: "18:00", maxParticipants: 450, seatsBooked: 1,
            registrationDeadline: makeDate("2026-09-17", "23:59"), banner: imageUrls[2], organizer: organizer._id, status: "approved",
            promotionCaption: "Bring your team spirit to the biggest sports meet of the semester.", hashtags: ["#CampusSports", "#PlayTogether"]
        },
        {
            title: demoEventTitles[2], category: "Cultural Events", eventType: "Annual Day", department: "Media Studies", description: "An evening of music, theatre, poetry, and student performances celebrating campus culture.",
            venue: "Open Air Theatre", date: makeDate("2026-10-03", "18:30"), time: "06:30 PM", endTime: "22:00", maxParticipants: 500, seatsBooked: 0,
            registrationDeadline: makeDate("2026-10-01", "23:59"), banner: imageUrls[1], organizer: organizer._id, status: "approved",
            promotionCaption: "One stage, many voices, one unforgettable night.", hashtags: ["#CulturalNight", "#EventSphere"]
        },
        {
            title: demoEventTitles[3], category: "Workshops and Seminars", eventType: "Workshop", department: "Software Engineering", description: "Build and deploy a modern web experience with accessible UI and production-ready APIs.",
            venue: "Innovation Lab 02", date: makeDate("2026-10-10", "11:00"), time: "11:00 AM", endTime: "14:00", maxParticipants: 80, seatsBooked: 0,
            registrationDeadline: makeDate("2026-10-08", "23:59"), banner: imageUrls[3], organizer: organizer._id, status: "approved",
            promotionCaption: "Turn your next idea into a working web product.", hashtags: ["#WebDevelopment", "#BuildOnCampus"]
        },
        {
            title: demoEventTitles[4], category: "Annual Day Functions", eventType: "Seminar", department: "Business Management", description: "Student leaders and industry guests discuss communication, careers, and purposeful leadership.",
            venue: "Conference Hall", date: makeDate("2026-08-12", "13:00"), time: "01:00 PM", endTime: "16:00", maxParticipants: 180, seatsBooked: 0,
            registrationDeadline: makeDate("2026-08-10", "23:59"), banner: imageUrls[1], organizer: organizer._id, status: "approved"
        },
        {
            title: demoEventTitles[5], category: "Intercollegiate Competitions", eventType: "Competition", department: "Innovation Lab", description: "Teams from partner colleges solve a real-world challenge through research, design, and rapid prototyping.",
            venue: "Innovation Lab", date: makeDate("2026-10-24", "10:00"), time: "10:00 AM", endTime: "17:00", maxParticipants: 150, seatsBooked: 0,
            registrationDeadline: makeDate("2026-10-20", "23:59"), banner: imageUrls[5], organizer: organizer._id, status: "approved",
            promotionCaption: "Ideas meet across campuses.", hashtags: ["#InnovationChallenge", "#Intercollegiate"]
        }
    ]);

    const [summit, sports, cultural, workshop, pastEvent, competition] = events;
    const registrations = await registration.insertMany([
        { event: summit._id, participant: student._id, status: "confirmed", checkInToken: "demo-checkin-1" },
        { event: summit._id, participant: student2._id, status: "confirmed", checkInToken: "demo-checkin-2" },
        { event: cultural._id, participant: student._id, status: "confirmed", checkInToken: "demo-checkin-3" },
        { event: sports._id, participant: student2._id, status: "confirmed", checkInToken: "demo-checkin-4" },
        { event: pastEvent._id, participant: student._id, status: "confirmed", checkInToken: "demo-checkin-5" }
    ]);

    await attendance.insertMany([
        { event: pastEvent._id, participant: student._id, registration: registrations[4]._id, attended: true, markedOn: makeDate("2026-08-12", "16:00"), markedBy: organizer._id },
        { event: summit._id, participant: student._id, registration: registrations[0]._id, attended: false }
    ]);

    await feedback.insertMany([
        { event: pastEvent._id, participant: student._id, userType: "participant", rating: 5, venueRating: 4, coordinationRating: 5, technicalRating: 5, hospitalityRating: 4, comments: "Excellent speakers and a very well-organized leadership session." },
        { event: pastEvent._id, participant: student2._id, userType: "participant", rating: 4, venueRating: 4, coordinationRating: 4, technicalRating: 4, hospitalityRating: 5, comments: "Useful discussions and friendly organizers." }
    ]);

    await announcement.insertMany([
        { title: "Registration is open for the Tech Innovation Summit", category: "Important", text: "Reserve your place for talks, demos, and student projects on September 12.", event: summit._id, status: "published", createdBy: admin._id },
        { title: "Cultural Night performers announced", category: "Campus", text: "Meet the student performers taking the Open Air Theatre stage this October.", event: cultural._id, status: "published", createdBy: admin._id },
        { title: "Workshop seats are limited", category: "Reminder", text: "The Modern Web Development Workshop has only 80 places available.", event: workshop._id, status: "published", createdBy: organizer._id }
    ]);

    await media.insertMany([
        { event: pastEvent._id, uploadedBy: organizer._id, title: "Leadership Forum highlights", description: "A look back at the annual leadership forum.", mediaType: "image", fileUrl: imageUrls[1], originalName: "leadership-forum.jpg", category: pastEvent.category, eventType: pastEvent.eventType, department: pastEvent.department, status: "approved" },
        { event: summit._id, uploadedBy: organizer._id, title: "Innovation Summit stage", description: "Students presenting ideas on the main stage.", mediaType: "image", fileUrl: imageUrls[0], originalName: "innovation-stage.jpg", category: summit.category, eventType: summit.eventType, department: summit.department, status: "approved" },
        { event: sports._id, uploadedBy: organizer._id, title: "Sports Championship reel", description: "A short preview of the inter-college competition.", mediaType: "video", fileUrl: "https://cdn.coverr.co/videos/coverr-a-man-playing-basketball-1574/1080p.mp4", originalName: "sports-reel.mp4", category: sports.category, eventType: sports.eventType, department: sports.department, status: "approved" }
        ,{ event: cultural._id, uploadedBy: organizer._id, title: "Cultural Night performances", description: "Student performances from the campus cultural evening.", mediaType: "image", fileUrl: imageUrls[2], originalName: "cultural-night.jpg", category: cultural.category, eventType: cultural.eventType, department: cultural.department, status: "approved" }
        ,{ event: workshop._id, uploadedBy: organizer._id, title: "Web workshop in progress", description: "Students building accessible web experiences together.", mediaType: "image", fileUrl: imageUrls[3], originalName: "web-workshop.jpg", category: workshop.category, eventType: workshop.eventType, department: workshop.department, status: "approved" }
        ,{ event: competition._id, uploadedBy: organizer._id, title: "Innovation Challenge teams", description: "Intercollegiate teams preparing their prototypes.", mediaType: "image", fileUrl: imageUrls[5], originalName: "innovation-challenge.jpg", category: competition.category, eventType: competition.eventType, department: competition.department, status: "approved" }
    ]);

    await notification.deleteMany({ recipient: { $in: [student._id, student2._id] }, message: { $regex: "Demo" } });
    await notification.insertMany([
        { recipient: student._id, event: summit._id, registration: registrations[0]._id, type: "registration_confirmed", title: "Registration confirmed", message: "Your registration for Tech Innovation Summit 2026 is confirmed.", isRead: false },
        { recipient: student._id, event: workshop._id, type: "event_update", title: "New workshop available", message: "Modern Web Development Workshop registration is now open.", isRead: false }
    ]);

    console.log("Demo data seeded successfully.");
    console.log("Demo login: demo.student@eventsphere.test / Demo@12345");
    console.log("Organizer login: demo.organizer@eventsphere.test / Demo@12345");
    console.log("Ali Organizer login: ali@gmail.com / Demo@12345");
    console.log("Admin login: demo.admin@eventsphere.test / Demo@12345");
};

seed()
    .catch((error) => {
        console.error("Demo seed failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
