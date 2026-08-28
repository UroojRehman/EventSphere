import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import registrationService from "../../services/registrationService";
import eventService from "../../services/eventService";
import attendanceService from "../../services/attendanceService";
import certificateService from "../../services/certificateService";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuthContext();
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [discoverEvents, setDiscoverEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      registrationService.getMyRegistrations(),
      attendanceService.getMyAttendance(),
      certificateService.getMyCertificates(),
      eventService.getUpcomingEvents(),
    ]).then(([registrationResponse, attendanceResponse, certificateResponse, eventResponse]) => {
      setRegistrations(registrationResponse.registrations || []);
      setAttendance(attendanceResponse.attendances || []);
      setCertificates(certificateResponse.certificates || []);
      setDiscoverEvents((eventResponse.events || []).slice(0, 4));
    });
  }, []);

  const upcomingEvents = registrations
    .filter((item) => item.status === "confirmed" || item.status === "waitlist")
    .map((item) => item.event)
    .filter(Boolean)
    .slice(0, 3);
  const stats = [
    { icon: CalendarDays, value: registrations.length, label: "Registered Events" },
    { icon: CheckCircle2, value: attendance.filter((item) => item.attended).length, label: "Attended" },
    { icon: Award, value: certificates.length, label: "Certificates" },
    { icon: TrendingUp, value: attendance.length ? `${Math.round((attendance.filter((item) => item.attended).length / attendance.length) * 100)}%` : "0%", label: "Participation" },
  ];
  const recentActivity = [
    ...attendance.filter((item) => item.attended).slice(0, 2).map((item) => ({
      label: "Event attended",
      title: item.event?.title || "Campus event",
      date: item.date || item.createdAt,
    })),
    ...certificates.slice(0, 2).map((item) => ({
      label: "Certificate earned",
      title: item.event?.title || "Participation certificate",
      date: item.issuedOn || item.createdAt,
    })),
  ].slice(0, 4);

  return (
    <div className="participant-dashboard">
      <section className="participant-welcome">
        <div>
          <span className="participant-kicker">PARTICIPANT PORTAL</span>

          <h1>
            Welcome back,
            <span> {user?.name || "Student"}.</span>
          </h1>

          <p>
            Stay updated with your registrations, upcoming events and campus
            activities.
          </p>
        </div>

        <Link to="/events" className="participant-explore-btn">
          Explore Events
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="participant-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="participant-stat-card" key={stat.label}>
              <div className="participant-stat-icon">
                <Icon size={19} />
              </div>

              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="participant-activity-panel">
        <div className="participant-section-heading">
          <div>
            <span>RECENT ACTIVITY</span>
            <h2>Your campus journey</h2>
          </div>
          <Link to="/participant/attendance">View activity <ArrowRight size={14} /></Link>
        </div>
        <div className="participant-activity-list">
          {recentActivity.length ? recentActivity.map((activity, index) => (
            <article key={`${activity.label}-${activity.title}-${index}`}>
              <CheckCircle2 size={17} />
              <div><span>{activity.label}</span><strong>{activity.title}</strong></div>
              <time>{activity.date ? new Date(activity.date).toLocaleDateString() : "Recently"}</time>
            </article>
          )) : <p>No recent activity yet. Register for an event to get started.</p>}
        </div>
      </section>

      <section className="participant-discover-panel">
        <div className="participant-section-heading">
          <div>
            <span>DISCOVER & REGISTER</span>
            <h2>Find your next event</h2>
          </div>
          <Link to="/events">Browse all <ArrowRight size={14} /></Link>
        </div>

        <div className="participant-discover-grid">
          {discoverEvents.map((event) => (
            <article className="participant-discover-card" key={event._id}>
              <div className="participant-discover-date">
                <CalendarDays size={16} />
                <strong>{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
              </div>
              <span>{event.category || "Campus event"}</span>
              <h3>{event.title}</h3>
              <p><MapPin size={12} /> {event.venue || "Campus venue"}</p>
              <Link to={`/participant/events/${event._id}/register`}>
                Register now
                <ArrowRight size={13} />
              </Link>
            </article>
          ))}
          {!discoverEvents.length && <p className="participant-discover-empty">No upcoming events are available right now.</p>}
        </div>
      </section>

      <section className="participant-dashboard-grid">
        <div className="participant-upcoming">
          <div className="participant-section-heading">
            <div>
              <span>UPCOMING</span>
              <h2>Your next events</h2>
            </div>

            <Link to="/participant/my-events">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="participant-event-list">
            {upcomingEvents.map((event) => (
              <article
                className="participant-event-item"
                key={event.title}
              >
                <div className="participant-event-date">
                  <CalendarDays size={17} />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>

                <div className="participant-event-content">
                  <span>{event.category}</span>
                  <h3>{event.title}</h3>

                  <div className="participant-event-meta">
                    <span>
                      <Clock3 size={13} />
                      {event.time}
                    </span>

                    <span>
                      <MapPin size={13} />
                      {event.venue}
                    </span>
                  </div>
                </div>

                <ArrowRight className="participant-event-arrow" size={17} />
              </article>
            ))}
          </div>
        </div>

        <div className="participant-quick-card">
          <div className="participant-quick-icon">
            <Award size={22} />
          </div>

          <span>ACHIEVEMENTS</span>

          <h2>
            Keep building your
            <strong> campus journey.</strong>
          </h2>

          <p>
            Attend events, collect certificates and make every campus
            experience count.
          </p>

          <Link to="/participant/certificates">
            View Certificates
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;