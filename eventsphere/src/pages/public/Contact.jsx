import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import contactService from "../../services/contactService";
import "./Contact.css";

const contactInfo = [
  {
    icon: Mail,
    title: "Email us",
    value: "events@eventsphere.edu",
    text: "For general questions and event support.",
  },
  {
    icon: Phone,
    title: "Call support",
    value: "+92 300 0000000",
    text: "Available during campus support hours.",
  },
  {
    icon: MapPin,
    title: "Visit campus",
    value: "College Campus, Karachi",
    text: "Pakistan",
  },
];

const defaultContactSettings = {
  contactEmail: "events@eventsphere.edu",
  emailTitle: "Email us",
  emailText: "For general questions and event support.",
  phone: "+92 300 0000000",
  phoneTitle: "Call support",
  phoneText: "Available during campus support hours.",
  address: "College Campus, Karachi",
  addressTitle: "Visit campus",
  country: "Pakistan",
  supportTitle: "Support hours",
  supportHours: "Monday - Friday · 9:00 AM - 5:00 PM",
};

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("Message received!");
  const [settings, setSettings] = useState(defaultContactSettings);

  useEffect(() => {
    contactService.getPublic()
      .then((response) => setSettings((current) => ({ ...current, ...response })))
      .catch(() => {});
  }, []);

  const liveContactInfo = [
    { ...contactInfo[0], title: settings.emailTitle, value: settings.contactEmail, text: settings.emailText },
    { ...contactInfo[1], title: settings.phoneTitle, value: settings.phone, text: settings.phoneText },
    { ...contactInfo[2], title: settings.addressTitle, value: settings.address, text: settings.country },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
      const response = await contactService.sendMessage(formData);
      setSubmitMessage(response.message || "Message received!");
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3500);
    } catch (requestError) {
      setSubmitError(requestError.message);
    }
  };

  return (
    <div className="contact-page">
      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-glow contact-glow-one" />
        <div className="contact-hero-glow contact-glow-two" />

        <div className="contact-grid-bg" />

        <div className="contact-hero-content">
          <div className="contact-eyebrow">
            <MessageCircle size={14} />
            Contact EventSphere
          </div>

          <h1>
            Let's start a
            <span> conversation.</span>
          </h1>

          <p>
            Have a question about an event, registration or campus activity?
            Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* MAIN CONTACT AREA */}
      <section className="contact-main">
        {/* LEFT INFO */}
        <div className="contact-info">
          <div className="contact-section-label">
            <span>01</span>
            Get in touch
          </div>

          <h2>
            We're here to
            <span> help.</span>
          </h2>

          <p className="contact-intro">
            Whether you need help finding an event or want to tell us about an
            upcoming campus activity, our team is ready to help.
          </p>

          <div className="contact-info-list">
            {liveContactInfo.map((item) => {
              const Icon = item.icon;

              return (
                <div className="contact-info-card" key={item.title}>
                  <div className="contact-info-icon">
                    <Icon size={20} />
                  </div>

                  <div>
                    <span className="contact-info-title">{item.title}</span>
                    <strong>{item.value}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="contact-hours">
            <div className="contact-hours-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <strong>{settings.supportTitle}</strong>
              <span>{settings.supportHours}</span>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="contact-form-wrapper">
          <div className="contact-form-top">
            <div>
              <span>02 — Message us</span>
              <h2>Send a message</h2>
            </div>

            <div className="contact-form-icon">
              <Send size={19} />
            </div>
          </div>

          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">
                <CheckCircle2 size={30} />
              </div>

              <h3>{submitMessage}</h3>

              <p>
                Thanks for reaching out. Your message has been recorded
                successfully.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
              >
                Send another message
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {submitError && <p className="contact-error">{submitError}</p>}
              <div className="contact-form-row">
                <label>
                  <span>Full name</span>

                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label>
                  <span>Email address</span>

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>

              <label>
                <span>Subject</span>

                <select name="subject" defaultValue="" required>
                  <option value="" disabled>
                    Select a topic
                  </option>
                  <option value="event">Event inquiry</option>
                  <option value="registration">Registration help</option>
                  <option value="technical">Technical support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                <span>Message</span>

                <textarea
                  name="message"
                  rows="6"
                  placeholder="Tell us how we can help..."
                  required
                />
              </label>

              <button type="submit" className="contact-submit">
                Send message
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="contact-bottom">
        <div className="contact-bottom-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <span>Looking for an event?</span>
          <h3>Explore what's happening on campus.</h3>
        </div>

        <a href="/events" className="contact-bottom-button">
          Browse events
          <ArrowRight size={16} />
        </a>
      </section>
    </div>
  );
}

export default Contact;