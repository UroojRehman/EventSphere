import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CheckCircle2,
  MessageSquare,
  Image,
  Megaphone,
  BarChart3,
  Tags,
  SlidersHorizontal,
  Contact,
  Inbox,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import useUnreadNotifications from "../hooks/useUnreadNotifications";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const unreadCount = useUnreadNotifications();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Events",
      path: "/admin/events",
      icon: CalendarDays,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Approvals",
      path: "/admin/event-approval",
      icon: CheckCircle2,
    },
    {
      name: "Feedback",
      path: "/admin/feedback",
      icon: MessageSquare,
    },
    {
      name: "Gallery",
      path: "/admin/gallery",
      icon: Image,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Event filters",
      path: "/admin/event-filters",
      icon: SlidersHorizontal,
    },
    {
      name: "Contact details",
      path: "/admin/contact-settings",
      icon: Contact,
    },
    {
      name: "Messages",
      path: "/admin/contact-messages",
      icon: Inbox,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },
  ];

  return (
    <div className="admin-layout">
      {/* MOBILE HEADER */}
      <header className="admin-mobile-header">
        <button
          className="admin-menu-btn"
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <div className="admin-mobile-logo">
          Event<span>Sphere</span>
        </div>
        <span className="admin-mobile-context">Admin control center</span>
      </header>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-top">
          <div className="admin-logo">
            Event<span>Sphere</span>
          </div>

          <div className="admin-panel-label">
            ADMIN PANEL
          </div>
        </div>

        <div className="admin-nav-heading">Workspace</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
                {item.name === "Notifications" && unreadCount > 0 && <b className="notification-nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</b>}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="admin-user-info">
              <strong>{user?.name || "Administrator"}</strong>
              <span>{user?.email || "Admin account"}</span>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;