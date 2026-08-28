import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Mail,
  MapPin,
} from "lucide-react";
import "./Footer.css";
import { useEffect, useState } from "react";
import contactService from "../services/contactService";

const Footer = () => {
  const year = new Date().getFullYear();
  const [contact, setContact] = useState({
    contactEmail: "events@eventsphere.edu",
    address: "College Campus, Karachi",
    country: "Pakistan",
  });

  useEffect(() => {
    contactService.getPublic()
      .then((response) => setContact((current) => ({ ...current, ...response })))
      .catch(() => {});
  }, []);

  const sitemapLinks = [
    ["Home", "/"],
    ["Events", "/events"],
    ["Gallery", "/gallery"],
    ["Announcements", "/announcements"],
    ["About Us", "/about"],
    ["FAQs", "/faqs"],
    ["Contact", "/contact"],
    ["Sign in", "/login"],
    ["Join EventSphere", "/register"],
  ];

  const categories = [
    ["Technical", "/events?category=technical"],
    ["Cultural", "/events?category=cultural"],
    ["Sports", "/events?category=sports"],
    ["Workshop", "/events?category=workshop"],
    ["Seminar", "/events?category=seminar"],
  ];

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >

      {/* Decorative background */}
      <div className="footer-glow footer-glow-left" />
      <div className="footer-glow footer-glow-right" />

      <div className="footer-container">

        {/* =================================================
            MAIN FOOTER
        ================================================== */}

        <div className="footer-grid">

          {/* BRAND */}
          <div className="footer-brand">

            <Link to="/" className="footer-logo">

              <div className="footer-logo-icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <div className="footer-brand-name">
                  Event<span>Sphere</span>
                </div>

                <div className="footer-brand-tag">
                  COLLEGE EVENT SYSTEM
                </div>
              </div>

            </Link>

            <p className="footer-description">
              A modern platform for discovering campus events,
              registering for experiences, staying updated and
              celebrating student participation.
            </p>

            {/* Social placeholders */}
            <div className="footer-socials">

              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                className="footer-social"
              >
                IG
              </a>

              <a
                href="https://www.facebook.com/"
                aria-label="Facebook"
                className="footer-social"
              >
                FB
              </a>

              <a
                href="https://www.linkedin.com/"
                aria-label="LinkedIn"
                className="footer-social"
              >
                IN
              </a>

              <a
                href="https://x.com/"
                aria-label="Twitter"
                className="footer-social"
              >
                X
              </a>

            </div>
          </div>

          {/* SITEMAP */}
          <div className="footer-column">

            <h3>Sitemap</h3>

            <div className="footer-links">
              {sitemapLinks.map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  className="footer-link"
                >
                  <ArrowUpRight size={14} />
                  {label}
                </Link>
              ))}
            </div>

          </div>

          {/* CATEGORIES */}
          <div className="footer-column">

            <h3>Categories</h3>

            <div className="footer-links">
              {categories.map(([label, path]) => (
                <Link
                  key={label}
                  to={path}
                  className="footer-link"
                >
                  <span className="footer-category-dot" />
                  {label}
                </Link>
              ))}
            </div>

          </div>

          {/* CONTACT */}
          <div className="footer-column footer-contact">

            <h3>Stay Connected</h3>

            <p>
              Get important event announcements and
              updates directly from EventSphere.
            </p>

            <div className="footer-contact-list">

              <div className="footer-contact-item">

                <div className="footer-contact-icon">
                  <Mail size={16} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>{contact.contactEmail}</strong>
                </div>

              </div>

              <div className="footer-contact-item">

                <div className="footer-contact-icon">
                  <MapPin size={16} />
                </div>

                <div>
                  <span>Location</span>
                  <strong>{contact.address}, {contact.country}</strong>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            BOTTOM
        ================================================== */}

        <div className="footer-bottom">

          <p>
            © {year} EventSphere. All rights reserved.
          </p>

          <div className="footer-bottom-links">

            <Link to="/about">
              Privacy
            </Link>

            <Link to="/contact">
              Support
            </Link>

          </div>

        </div>

      </div>
    </motion.footer>
  );
};

export default Footer;