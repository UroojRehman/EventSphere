import { MessageSquare, Search, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import feedbackService from "../../services/feedbackService";
import "../admin/Feedback.css";

function Feedback() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    feedbackService.getOrganizerFeedback()
      .then((response) => setItems(response.feedbacks || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const filtered = items.filter((item) =>
    `${item.participant?.name || ""} ${item.event?.title || ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const average = items.length ? (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1) : "0.0";

  return (
    <div className="admin-feedback-page">
      <div className="admin-feedback-container">
        <section className="admin-feedback-header">
          <div><span>ORGANIZER PORTAL</span><h1>Event<strong> feedback.</strong></h1><p>Review participant feedback and monitor ratings for your events.</p></div>
        </section>
        <div className="admin-feedback-stats"><div><MessageSquare size={18} /><strong>{items.length}</strong><span>Total responses</span></div><div><Star size={18} /><strong>{average}</strong><span>Average rating</span></div></div>
        <section className="admin-feedback-panel">
          <div className="admin-feedback-toolbar"><div className="admin-feedback-search"><Search size={16} /><input placeholder="Search feedback..." value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>
          {error && <p className="organizer-error-message">{error}</p>}
          <div className="admin-feedback-list">{filtered.map((item) => <article className="admin-feedback-card" key={item._id}><div className="feedback-user"><div className="feedback-avatar"><User size={15} /></div><div><strong>{item.participant?.name || "Participant"}</strong><span>{item.event?.title || "Event"}</span></div></div><div className="feedback-rating">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= item.rating ? "currentColor" : "none"} />)}</div><p>"{item.comments}"</p><time>{new Date(item.submittedOn || item.createdAt).toLocaleDateString()}</time></article>)}</div>
        </section>
      </div>
    </div>
  );
}

export default Feedback;
