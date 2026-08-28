import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import adminService from "../../services/adminService";
import "./Dashboard.css";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = () => Promise.all([
      eventService.getAllEventsAdmin(),
      registrationService.getAllRegistrationsAdmin(),
      adminService.getDashboard(),
    ]).then(([eventResponse, registrationResponse, dashboardResponse]) => {
      setEvents(eventResponse.events || []);
      setRegistrationCount(registrationResponse.count || 0);
      setAnalytics(dashboardResponse);
    }).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const stats = [
    { title: "Total users", value: analytics?.users?.total ?? "-", change: "Live", icon: Users },
    { title: "Approved events", value: analytics?.events?.approved ?? events.length, change: "Live", icon: CalendarDays },
    { title: "Registrations", value: registrationCount, change: "Live", icon: UserCheck },
    { title: "Pending approvals", value: analytics?.events?.pending ?? 0, change: "Needs review", icon: Clock3 },
  ];
  const recentEvents = events.slice(0, 4);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">

        <section className="admin-dashboard-header">
          <div>
            <span className="admin-kicker">
              ADMINISTRATION
            </span>

            <h1>
              Admin
              <span> dashboard.</span>
            </h1>

            <p>
              Monitor users, events, registrations and platform
              activity from one central workspace.
            </p>
          </div>

          <div className="admin-live-status">
            <Activity size={15} />
            System operational
          </div>
        </section>

        {error && <p className="admin-dashboard-error">{error}</p>}

        <section className="admin-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="admin-stat-card" key={stat.title}>
                <div className="admin-stat-top">
                  <div className="admin-stat-icon">
                    <Icon size={19} />
                  </div>

                  <span>{stat.change}</span>
                </div>

                <strong>{stat.value}</strong>
                <p>{stat.title}</p>
              </div>
            );
          })}
        </section>

        <section className="admin-dashboard-grid">

          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span>EVENT MANAGEMENT</span>
                <h2>Recent events</h2>
              </div>

              <Link to="/admin/events">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="admin-event-list">
              {recentEvents.map((event) => (
                <div className="admin-event-row" key={event._id}>
                  <div className="admin-event-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div className="admin-event-info">
                    <strong>{event.title}</strong>
                    <span>{event.organizer?.name || "Unknown organizer"}</span>
                  </div>

                  <time>{new Date(event.date).toLocaleDateString()}</time>

                  <span
                    className={`admin-status ${event.status.replace("_", "-")}`}
                  >
                    {event.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel admin-activity-panel">
            <div className="admin-panel-header">
              <div>
                <span>OVERVIEW</span>
                <h2>Platform activity</h2>
              </div>
            </div>

            <div className="admin-role-breakdown">
              {[["participant", "Students"], ["organizer", "Organizers"], ["admin", "Admins"]].map(([role, label]) => (
                <div key={role}><span>{label}</span><strong>{analytics?.users?.byRole?.[role] ?? 0}</strong></div>
              ))}
            </div>
            <div className="activity-summary"><div><TrendingUp size={16} /><strong>{analytics?.events?.pending ?? 0}</strong><span>pending event reviews</span></div></div>
          </div>
        </section>

        <section className="admin-dashboard-lower-grid">
          <div className="admin-panel">
            <div className="admin-panel-header"><div><span>DEPARTMENT PERFORMANCE</span><h2>Top departments</h2></div></div>
            <div className="admin-department-list">
              {(analytics?.topDepartments || []).map((department) => (
                <div key={department.name}><div><strong>{department.name}</strong><span>{department.events} events</span></div><b>{department.registrations} registrations</b></div>
              ))}
              {!analytics?.topDepartments?.length && <p>No department data available.</p>}
            </div>
          </div>
          <div className="admin-panel">
            <div className="admin-panel-header"><div><span>SYSTEM MONITOR</span><h2>Live alerts</h2></div></div>
            <div className="admin-alert-list">
              {(analytics?.alerts || []).map((alert) => <div key={alert}><Clock3 size={15} /><span>{alert}</span></div>)}
              {!analytics?.alerts?.length && <div><CheckCircle2 size={15} /><span>No system alerts right now.</span></div>}
            </div>
          </div>
        </section>

        <section className="admin-quick-actions">
          <div>
            <span>QUICK ACTIONS</span>
            <h2>Manage EventSphere</h2>
          </div>

          <div className="admin-action-buttons">
            <Link to="/admin/event-approval">
              <CheckCircle2 size={16} />
              Review approvals
            </Link>

            <Link to="/admin/users">
              <Users size={16} />
              Manage users
            </Link>

            <Link to="/admin/reports">
              <TrendingUp size={16} />
              View reports
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;