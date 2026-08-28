import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import registrationService from "../../services/registrationService";
import "./MyEvents.css";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const loadEvents = async () => {
    const response = await registrationService.getMyRegistrations();
    setEvents((response.registrations || []).map((item) => ({
      registrationId: item._id,
      id: item.event?._id,
      title: item.event?.title || "Event",
      category: item.event?.category || "",
      department: item.event?.department || "",
      date: item.event?.date ? new Date(item.event.date).toLocaleDateString() : "-",
      time: item.event?.time || "",
      location: item.event?.venue || "",
      status: item.status,
    })));
  };

  useEffect(() => {
    loadEvents().catch((requestError) => setError(requestError.message));
  }, []);

  const filteredEvents = events.filter((event) => (
    `${event.title} ${event.category} ${event.department} ${event.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || event.category === category) &&
    (department === "All" || event.department === department) &&
    (status === "All" || event.status === status) &&
    (!date || event.date === new Date(`${date}T00:00:00`).toLocaleDateString())
  ));

  const cancelRegistration = async (registrationId) => {
    try {
      setError("");
      await registrationService.cancelRegistration(registrationId);
      await loadEvents();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const categories = ["All", ...new Set(events.map((event) => event.category).filter(Boolean))];
  const departments = ["All", ...new Set(events.map((event) => event.department).filter(Boolean))];

  return (
    <div className="participant-my-events">
      <div className="participant-my-events-container">
        <div className="my-events-header">
          <div>
            <span>PARTICIPANT / MY EVENTS</span>
            <h1>
              Your <strong>events.</strong>
            </h1>
            <p>Manage your registered and upcoming campus events.</p>
          </div>

          <Link to="/events">
            Discover more
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="my-events-toolbar">
          <div className="my-events-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search your events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlist">Waitlist</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Filter by date" />

          <span>{filteredEvents.length} events</span>
        </div>

        {error && <p className="participant-my-events-error">{error}</p>}

        <div className="my-events-grid">
          {filteredEvents.map((event) => (
            <article className="my-event-card" key={event.title}>
              <div className="my-event-top">
                <span>{event.category}</span>
                <b>{event.status}</b>
              </div>

              <h2>{event.title}</h2>

              <div className="my-event-details">
                <span>
                  <CalendarDays size={14} />
                  {event.date}
                </span>

                <span>
                  <Clock3 size={14} />
                  {event.time}
                </span>

                <span>
                  <MapPin size={14} />
                  {event.location}
                </span>
              </div>

              <Link to={`/participant/events/${event.id}/register`}>
                View details
                <ArrowRight size={14} />
              </Link>
              {(event.status === "confirmed" || event.status === "waitlist") && (
                <button type="button" onClick={() => window.confirm("Cancel this registration?") && cancelRegistration(event.registrationId)}>
                  Cancel registration
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyEvents;