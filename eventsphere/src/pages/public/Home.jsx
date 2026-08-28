import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import "./Home.css";
import eventService from "../../services/eventService";
import announcementService from "../../services/announcementService";

// Local, reliable fallback used if a remote event image fails or
// only partially loads (interrupted/blocked network fetch).
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80";

// Swaps a broken/partially-loaded <img> to the fallback once, and
// prevents an infinite loop if the fallback itself fails.
const handleImageError = (event) => {
  if (event.currentTarget.src !== FALLBACK_IMAGE) {
    event.currentTarget.src = FALLBACK_IMAGE;
  }
};

const featuredEvents = [
  {
    id: 1,
    title: "Tech Innovation Summit",
    category: "Technical",
    date: "Sep 12, 2026",
    time: "10:00 AM",
    location: "Main Auditorium",
    attendees: "320+",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 2,
    title: "Campus Cultural Night",
    category: "Cultural",
    date: "Sep 18, 2026",
    time: "06:30 PM",
    location: "Open Air Theatre",
    attendees: "500+",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: 3,
    title: "Inter College Sports Fest",
    category: "Sports",
    date: "Sep 24, 2026",
    time: "09:00 AM",
    location: "Sports Complex",
    attendees: "450+",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
  },
];

const stats = [
  { value: "120+", label: "Events Hosted" },
  { value: "8.5K+", label: "Students Joined" },
  { value: "42+", label: "Campus Clubs" },
  { value: "96%", label: "Positive Feedback" },
];

const sitemapSections = [
  {
    title: "Discover",
    links: [
      ["Home", "/"],
      ["All events", "/events"],
      ["Gallery", "/gallery"],
      ["Announcements", "/announcements"],
    ],
  },
  {
    title: "Learn more",
    links: [
      ["About EventSphere", "/about"],
      ["Frequently asked questions", "/faqs"],
      ["Contact us", "/contact"],
      ["Join EventSphere", "/register"],
    ],
  },
  {
    title: "Your account",
    links: [
      ["Sign in", "/login"],
      ["Participant dashboard", "/participant/dashboard"],
      ["Organizer dashboard", "/organizer/dashboard"],
      ["Admin login", "/admin/login"],
    ],
  },
];

const AnimatedStat = ({ value }) => {
  const numericValue = Number(String(value).match(/[\d.]+/)?.[0] || 0);
  const suffix = String(value).replace(/[\d.]+/, "");
  const counterRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = counterRef.current;
    if (!element || !window.IntersectionObserver) {
      setStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
    }, { threshold: 0.45 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const duration = 1100;
    const startedAt = performance.now();
    let frameId;

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = numericValue * easedProgress;
      setDisplayValue(Number.isInteger(numericValue) ? Math.round(nextValue) : nextValue.toFixed(1));

      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [numericValue, started]);

  return <span ref={counterRef}>{displayValue}{suffix}</span>;
};

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState(featuredEvents);
  const [publicStats, setPublicStats] = useState(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });

  const handleCardMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltY.set((event.clientX - bounds.left - bounds.width / 2) / 18);
    tiltX.set(-(event.clientY - bounds.top - bounds.height / 2) / 18);
  };

  useEffect(() => {
    eventService.getUpcomingEvents()
      .then((response) => {
        if (!response.events?.length) return;

        setUpcomingEvents(response.events.map((event) => ({
          ...event,
          id: event._id,
          date: new Date(event.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: event.time || new Date(event.date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: event.venue,
          attendees: event.maxParticipants ? `${event.maxParticipants}+` : "Open",
        })).slice(0, 3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    eventService.getPublicStats()
      .then((response) => setPublicStats(response))
      .catch(() => {});
  }, []);

  useEffect(() => {
    announcementService.getPublished()
      .then((response) => setLatestAnnouncement(response.announcements?.[0] || null))
      .catch(() => {});
  }, []);

  const nextEvent = upcomingEvents[0];
  const homeStats = [
    { value: publicStats ? `${publicStats.totalEvents}+` : stats[0].value, label: "Events Hosted" },
    { value: publicStats ? `${publicStats.students}+` : stats[1].value, label: "Students Joined" },
    { value: publicStats ? `${publicStats.clubs}+` : stats[2].value, label: "Campus Clubs" },
    { value: publicStats ? `${publicStats.positiveFeedback}%` : stats[3].value, label: "Positive Feedback" },
  ];

  return (
    <div className="home-page">
      <div className="home-atmosphere" aria-hidden="true">
        <span className="atmosphere-grid" />
        <span className="atmosphere-ring atmosphere-ring-one" />
        <span className="atmosphere-ring atmosphere-ring-two" />
      </div>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="home-hero">
        <div className="home-container hero-grid">

          {/* Left */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="hero-badge">
              <Sparkles size={15} />
              <span>THE CAMPUS EVENT EXPERIENCE</span>
            </div>

            <h1 className="hero-title" aria-label="Discover what's happening on campus.">
              {["Discover", "what's"].map((word, index) => (
                <motion.span key={word} className="hero-word" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + index * 0.08, type: "spring", stiffness: 190, damping: 15 }}>{word}</motion.span>
              ))}
              <span className="hero-title-emphasis">
                {["happening", "on", "campus."].map((word, index) => (
                  <motion.span key={word} className="hero-word" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 + index * 0.08, type: "spring", stiffness: 190, damping: 15 }}>{word}</motion.span>
                ))}
              </span>
            </h1>

            <p className="hero-description">
              Discover events, workshops, competitions and experiences
              happening across your campus — all in one modern platform.
            </p>

            <Link to="/announcements" className="home-announcement-banner">
              <Bell size={17} />
              <span>
                <small>{latestAnnouncement?.category || "Campus update"}</small>
                <strong>{latestAnnouncement?.title || "Stay up to date with campus announcements"}</strong>
              </span>
              <ArrowRight size={16} />
            </Link>

            <div className="hero-actions">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 320, damping: 18 }}>
                <Link to="/events" className="primary-button">
                Explore Events
                <ArrowRight size={18} />
                </Link>
              </motion.div>

              <Link to="/register" className="secondary-button">
                Join EventSphere
              </Link>
            </div>

            <div className="hero-trust">
              <div className="avatar-stack">
                <span title="Aisha" data-tooltip="Aisha">A</span>
                <span title="Hamza" data-tooltip="Hamza">H</span>
                <span title="Mariam" data-tooltip="Mariam">M</span>
                <span title="More students" data-tooltip="More students">+</span>
              </div>

              <div>
                <strong>{publicStats ? `${publicStats.students}+ students` : "8,500+ students"}</strong>
                <p>already exploring campus events</p>
              </div>
            </div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />

            <motion.div className="hero-card" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }} onMouseMove={handleCardMove} onMouseLeave={() => { tiltX.set(0); tiltY.set(0); }}>

              <div className="hero-card-image">
                <img
                  src={nextEvent?.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=90"}
                  alt={nextEvent?.title || "Students attending a campus event"}
                  onError={handleImageError}
                />

                <div className="image-overlay" />

                <div className="live-pill">
                  <span />
                  LIVE CAMPUS
                </div>

                <div className="hero-image-text">
                  <p>UPCOMING EXPERIENCE</p>
                  <h3>{nextEvent?.title || "Innovation &amp; Ideas"}</h3>
                </div>
              </div>

              <div className="hero-card-info">
                <div>
                  <span className="mini-label">NEXT EVENT</span>
                  <strong>{nextEvent ? `${nextEvent.date} · ${nextEvent.time}` : "No upcoming events"}</strong>
                </div>

                <Link to="/events" className="circle-arrow">
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>

            <motion.div className="floating-info floating-info-top" animate={{ y: [0, -8, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}>
              <CalendarDays size={17} />
              <div>
                <strong>{publicStats ? publicStats.upcomingEvents : upcomingEvents.length} Events</strong>
                <span>This month</span>
              </div>
            </motion.div>

            <motion.div className="floating-info floating-info-bottom" animate={{ y: [0, 9, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
              <Users size={17} />
              <div>
                <strong>{publicStats ? `${publicStats.registrations}+ Joined` : "320+ Joined"}</strong>
                <span>Campus registrations</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="home-notice-section">
        <div className="home-container">
          <motion.div
            className="home-notice"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <div className="home-notice-icon">
              <Bell size={22} />
            </div>
            <div className="home-notice-content">
              <span>{latestAnnouncement?.category || "CAMPUS UPDATES"}</span>
              <h2>{latestAnnouncement?.title || "Stay informed about campus events"}</h2>
              <p>{latestAnnouncement?.text || "Explore the latest announcements, event news, and important updates from EventSphere."}</p>
            </div>
            <Link to="/announcements" className="home-notice-link">
              View updates
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <motion.section
        className="stats-section home-reveal-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-container">
          <div className="stats-grid">
            {homeStats.map((stat, index) => (
              <motion.div
                className="stat-item"
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <strong><AnimatedStat value={stat.value} /></strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* =====================================================
          FEATURED EVENTS
      ====================================================== */}

      <motion.section
        className="featured-section home-reveal-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.16 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-container">

          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span />
                DISCOVER
              </div>

              <h2>
                Featured <span>events.</span>
              </h2>

              <p>
                Hand-picked experiences students are talking about right now.
              </p>
            </div>

            <Link to="/events" className="view-all-link">
              View all events
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="event-grid">
            {upcomingEvents.map((event, index) => (
              <motion.article
                key={event.id}
                className="event-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/events/${event.id}`}>
                  <div className="event-image">
                    <img
                      src={event.image}
                      alt={event.title}
                      onError={handleImageError}
                    />

                    <div className="event-image-overlay" />

                    <span className="event-category">
                      {event.category}
                    </span>

                    <strong className="event-image-title">
                      {event.title}
                    </strong>

                    <span className="event-arrow">
                      <ArrowRight size={17} />
                    </span>
                  </div>

                  <div className="event-body">
                    <h3>{event.title}</h3>

                    <div className="event-meta">
                      <span>
                        <CalendarDays size={14} />
                        <span>{event.date}</span>
                      </span>

                      <span>
                        <Clock3 size={14} />
                        <span>{event.time}</span>
                      </span>
                    </div>

                    <div className="event-bottom">
                      <span>
                        <MapPin size={14} />
                        {event.location}
                      </span>

                      <strong>{event.attendees}</strong>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="home-sitemap-section" aria-labelledby="home-sitemap-title">
        <div className="home-container">
          <div className="home-sitemap-heading">
            <div>
              <div className="section-kicker">
                <span />
                SITE MAP
              </div>
              <h2 id="home-sitemap-title">Find your way <span>around.</span></h2>
              <p>Explore the main areas of EventSphere.</p>
            </div>
          </div>

          <div className="home-sitemap-grid">
            {sitemapSections.map((section) => (
              <nav className="home-sitemap-group" key={section.title} aria-label={section.title}>
                <h3>{section.title}</h3>
                {section.links.map(([label, path]) => (
                  <Link to={path} key={path}>
                    {label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta">

            <div className="cta-glow" />

            <div className="cta-content">
              <div className="section-kicker light">
                <span />
                YOUR CAMPUS. YOUR EXPERIENCE.
              </div>

              <h2>
                There&apos;s always something
                <span> happening.</span>
              </h2>

              <p>
                Find your next experience, meet new people and make
                your campus life memorable.
              </p>

              <Link to="/events" className="cta-button">
                Explore the full calendar
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="cta-decoration">
              <CalendarDays size={130} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;