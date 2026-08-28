
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import eventService from "../../services/eventService";
import "./MyEvents.css";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    eventService.getMyEvents().then((response) => {
      setEvents((response.events || []).map((event) => ({
        ...event,
        id: event._id,
        location: event.venue,
        registrations: event.seatsBooked || 0,
        capacity: event.maxParticipants,
        status: {
          approved: "Published",
          pending: "Pending approval",
          rejected: "Rejected",
          changes_requested: "Changes requested",
          cancelled: "Cancelled",
        }[event.status] || event.status,
        date: new Date(event.date).toLocaleDateString(),
      })));
    });
  }, []);

  const cancelEvent = async (event) => {
    if (!window.confirm(`Cancel ${event.title}? Registered participants will be notified.`)) return;
    try {
      setError("");
      await eventService.deleteEvent(event.id);
      setEvents((current) => current.map((item) => item.id === event.id ? { ...item, status: "Cancelled" } : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesFilter =
        filter === "All" || event.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filter]);

  return (
    <div className="organizer-events-page">
      <div className="organizer-events-container">

        {/* HEADER */}
        <section className="organizer-events-header">
          <div>
            <span className="organizer-events-kicker">
              ORGANIZER PORTAL
            </span>

            <h1>
              My
              <span> events.</span>
            </h1>

            <p>
              Create, manage and monitor all the events organized by
              your campus team.
            </p>
          </div>

          <Link
            to="/organizer/create-event"
            className="organizer-events-create"
          >
            <Plus size={17} />
            Create event
          </Link>
        </section>

        {error && <p className="organizer-error-message">{error}</p>}

        {/* SUMMARY */}
        <section className="organizer-events-summary">
          <div>
            <strong>{events.length}</strong>
            <span>Total events</span>
          </div>

          <div>
            <strong>
              {events.filter((event) => event.status === "Published").length}
            </strong>
            <span>Published</span>
          </div>

          <div>
            <strong>
              {events.reduce(
                (total, event) => total + event.registrations,
                0
              )}
            </strong>
            <span>Registrations</span>
          </div>

          <div>
            <strong>
              {events.filter((event) => event.status === "Pending approval").length}
            </strong>
            <span>Pending review</span>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="organizer-events-toolbar">

          <div className="organizer-events-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search your events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="organizer-events-filters">
            {["All", "Published", "Pending approval", "Changes requested", "Rejected"].map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section className="organizer-events-list">

          <div className="organizer-events-list-heading">
            <div>
              <span>01 — EVENT MANAGEMENT</span>
              <h2>All events</h2>
            </div>

            <p>
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="organizer-event-cards">
              {filteredEvents.map((event, index) => (
                <article
                  className="organizer-event-card"
                  key={event.id}
                >
                  <div className="organizer-event-card-top">

                    <div className="organizer-event-card-number">
                      0{index + 1}
                    </div>

                    <span
                      className={`organizer-event-status ${
                        event.status.toLowerCase()
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  {event.image && (
                    <img
                      className="organizer-event-card-image"
                      src={event.image}
                      alt={event.title}
                    />
                  )}

                  <div className="organizer-event-card-content">

                    <span className="organizer-event-category">
                      {event.category}
                    </span>

                    <h3>{event.title}</h3>

                    <div className="organizer-event-details">

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

                    <div className="organizer-event-capacity">

                      <div className="organizer-capacity-top">
                        <span>Registration capacity</span>

                        <strong>
                          {event.registrations}/{event.capacity}
                        </strong>
                      </div>

                      <div className="organizer-capacity-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              (event.registrations / event.capacity) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  </div>

                  <div className="organizer-event-card-footer">

                    <div className="organizer-event-participants">
                      <Users size={14} />

                      <span>
                        <strong>{event.registrations}</strong>
                        registered
                      </span>
                    </div>

                    <div className="organizer-event-actions">

                      <Link
                        to={`/organizer/edit-event/${event.id}`}
                        title="Edit event"
                      >
                        <Edit3 size={15} />
                      </Link>

                      <Link
                        to={`/events/${event.id}`}
                        title="View event"
                      >
                        <Eye size={15} />
                      </Link>

                      <Link
                        to="/organizer/registrations"
                        title="Registrations"
                      >
                        <ArrowRight size={15} />
                      </Link>

                      {event.status !== "Cancelled" && <button type="button" title="Cancel event" onClick={() => cancelEvent(event)}>Cancel</button>}

                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="organizer-events-empty">
              <div>
                <CheckCircle2 size={25} />
              </div>

              <h3>No events found</h3>

              <p>
                Try changing your search or filter, or create a new
                event.
              </p>

              <Link to="/organizer/create-event">
                Create event
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default MyEvents;

