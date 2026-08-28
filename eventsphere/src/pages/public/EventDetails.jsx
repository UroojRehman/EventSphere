import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Download,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import eventService from "../../services/eventService";
import feedbackService from "../../services/feedbackService";
import { useAuthContext } from "../../context/AuthContext";
import "./EventDetails.css";

const events = {
  1: {
    title: "Tech Innovation Summit",
    category: "Technical",
    date: "September 12, 2026",
    time: "10:00 AM",
    location: "Main Auditorium",
    attendees: "320+",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=90",
    description:
      "A full-day technology experience bringing students, developers and innovators together to explore emerging technologies, practical ideas and the future of digital innovation.",
  },
  2: {
    title: "Campus Cultural Night",
    category: "Cultural",
    date: "September 18, 2026",
    time: "06:30 PM",
    location: "Open Air Theatre",
    attendees: "500+",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90",
    description:
      "Celebrate creativity, culture and student talent with an unforgettable evening of performances, music and campus memories.",
  },
  3: {
    title: "Inter College Sports Fest",
    category: "Sports",
    date: "September 24, 2026",
    time: "09:00 AM",
    location: "Sports Complex",
    attendees: "450+",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=90",
    description:
      "Bring your team spirit to the biggest sports gathering on campus featuring competitive matches and exciting activities.",
  },
};

const hasEventEnded = (event) => {
  const eventDate = new Date(event.date);
  const hasEndTime = Boolean(event.endTime);
  const match = String(event.endTime || event.time || "00:00").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  let hours = Number(match?.[1] || 0);
  const minutes = Number(match?.[2] || 0);
  const meridiem = match?.[3]?.toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  eventDate.setHours(hours, minutes, 0, 0);
  if (!hasEndTime) eventDate.setTime(eventDate.getTime() + 60 * 60 * 1000);
  return eventDate < new Date();
};

const formatEventDate = (date) => new Date(date).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [event, setEvent] = useState(events[id] || events[1]);
  const [reviews, setReviews] = useState({ averageRating: 0, feedbacks: [] });
  const eventHasEnded = hasEventEnded(event);

  const loadEvent = () => eventService.getEventById(id).then((response) => {
    setEvent((currentEvent) => ({
      ...currentEvent,
      ...response,
      location: response.venue,
      image: response.image || currentEvent.image,
      attendees: response.maxParticipants || "-",
      seatsAvailable: Math.max((response.maxParticipants || 0) - (response.seatsBooked || 0), 0),
    }));
  }).catch(() => {});

  useEffect(() => {
    loadEvent();
    const refreshTimer = window.setInterval(loadEvent, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [id]);

  useEffect(() => {
    feedbackService.getPublicEventFeedback(id)
      .then((response) => setReviews(response))
      .catch(() => {});
  }, [id]);

  const timeMatch = (event.time || "00:00").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  const startHours = Number(timeMatch?.[1] || 0) + (timeMatch?.[3]?.toUpperCase() === "PM" && Number(timeMatch?.[1]) !== 12 ? 12 : 0);
  const calendarDate = new Date(event.date);
  calendarDate.setHours(startHours, Number(timeMatch?.[2] || 0), 0, 0);

  const downloadCalendar = () => {
    const formatIcsDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const endDate = new Date(calendarDate.getTime() + 60 * 60 * 1000);
    const escapeIcs = (value) => String(value || "").replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventSphere//Campus Events//EN",
      "BEGIN:VEVENT",
      `UID:${id}@eventsphere`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(calendarDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `LOCATION:${escapeIcs(event.location)}`,
      `DESCRIPTION:${escapeIcs(`${event.promotionCaption || event.description}${event.hashtags?.length ? ` ${event.hashtags.join(" ")}` : ""}`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${escapeIcs(event.title)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title || "event"}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareEvent = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.description}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n${shareData.url}`)}`, "_blank", "noopener,noreferrer");
  };

  const socialShareLinks = [
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(`${event.promotionCaption || event.title}\n${event.hashtags?.join(" ") || ""}\n${window.location.href}`)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`],
    ["X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`],
    ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`],
    ["Email", `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`${event.promotionCaption || event.description}\n${event.hashtags?.join(" ") || ""}\n${window.location.href}`)}`],
  ];

  const calendarLinks = [
    ["Google Calendar", `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${calendarDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${new Date(calendarDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}&location=${encodeURIComponent(event.location || "")}&details=${encodeURIComponent(event.description || "")}`],
    ["Outlook", `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${encodeURIComponent(calendarDate.toISOString())}&enddt=${encodeURIComponent(new Date(calendarDate.getTime() + 60 * 60 * 1000).toISOString())}&location=${encodeURIComponent(event.location || "")}&body=${encodeURIComponent(event.description || "")}`],
  ];

  const shareToInstagram = async () => {
    const caption = `${event.promotionCaption || event.title}\n${event.hashtags?.join(" ") || ""}\n${window.location.href}`;
    if (navigator.share) {
      await navigator.share({ title: event.title, text: caption, url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(caption);
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="event-details-page">
      <div className="event-details-container">

        <Link to="/events" className="details-back">
          <ArrowLeft size={16} />
          Back to events
        </Link>

        <motion.div
          className="details-hero"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={event.image} alt={event.title} />

          <div className="details-overlay" />

          <div className="details-category">
            {event.category}
          </div>

          <div className="details-hero-content">
            <h1>{event.title}</h1>
            <p>{event.description}</p>
          </div>
        </motion.div>

        <motion.div
          className="details-layout"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >

          <motion.div className="details-main" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}>
            <div className="details-section">
              <span className="details-kicker">ABOUT THE EVENT</span>

              <h2>Experience something memorable.</h2>

              <p>{event.description}</p>
            </div>

            <div className="details-section">
              <span className="details-kicker">PEER REVIEWS</span>
              <div className="details-review-summary">
                <strong>{reviews.averageRating || "-"}</strong>
                <span><Star size={16} fill="currentColor" /> average rating from {reviews.feedbacks.length} review{reviews.feedbacks.length === 1 ? "" : "s"}</span>
              </div>
              <div className="details-reviews">
                {reviews.feedbacks.slice(0, 3).map((review) => (
                  <article key={review._id}>
                    <div>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= review.rating ? "currentColor" : "none"} />)}</div>
                    <p>{review.comments || "Participant shared a rating without a comment."}</p>
                  </article>
                ))}
                {!reviews.feedbacks.length && <p>No peer reviews yet.</p>}
              </div>
            </div>

            <div className="details-section">
              <span className="details-kicker">WHAT TO EXPECT</span>

              <div className="details-points">
                <div>
                  <strong>Connect</strong>
                  <span>Meet students and build new connections.</span>
                </div>

                <div>
                  <strong>Learn</strong>
                  <span>Discover practical ideas and fresh perspectives.</span>
                </div>

                <div>
                  <strong>Participate</strong>
                  <span>Be part of an engaging campus experience.</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside className="details-sidebar" variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0 } }}>

            <div className="details-info-card">

              <div className="info-row">
                <div className="info-icon">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <span>Date</span>
                  <strong>{formatEventDate(event.date)}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Availability</span>
                  <strong>{event.seatsAvailable ?? "-"} seats left</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Organizer</span>
                  <strong>{event.organizer?.name || "EventSphere team"}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <span>Department</span>
                  <strong>{event.department || "All departments"}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Event type</span>
                  <strong>{event.eventType || event.category}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Time</span>
                  <strong>{event.time}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Venue</span>
                  <strong>{event.location}</strong>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Expected</span>
                  <strong>{event.attendees} students</strong>
                </div>
              </div>

              {!eventHasEnded && (
                <Link to={user ? `/participant/events/${id}/register` : "/login"} className="register-event-btn">
                  Register for event
                  <ArrowRight size={17} />
                </Link>
              )}

              {eventHasEnded && (
                <div className="event-completed-message">
                  <strong>Event completed</strong>
                  <span>This event has already taken place.</span>
                  <Link to={`/gallery?event=${encodeURIComponent(event.title || "")}`}>
                    View gallery for this event
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}

              <div className="event-detail-actions">
                <button type="button" onClick={downloadCalendar}>
                  <Download size={15} />
                  Add to calendar
                </button>
                <button type="button" onClick={shareEvent}>
                  <Share2 size={15} />
                  Share event
                </button>
              </div>
              <div className="event-calendar-links">
                {calendarLinks.map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"><CalendarDays size={13} /> {label}</a>
                ))}
              </div>
              <div className="event-social-links">
                <span>Share via</span>
                {socialShareLinks.map(([label, href]) => (
                  <a key={label} href={href} target={label === "Email" ? undefined : "_blank"} rel={label === "Email" ? undefined : "noreferrer"}>{label}</a>
                ))}
                <button type="button" onClick={shareToInstagram}>Instagram</button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetails;