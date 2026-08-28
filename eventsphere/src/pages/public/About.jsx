import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./About.css";
import { useEffect, useState } from "react";
import eventService from "../../services/eventService";

const stats = [
  { value: "500+", label: "Events hosted" },
  { value: "12K+", label: "Students reached" },
  { value: "35+", label: "Campus partners" },
  { value: "98%", label: "Student satisfaction" },
];

const features = [
  {
    icon: CalendarDays,
    title: "One place for every event",
    text: "Discover technical, cultural, sports and academic activities without searching through multiple platforms.",
  },
  {
    icon: Users,
    title: "Built around students",
    text: "EventSphere makes it easier for students to discover opportunities, register and stay connected.",
  },
  {
    icon: Award,
    title: "Celebrate participation",
    text: "Keep track of attendance, achievements, certificates and memorable campus experiences.",
  },
];

function About() {
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    eventService.getPublicStats()
      .then((response) => setPublicStats(response))
      .catch(() => {});
  }, []);

  const liveStats = publicStats
    ? [
        { value: `${publicStats.totalEvents}+`, label: "Events hosted" },
        { value: `${publicStats.students}+`, label: "Students reached" },
        { value: `${publicStats.clubs}+`, label: "Campus partners" },
        { value: `${publicStats.positiveFeedback}%`, label: "Student satisfaction" },
      ]
    : stats;

  return (
    <div className="about-page">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-glow about-glow-one" />
        <div className="about-glow about-glow-two" />

        <div className="about-hero-grid" />

        <div className="about-hero-inner">
          <div className="about-eyebrow">
            <Sparkles size={14} />
            About EventSphere
          </div>

          <h1>
            Where campus
            <span> comes alive.</span>
          </h1>

          <p>
            EventSphere is a modern college event information system designed
            to connect students with the experiences, opportunities and people
            that make campus life meaningful.
          </p>

          <div className="about-hero-actions">
            <Link to="/events" className="about-primary-btn">
              Explore Events
              <ArrowRight size={16} />
            </Link>

            <Link to="/contact" className="about-secondary-btn">
              Get in touch
            </Link>
          </div>
        </div>

        <div className="about-floating-card">
          <div className="about-floating-icon">
            <GraduationCap size={22} />
          </div>

          <div>
            <strong>Built for campus life</strong>
            <span>Discover · Participate · Connect</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats">
        {liveStats.map((stat) => (
          <div className="about-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="about-section-label">
          <span>01</span>
          Our story
        </div>

        <div className="about-story-grid">
          <div className="about-story-heading">
            <h2>
              Making every
              <span> campus moment</span>
              easier to discover.
            </h2>
          </div>

          <div className="about-story-copy">
            <p>
              College life is full of events, competitions, workshops,
              seminars and opportunities. The challenge is knowing where to
              find them.
            </p>

            <p>
              EventSphere brings these experiences together in one focused
              platform. Students can discover what's happening, explore event
              details and stay informed about important campus updates.
            </p>

            <div className="about-check-list">
              <div>
                <CheckCircle2 size={17} />
                <span>Simple event discovery</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Fast registration experience</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Centralized campus updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <div className="about-section-heading">
          <div>
            <span>02 — What we do</span>
            <h2>Designed around the student experience.</h2>
          </div>

          <p>
            Everything you need to discover and participate in campus
            experiences, presented through one modern interface.
          </p>
        </div>

        <div className="about-feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article className="about-feature-card" key={feature.title}>
                <div className="about-feature-number">
                  0{index + 1}
                </div>

                <div className="about-feature-icon">
                  <Icon size={22} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>

                <div className="about-feature-line" />
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta-glow" />

        <div className="about-cta-content">
          <span>Ready to explore?</span>

          <h2>
            Your next campus
            <strong> experience starts here.</strong>
          </h2>

          <p>
            Discover upcoming events and find something worth being part of.
          </p>

          <Link to="/events" className="about-cta-button">
            Browse Events
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;