import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import "./Events.css";
import eventService from "../../services/eventService";
import { useAuthContext } from "../../context/AuthContext";
import EventFilter from "../../components/EventFilter";

const eventsData = [
  {
    id: 1,
    title: "Tech Innovation Summit 2026",
    category: "Technical",
    date: "28 Aug 2026",
    time: "10:00 AM",
    location: "Main Auditorium",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    description:
      "Explore emerging technologies, software innovation and the future of digital transformation.",
  },
  {
    id: 2,
    title: "Inter College Sports Championship",
    category: "Sports",
    date: "30 Aug 2026",
    time: "09:00 AM",
    location: "College Sports Ground",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
    description:
      "A competitive day featuring multiple sports and talented student athletes.",
  },
  {
    id: 3,
    title: "Cultural Night 2026",
    category: "Cultural",
    date: "03 Sep 2026",
    time: "06:30 PM",
    location: "Open Air Theatre",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
    description:
      "Celebrate creativity, culture, music and performances from students across campus.",
  },
  {
    id: 4,
    title: "Modern Web Development Workshop",
    category: "Workshops",
    date: "05 Sep 2026",
    time: "11:00 AM",
    location: "Computer Lab 02",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    description:
      "A practical workshop covering modern frontend development and professional web practices.",
  },
  {
    id: 5,
    title: "Career & Industry Seminar",
    category: "Seminars",
    date: "08 Sep 2026",
    time: "01:00 PM",
    location: "Conference Hall",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85",
    description:
      "Meet professionals and learn about career opportunities, skills and industry expectations.",
  },
  {
    id: 6,
    title: "AI & Future Technologies",
    category: "Technical",
    date: "12 Sep 2026",
    time: "10:30 AM",
    location: "Innovation Lab",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85",
    description:
      "Discover how artificial intelligence is changing education, business and technology.",
  },
];

const getEventStatus = (event) => {
  const eventDate = getEventDateTime(event.date, event.time);
  const eventEnd = event.endTime
    ? getEventDateTime(event.date, event.endTime)
    : new Date(eventDate.getTime() + 60 * 60 * 1000);
  const today = new Date();

  if (today >= eventDate && today <= eventEnd) return "ongoing";
  return today > eventEnd ? "past" : "upcoming";
};

const getEventDateTime = (date, time = "00:00") => {
  const eventDate = new Date(date);
  const match = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  let hours = Number(match?.[1] || 0);
  const minutes = Number(match?.[2] || 0);
  const meridiem = match?.[3]?.toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  eventDate.setHours(hours, minutes, 0, 0);
  return eventDate;
};

const formatEventDate = (date) => new Date(date).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function Events() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [availableEvents, setAvailableEvents] = useState(eventsData);
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category");

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory
      ? initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)
      : "All",
    department: "All Departments",
    eventType: "All Event Types",
    status: "All",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    eventService.getAllEvents().then((response) => {
      if (response.events?.length) {
        setAvailableEvents(response.events.map((event) => ({
          ...event,
          id: event._id,
          date: formatEventDate(event.date),
          location: event.venue,
          seatsAvailable: Math.max((event.maxParticipants || 0) - (event.seatsBooked || 0), 0),
          totalSeats: event.maxParticipants,
          status: getEventStatus(event),
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    eventService.getMyBookmarks().then((response) => {
      const bookmarkedIds = new Set((response.events || []).map((event) => event._id));
      setAvailableEvents((current) => current.map((event) => ({ ...event, bookmarked: bookmarkedIds.has(event.id || event._id) })));
    }).catch(() => {});
  }, [user]);

  const filteredEvents = useMemo(() => {
    return availableEvents.filter((event) => {
      const matchesCategory = filters.category === "All" || event.category === filters.category;
      const matchesDepartment = filters.department === "All Departments" || event.department === filters.department;
      const matchesType = filters.eventType === "All Event Types" || event.eventType === filters.eventType;
      const matchesStatus = filters.status === "All" || event.status === filters.status.toLowerCase();
      const eventDate = new Date(event.date);
      const matchesStart = !filters.startDate || eventDate >= new Date(`${filters.startDate}T00:00:00`);
      const matchesEnd = !filters.endDate || eventDate <= new Date(`${filters.endDate}T23:59:59`);

      const query = filters.search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        event.title?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.department?.toLowerCase().includes(query);

      return matchesCategory && matchesDepartment && matchesType && matchesStatus && matchesStart && matchesEnd && matchesSearch;
    });
  }, [availableEvents, filters]);

  const toggleBookmark = async (event) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const response = await eventService.toggleBookmark(event.id);
    setAvailableEvents((current) => current.map((item) => item.id === event.id
      ? { ...item, bookmarked: response.bookmarked }
      : item));
  };

  return (
    <section className="events-page">
      <div className="events-container">

        {/* HERO */}
        <div className="events-hero">
          <div className="events-hero-content">
            <div className="events-eyebrow">
              <Sparkles size={15} />
              CAMPUS EVENTS
            </div>

            <h1>
              Discover what&apos;s
              <span> happening.</span>
            </h1>

            <p>
              Explore upcoming college events, workshops, competitions,
              seminars and cultural experiences — all in one place.
            </p>
          </div>

          <div className="events-hero-stats">
            <div>
              <strong>{availableEvents.length}</strong>
              <span>Upcoming Events</span>
            </div>

            <div>
              <strong>05</strong>
              <span>Categories</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>
          </div>
        </div>

        <EventFilter onFilterChange={setFilters} initialFilters={filters} />

        {/* RESULT INFO */}
        <div className="events-result-row">
          <div>
            <span className="result-count">
              {filteredEvents.length}
            </span>{" "}
            events found
          </div>

          {filters.search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setFilters((current) => ({ ...current, search: "" }))}
            >
              Clear search
            </button>
          )}
        </div>

        {/* EVENTS GRID */}
        {filteredEvents.length > 0 ? (
          <motion.div
            className="events-grid"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {filteredEvents.map((event) => (
              <motion.article
                className="event-card"
                key={event.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                whileHover={{ y: -8, scale: 1.01 }}
              >
                <div className="event-image-wrapper">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="event-image"
                  />

                  <div className="event-image-overlay" />

                  <span className="event-category-badge">
                    {event.category}
                  </span>

                  <button type="button" className="event-bookmark-button" onClick={() => toggleBookmark(event)} aria-label={user ? "Bookmark event" : "Log in to bookmark event"}>
                    {user ? (event.bookmarked ? "Saved" : "Save") : "Login to save"}
                  </button>
                </div>

                <div className="event-card-content">
                  <h2>{event.title}</h2>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-meta">
                    <div>
                      <CalendarDays size={16} />
                      <span>{event.date}</span>
                    </div>

                    <div>
                      <Clock3 size={16} />
                      <span>{event.time}</span>
                    </div>

                    <div>
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="event-details-btn"
                  >
                    View event
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="events-empty">
            <div className="events-empty-icon">
              <Search size={24} />
            </div>

            <h2>No events found</h2>

            <p>
              Try another search term or choose a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setFilters((current) => ({
                  ...current,
                  search: "",
                  category: "All",
                  department: "All Departments",
                  eventType: "All Event Types",
                  status: "All",
                  startDate: "",
                  endDate: "",
                }));
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Events;