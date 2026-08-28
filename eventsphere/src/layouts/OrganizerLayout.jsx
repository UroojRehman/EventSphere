import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  ClipboardList,
  UserCheck,
  Award,
  Image,
  LogOut,
  Menu,
  X,
  Tags,
  MessageSquare,
  Megaphone,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useUnreadNotifications from "../hooks/useUnreadNotifications";
import "../layouts/AdminLayout.css";

const menuItems = [
  ["Dashboard", "/organizer/dashboard", LayoutDashboard],
  ["My events", "/organizer/my-events", CalendarDays],
  ["Create event", "/organizer/create-event", PlusCircle],
  ["Registrations", "/organizer/registrations", ClipboardList],
  ["Attendance", "/organizer/attendance", UserCheck],
  ["Certificates", "/organizer/certificates", Award],
  ["Gallery", "/organizer/gallery", Image],
  ["Categories", "/organizer/categories", Tags],
  ["Feedback", "/organizer/feedback", MessageSquare],
  ["Announcements", "/organizer/announcements", Megaphone],
  ["Notifications", "/organizer/notifications", Bell],
];

function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const unreadCount = useUnreadNotifications();

  return (
    <div className="admin-layout">
      <header className="admin-mobile-header">
        <button className="admin-menu-btn" aria-label={sidebarOpen ? "Close navigation" : "Open navigation"} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <div className="admin-mobile-logo">Event<span>Sphere</span></div>
        <span className="admin-mobile-context">Organizer workspace</span>
      </header>
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-top">
          <div className="admin-logo">Event<span>Sphere</span></div>
          <div className="admin-panel-label">ORGANIZER PORTAL</div>
        </div>
        <div className="admin-nav-heading">Workspace</div>
        <nav className="admin-nav" aria-label="Organizer navigation">
          {menuItems.map(([name, path, Icon]) => (
            <NavLink key={path} to={path} end={path === "/organizer/dashboard"} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />
              <span>{name}</span>
              {name === "Notifications" && unreadCount > 0 && <b className="notification-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase() || "O"}</div>
            <div className="admin-user-info"><strong>{user?.name || "Organizer"}</strong><span>{user?.email || "Organizer account"}</span></div>
          </div>
          <button className="admin-logout" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="admin-main"><div className="admin-content"><Outlet /></div></main>
    </div>
  );
}

export default OrganizerLayout;
