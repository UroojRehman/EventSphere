import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import "./EventRegistration.css";

function EventRegistration() {
  const { id } = useParams();
  const [registered, setRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [waitlistPosition, setWaitlistPosition] = useState(null);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    Promise.all([
      eventService.getEventById(id),
      registrationService.getMyRegistrations(),
    ]).then(([eventResponse, registrationResponse]) => {
      setEvent(eventResponse);
      const existing = (registrationResponse.registrations || []).find((item) => item.event?._id === id && item.status !== "cancelled");
      setRegistered(Boolean(existing));
      setRegistrationId(existing?._id || null);
      setRegistrationStatus(existing?.status || null);
      setWaitlistPosition(existing?.waitlistPosition || null);
    }).catch((requestError) => setError(requestError.message));
  }, [id]);

  const register = async () => {
    setError("");
    if (!event) {
      setError("Event details are still loading.");
      return;
    }
    if (event.status !== "approved") {
      setError("This event is not open for registration.");
      return;
    }
    if (!event.date || new Date(event.date).setHours(23, 59, 59, 999) < Date.now()) {
      setError("Registration is closed because this event has ended.");
      return;
    }
    if (registering) return;
    setRegistering(true);
    try {
      const response = await registrationService.registerForEvent(id);
      const registration = response.registration;
      setRegistered(true);
      setRegistrationId(registration?._id || null);
      setRegistrationStatus(registration?.status || "confirmed");
      setWaitlistPosition(registration?.waitlistPosition || null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRegistering(false);
    }
  };

  const cancel = async () => {
    try {
      await registrationService.cancelRegistration(registrationId);
      setRegistered(false);
      setRegistrationId(null);
      setRegistrationStatus(null);
      setWaitlistPosition(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const seatsAvailable = Math.max((event?.maxParticipants || 0) - (event?.seatsBooked || 0), 0);

  const downloadCalendar = () => {
    if (!event?.date) return;
    const timeMatch = (event.time || "00:00").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    const hours = Number(timeMatch?.[1] || 0) + (timeMatch?.[3]?.toUpperCase() === "PM" && Number(timeMatch?.[1]) !== 12 ? 12 : 0);
    const minutes = Number(timeMatch?.[2] || 0);
    const start = new Date(event.date);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const escapeText = (value) => String(value || "").replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventSphere//Campus Events//EN",
      "BEGIN:VEVENT",
      `UID:${id}@eventsphere`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `LOCATION:${escapeText(event.venue)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${escapeText(event.title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title || "event"}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-registration-page">
      <div className="event-registration-container">

        {/* BACK */}
        <Link to="/participant/my-events" className="event-registration-back">
          <ArrowLeft size={15} />
          Back to my events
        </Link>

        {/* HEADER */}
        <section className="registration-header">
          <div>
            <span className="registration-kicker">
              TECHNICAL EVENT
            </span>

            <h1>
              {event?.title || "Event details"}
            </h1>

            <p>
              {event?.description || "Review the event details and reserve your place."}
            </p>
          </div>

          <div className="registration-status">
            <CheckCircle2 size={16} />
            {registered ? "Registration Confirmed" : "Registration Open"}
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="registration-grid">

          {/* EVENT INFO */}
          <div className="registration-main-card">

            <div className="registration-image" style={event?.image ? { backgroundImage: `url(${event.image})` } : undefined}>
              <div className="registration-image-overlay">
                <span>EVENTSPHERE</span>
                <strong>INNOVATION</strong>
                <b>SUMMIT 2026</b>
              </div>
            </div>

            <div className="registration-description">
              <span>ABOUT THE EVENT</span>

              <h2>{event?.title || "Event information"}</h2>

              <p>
                {event?.description || "Event details will appear here."}
              </p>

              <p>
                Registration availability is controlled by the event capacity.
              </p>
            </div>

            <div className="registration-highlights">
              <div>
                <Users size={18} />
                <span>
                  <strong>{seatsAvailable}</strong>
                  Seats available
                </span>
              </div>

              <div>
                <Clock3 size={18} />
                <span>
                  <strong>6 Hours</strong>
                  Duration
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  <strong>Certificate</strong>
                  Provided
                </span>
              </div>
            </div>
          </div>

          {/* REGISTRATION CARD */}
          <aside className="registration-side-card">

            <div className="registration-side-top">
              <span>EVENT DETAILS</span>
              <CalendarDays size={19} />
            </div>

            <div className="registration-detail">
              <CalendarDays size={17} />

              <div>
                <span>Date</span>
                <strong>{event?.date ? new Date(event.date).toLocaleDateString() : "-"}</strong>
              </div>
            </div>

            <div className="registration-detail">
              <Clock3 size={17} />

              <div>
                <span>Time</span>
                <strong>{event?.time || "-"}</strong>
              </div>
            </div>

            <div className="registration-detail">
              <MapPin size={17} />

              <div>
                <span>Venue</span>
                <strong>{event?.venue || "-"}</strong>
              </div>
            </div>

            <div className="registration-divider" />

            {registered ? (
              <div className="registration-confirmed">
                <CheckCircle2 size={22} />

                <div>
                  <strong>{registrationStatus === "waitlist" ? "You're on the waitlist" : "You're registered!"}</strong>
                  <span>
                    {registrationStatus === "waitlist" ? `Position ${waitlistPosition || "pending"}. We will notify you if a seat opens.` : "Your seat has been successfully reserved."}
                  </span>
                </div>
                <button className="registration-calendar-button" type="button" onClick={downloadCalendar}>
                  <CalendarDays size={15} />
                  Add to calendar
                </button>
                <button className="registration-button" onClick={cancel}>Cancel registration</button>
              </div>
            ) : (
              <button
                className="registration-button"
                onClick={register}
                disabled={!event || event.status !== "approved" || registering}
              >
                {registering ? "Registering..." : seatsAvailable === 0 ? "Join waitlist" : event?.status !== "approved" ? "Awaiting approval" : "Register for Event"}
                <ArrowRight size={16} />
              </button>
            )}

            <p className="registration-note">
              Registration is free for all enrolled students.
            </p>
            {error && <p className="participant-error-message">{error}</p>}
          </aside>
        </section>
      </div>
    </div>
  );
}

export default EventRegistration;