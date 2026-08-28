import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Plus, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import eventService from "../../services/eventService";
import feedbackService from "../../services/feedbackService";
import "./Dashboard.css";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [averageRating, setAverageRating] = useState("0.0");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([eventService.getMyEvents(), feedbackService.getOrganizerFeedback()])
      .then(([eventResponse, feedbackResponse]) => {
        setEvents(eventResponse.events || []);
        setAverageRating(Number(feedbackResponse.averageRating || 0).toFixed(1));
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date()).slice(0, 3);
  const stats = [
    [CalendarDays, events.length, "Total events", "Live from backend"],
    [Users, events.reduce((total, event) => total + (event.seatsBooked || 0), 0), "Registrations", "Live from backend"],
    [CheckCircle2, events.filter((event) => event.status === "approved").length, "Published", "Live from backend"],
    [Clock3, events.filter((event) => event.status === "pending").length, "Pending", "Needs review"],
    [Star, averageRating, "Average rating", "Live from feedback"],
  ];

  return (
    <div className="organizer-dashboard">
      <div className="organizer-dashboard-container">
        <section className="organizer-dashboard-header">
          <div><span className="organizer-dashboard-kicker">ORGANIZER PORTAL</span><h1>Welcome back,<span> Organizer.</span></h1><p>Manage your events, registrations and campus activities from one place.</p></div>
          <Link to="/organizer/create-event" className="organizer-create-btn"><Plus size={17} />Create event</Link>
        </section>
        {error && <p className="organizer-error-message">{error}</p>}
        <section className="organizer-stats">
          {stats.map(([Icon, value, label, detail]) => <article className="organizer-stat-card" key={label}><div className="organizer-stat-top"><div className="organizer-stat-icon"><Icon size={19} /></div><span>{detail}</span></div><strong>{value}</strong><p>{label}</p></article>)}
        </section>
        <section className="organizer-dashboard-content">
          <div className="organizer-events-panel">
            <div className="organizer-panel-header"><div><span>01 — EVENT MANAGEMENT</span><h2>Upcoming events</h2></div><Link to="/organizer/my-events">View all<ArrowRight size={15} /></Link></div>
            <div className="organizer-events-list">
              {upcomingEvents.map((event, index) => <article className="organizer-event-row" key={event._id}><div className="organizer-event-number">0{index + 1}</div>{event.image && <img className="organizer-dashboard-event-image" src={event.image} alt="" />}<div className="organizer-event-main"><h3>{event.title}</h3><div className="organizer-event-meta"><span><CalendarDays size={13} />{new Date(event.date).toLocaleDateString()}</span><span><Clock3 size={13} />{event.time}</span></div></div><div className="organizer-event-registration"><strong>{event.seatsBooked || 0}</strong><span>Registrations</span></div><span className={`organizer-status ${event.status === "approved" ? "published" : "pending"}`}>{event.status.replace("_", " ")}</span></article>)}
            </div>
          </div>
          <aside className="organizer-quick-panel"><div className="organizer-panel-header"><div><span>02 — QUICK ACTIONS</span><h2>Manage</h2></div></div><div className="organizer-quick-actions"><Link to="/organizer/create-event"><Plus size={18} /><div><strong>Create new event</strong><span>Publish a new campus event</span></div><ArrowRight size={15} /></Link><Link to="/organizer/registrations"><Users size={18} /><div><strong>View registrations</strong><span>Manage event participants</span></div><ArrowRight size={15} /></Link><Link to="/organizer/attendance"><CheckCircle2 size={18} /><div><strong>Manage attendance</strong><span>Track participant attendance</span></div><ArrowRight size={15} /></Link></div></aside>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
