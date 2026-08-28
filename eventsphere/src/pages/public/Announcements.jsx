import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Announcements.css";
import announcementService from "../../services/announcementService";

const Announcements = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    announcementService.getPublished()
      .then((response) => {
        setItems(response.announcements || []);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="announcements-page">
      <div className="announcements-container">

        <section className="announcements-hero">
          <div className="announcement-icon">
            <Bell size={25} />
          </div>

          <div>
            <div className="announcement-kicker">
              <Sparkles size={13} />
              STAY INFORMED
            </div>

            <h1>
              Latest campus
              <span> updates.</span>
            </h1>

            <p>
              Important announcements, platform updates and event news
              from the EventSphere community.
            </p>
          </div>
        </section>

        <div className="announcement-list">
          {loading && (
            <div className="announcement-skeleton-list" aria-label="Loading announcements">
              {[1, 2, 3].map((item) => (
                <div className="announcement-skeleton" key={item}>
                  <span />
                  <div>
                    <i />
                    <b />
                    <em />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <p className="announcement-empty">Unable to load announcements: {error}</p>}
          {!loading && !error && !items.length && (
            <p className="announcement-empty">No published announcements yet.</p>
          )}
          {!loading && !error && items.map((item, index) => (
            <motion.article
              className="announcement-card"
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 180, damping: 20, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <div className="announcement-number">
                0{index + 1}
              </div>

              <div className="announcement-content">
                <div className="announcement-meta">
                  <span>{item.category}</span>
                  <time>{item.date || new Date(item.createdAt).toLocaleDateString()}</time>
                </div>

                <h2>{item.title}</h2>

                <p>{item.text}</p>

                <Link to="/events">
                  Explore events
                  <ArrowRight size={15} />
                </Link>
              </div>

              <CalendarDays className="announcement-watermark" size={70} />
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;