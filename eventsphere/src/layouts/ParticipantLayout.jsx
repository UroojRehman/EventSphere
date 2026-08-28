import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, UserCheck, Award, MessageSquare, Bookmark, Bell, UserRound, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useUnreadNotifications from "../hooks/useUnreadNotifications";
import "./ParticipantLayout.css";

const menuItems = [
  ["Dashboard", "/participant/dashboard", LayoutDashboard],
  ["My events", "/participant/my-events", CalendarDays],
  ["Attendance", "/participant/attendance", UserCheck],
  ["Certificates", "/participant/certificates", Award],
  ["Feedback", "/participant/feedback", MessageSquare],
  ["Bookmarks", "/participant/bookmarks", Bookmark],
  ["Notifications", "/participant/notifications", Bell],
  ["Profile", "/participant/profile", UserRound],
];

function ParticipantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const unreadCount = useUnreadNotifications();

  return (
    <div className="participant-layout">
      <header className="participant-mobile-header">
        <button className="participant-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}>{sidebarOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <div className="participant-mobile-logo">Event<span>Sphere</span></div>
        <span className="participant-mobile-context">Participant portal</span>
      </header>
      {sidebarOpen && <div className="participant-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`participant-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="participant-sidebar-top"><div className="participant-logo">Event<span>Sphere</span></div><div className="participant-portal-label">PARTICIPANT PORTAL</div></div>
        <nav className="participant-nav">
          <span className="participant-nav-heading">Your space</span>
          {menuItems.slice(0, 5).map(([name, path, Icon]) => <NavLink key={path} to={path} end={path === "/participant/dashboard"} className={({ isActive }) => `participant-nav-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}><Icon size={18} /><span>{name}</span></NavLink>)}
          <span className="participant-nav-heading">Account</span>
          {menuItems.slice(5).map(([name, path, Icon]) => <NavLink key={path} to={path} end={path === "/participant/dashboard"} className={({ isActive }) => `participant-nav-link ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}><Icon size={18} /><span>{name}</span>{name === "Notifications" && unreadCount > 0 && <b className="notification-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</b>}</NavLink>)}
        </nav>
        <div className="participant-sidebar-bottom">
          <div className="participant-user-card"><div className="participant-avatar">{user?.name?.charAt(0).toUpperCase() || "P"}</div><div className="participant-user-info"><strong>{user?.name || "Participant"}</strong><span>{user?.email || "Participant account"}</span></div></div>
          <button className="participant-logout" onClick={() => { logout(); navigate("/login"); }}><LogOut size={17} /><span>Logout</span></button>
        </div>
      </aside>
      <main className="participant-main"><div className="participant-content"><Outlet /></div></main>
    </div>
  );
}

export default ParticipantLayout;
