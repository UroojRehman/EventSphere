import {
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  Send,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import attendanceService from "../../services/attendanceService";
import feedbackService from "../../services/feedbackService";
import "./Feedback.css";

function Feedback() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("participant");
  const [componentRatings, setComponentRatings] = useState({
    venueRating: 0,
    coordinationRating: 0,
    technicalRating: 0,
    hospitalityRating: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    attendanceService.getMyAttendance().then((response) => {
      setCompletedEvents((response.attendances || []).filter((item) => item.attended).map((item) => ({
        id: item.event?._id,
        title: item.event?.title || "Event",
        date: new Date(item.event?.date).toLocaleDateString(),
        category: item.event?.category || "",
      })));
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedEvent || !rating || Object.values(componentRatings).some((value) => !value)) {
      setError("Select an event and rate every category.");
      return;
    }

    const feedbackData = { eventId: selectedEvent, rating, userType, ...componentRatings };
    if (message.trim()) feedbackData.comments = message.trim();
    feedbackService.submitFeedback(feedbackData)
      .then(() => {
        setSubmitted(true);
        setSelectedEvent("");
        setRating(0);
        setMessage("");
        setComponentRatings({ venueRating: 0, coordinationRating: 0, technicalRating: 0, hospitalityRating: 0 });
      })
      .catch((requestError) => setError(requestError.message));
  };

  return (
    <div className="participant-feedback-page">
      <div className="participant-feedback-container">

        {/* HEADER */}
        <section className="feedback-header">
          <div>
            <div className="feedback-kicker">
              <MessageSquareText size={14} />
              YOUR EXPERIENCE
            </div>

            <h1>
              Share your
              <span> feedback.</span>
            </h1>

            <p>
              Tell us about your experience at EventSphere events. Your
              feedback helps organizers improve future campus activities.
            </p>
          </div>

          <div className="feedback-header-icon">
            <MessageSquareText size={24} />
          </div>
        </section>

        {/* MAIN */}
        <section className="feedback-main">

          {/* LEFT */}
          <div className="feedback-side">
            <div className="feedback-section-label">
              <span>01</span>
              Why feedback matters
            </div>

            <h2>
              Help make the next
              <span> event better.</span>
            </h2>

            <p>
              Your opinion gives organizers valuable insight into what worked
              well and what can be improved.
            </p>

            <div className="feedback-points">

              <div>
                <div className="feedback-point-icon">
                  <Star size={17} />
                </div>

                <div>
                  <strong>Rate your experience</strong>
                  <span>Share an honest rating for the event.</span>
                </div>
              </div>

              <div>
                <div className="feedback-point-icon">
                  <MessageSquareText size={17} />
                </div>

                <div>
                  <strong>Tell us what you think</strong>
                  <span>Give organizers useful suggestions.</span>
                </div>
              </div>

              <div>
                <div className="feedback-point-icon">
                  <CheckCircle2 size={17} />
                </div>

                <div>
                  <strong>Improve future events</strong>
                  <span>Your feedback helps shape upcoming activities.</span>
                </div>
              </div>

            </div>
          </div>

          {/* FORM */}
          <div className="feedback-form-wrapper">

            {submitted ? (
              <div className="feedback-success">
                <div className="feedback-success-icon">
                  <CheckCircle2 size={32} />
                </div>

                <h3>Feedback submitted!</h3>

                <p>
                  Thank you for sharing your experience. Your feedback has
                  been recorded successfully.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another response
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="feedback-form-top">
                  <div>
                    <span>02 — Event feedback</span>
                    <h2>Tell us about it</h2>
                  </div>

                  <div className="feedback-form-icon">
                    <Send size={18} />
                  </div>
                </div>

                <form
                  className="feedback-form"
                  onSubmit={handleSubmit}
                >
                  {error && <p className="feedback-error">{error}</p>}
                  <label>
                    <span>Your user type</span>
                    <select value={userType} onChange={(event) => setUserType(event.target.value)}>
                      <option value="participant">Participant</option>
                      <option value="organizer">Organizer</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </label>
                  {/* EVENT */}
                  <label>
                    <span>Select event</span>

                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Choose an event
                      </option>

                      {completedEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* RATING */}
                  <div className="feedback-rating-group">
                    <span>Overall rating</span>

                    <div className="feedback-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={
                            star <= rating
                              ? "feedback-star active"
                              : "feedback-star"
                          }
                          onClick={() => setRating(star)}
                          aria-label={`Rate ${star} out of 5`}
                        >
                          <Star size={25} fill="currentColor" />
                        </button>
                      ))}
                    </div>

                    <small>
                      {rating === 0
                        ? "Select a rating"
                        : `${rating} out of 5`}
                    </small>
                  </div>

                  <div className="feedback-component-ratings">
                    {[
                      ["venueRating", "Venue"],
                      ["coordinationRating", "Coordination"],
                      ["technicalRating", "Technical arrangements"],
                      ["hospitalityRating", "Hospitality"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <span>{label}</span>
                        <div className="feedback-mini-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setComponentRatings((current) => ({ ...current, [field]: star }))} aria-label={`${label}: ${star} out of 5`}>
                              <Star size={16} fill={star <= componentRatings[field] ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* MESSAGE */}
                  <label>
                    <span>Your feedback (optional)</span>

                    <textarea
                      rows="7"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What did you like? What could be improved?"
                    />
                  </label>

                  <button
                    type="submit"
                    className="feedback-submit"
                  >
                    Submit feedback
                    <ArrowRight size={17} />
                  </button>
                </form>
              </>
            )}

          </div>
        </section>

        {/* RECENT EVENTS */}
        <section className="feedback-events">

          <div className="feedback-events-heading">
            <div>
              <span>03 — Your events</span>
              <h2>Recent participation</h2>
            </div>

            <p>
              Events you have recently attended and can review.
            </p>
          </div>

          <div className="feedback-event-list">
            {completedEvents.map((event, index) => (
              <div
                className="feedback-event-card"
                key={event.id}
              >
                <div className="feedback-event-number">
                  0{index + 1}
                </div>

                <div className="feedback-event-content">
                  <span>{event.category}</span>
                  <h3>{event.title}</h3>
                  <p>{event.date}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(event.id);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                >
                  Give feedback
                  <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
}

export default Feedback;