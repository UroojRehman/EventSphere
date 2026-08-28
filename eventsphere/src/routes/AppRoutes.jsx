import { Routes, Route, Navigate } from "react-router-dom";

// ================= PUBLIC =================
import Home from "../pages/public/Home";
import Events from "../pages/public/Events";
import EventDetails from "../pages/public/EventDetails";
import Gallery from "../pages/public/Gallery";
import Announcements from "../pages/public/Announcements";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Faqs from "../pages/public/Faqs";
import CheckIn from "../pages/public/CheckIn";

// ================= AUTH =================
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminLogin from "../pages/auth/AdminLogin";

// ================= PARTICIPANT =================
import ParticipantDashboard from "../pages/participant/Dashboard";
import ParticipantMyEvents from "../pages/participant/MyEvents";
import EventRegistration from "../pages/participant/EventRegistration";
import ParticipantAttendance from "../pages/participant/Attendance";
import ParticipantCertificates from "../pages/participant/Certificates";
import ParticipantFeedback from "../pages/participant/Feedback";
import ParticipantBookmarks from "../pages/participant/Bookmarks";
import ParticipantNotifications from "../pages/participant/Notifications";
import ParticipantProfile from "../pages/participant/Profile";

// ================= ORGANIZER =================
import OrganizerDashboard from "../pages/organizer/Dashboard";
import OrganizerMyEvents from "../pages/organizer/MyEvents";
import CreateEvent from "../pages/organizer/CreateEvent";
import EditEvent from "../pages/organizer/EditEvent";
import Registrations from "../pages/organizer/Registrations";
import OrganizerAttendance from "../pages/organizer/Attendance";
import OrganizerCertificates from "../pages/organizer/Certificates";
import OrganizerGallery from "../pages/organizer/Gallery";

// ================= ADMIN =================
import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import AdminEvents from "../pages/admin/Events";
import EventApproval from "../pages/admin/EventApproval";
import AdminFeedback from "../pages/admin/Feedback";
import AdminGallery from "../pages/admin/Gallery";
import AdminAnnouncements from "../pages/admin/Announcements";
import Reports from "../pages/admin/Reports";
import Categories from "../pages/Categories";
import EventFilters from "../pages/admin/EventFilters";
import ContactSettings from "../pages/admin/ContactSettings";
import ContactMessages from "../pages/admin/ContactMessages";
import OrganizerFeedback from "../pages/organizer/Feedback";

// ================= LAYOUTS =================
import PublicLayout from "../layouts/PublicLayout";
import ParticipantLayout from "../layouts/ParticipantLayout";
import OrganizerLayout from "../layouts/OrganizerLayout";
import AdminLayout from "../layouts/AdminLayout";

// ================= PROTECTED ROUTE =================
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC ROUTES
      ================================================== */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/announcements"
          element={<Announcements />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/check-in" element={<CheckIn />} />
      </Route>


      {/* ==================================================
          AUTH ROUTES
      ================================================== */}

      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />


      {/* ==================================================
          PARTICIPANT ROUTES
      ================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["participant"]}>
            <ParticipantLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/participant/dashboard"
          element={<ParticipantDashboard />}
        />

        <Route
          path="/participant/my-events"
          element={<ParticipantMyEvents />}
        />

        <Route
          path="/participant/events/:id/register"
          element={<EventRegistration />}
        />

        <Route
          path="/participant/attendance"
          element={<ParticipantAttendance />}
        />

        <Route
          path="/participant/certificates"
          element={<ParticipantCertificates />}
        />

        <Route
          path="/participant/feedback"
          element={<ParticipantFeedback />}
        />

        <Route
          path="/participant/bookmarks"
          element={<ParticipantBookmarks />}
        />

        <Route
          path="/participant/notifications"
          element={<ParticipantNotifications />}
        />
        <Route
          path="/participant/profile"
          element={<ParticipantProfile />}
        />
      </Route>


      {/* ==================================================
          ORGANIZER ROUTES
      ================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
        <Route path="/organizer/events" element={<Navigate to="/organizer/my-events" replace />} />
        <Route
          path="/organizer/dashboard"
          element={<OrganizerDashboard />}
        />

        <Route
          path="/organizer/my-events"
          element={<OrganizerMyEvents />}
        />

        <Route
          path="/organizer/create-event"
          element={<CreateEvent />}
        />

        <Route
          path="/organizer/edit-event/:id"
          element={<EditEvent />}
        />

        <Route
          path="/organizer/registrations"
          element={<Registrations />}
        />

        <Route
          path="/organizer/attendance"
          element={<OrganizerAttendance />}
        />

        <Route
          path="/organizer/certificates"
          element={<OrganizerCertificates />}
        />

        <Route
          path="/organizer/gallery"
          element={<OrganizerGallery />}
        />

        <Route
          path="/organizer/categories"
          element={<Categories />}
        />
        <Route
          path="/organizer/feedback"
          element={<OrganizerFeedback />}
        />
        <Route
          path="/organizer/announcements"
          element={<AdminAnnouncements />}
        />
        <Route path="/organizer/notifications" element={<ParticipantNotifications />} />
      </Route>


      {/* ==================================================
          ADMIN ROUTES
      ================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/event-filters" element={<EventFilters />} />
        <Route path="/admin/contact-settings" element={<ContactSettings />} />
        <Route path="/admin/contact-messages" element={<ContactMessages />} />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route path="/admin/notifications" element={<ParticipantNotifications />} />

        <Route
          path="/admin/users"
          element={<Users />}
        />

        <Route
          path="/admin/events"
          element={<AdminEvents />}
        />
        <Route
          path="/admin/events/:id/edit"
          element={<EditEvent adminMode />}
        />

        <Route
          path="/admin/event-approval"
          element={<EventApproval />}
        />

        <Route
          path="/admin/feedback"
          element={<AdminFeedback />}
        />

        <Route
          path="/admin/gallery"
          element={<AdminGallery />}
        />

        <Route
          path="/admin/announcements"
          element={<AdminAnnouncements />}
        />

        <Route
          path="/admin/reports"
          element={<Reports />}
        />
      </Route>


      {/* ==================================================
          FALLBACK
      ================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;