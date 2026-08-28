import {
  CalendarDays,
  Check,
  Clock3,
  Eye,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import eventService from "../../services/eventService";
import "./EventApproval.css";

function EventApproval() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [reviewComment, setReviewComment] = useState("");

  const loadRequests = async () => {
    try {
      setError("");
      const response = await eventService.getPendingEvents();
      setRequests(response.events || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateRequest = async (id, status) => {
    try {
      if (status === "approved") {
        await eventService.approveEvent(id);
      } else if (status === "changes_requested") {
        if (!reviewComment.trim()) {
          setError("Add a comment explaining the requested changes.");
          return;
        }
        await eventService.requestEventChanges(id, reviewComment.trim());
      } else {
        await eventService.rejectEvent(id, reviewComment.trim() || "Event proposal rejected");
      }
      await loadRequests();
    } catch (requestError) {
      setError(requestError.message);
    }

    setSelected(null);
    setReviewComment("");
  };

  const pending = requests.filter(
    (item) => ["pending", "changes_requested"].includes(item.status)
  );

  return (
    <div className="admin-approval-page">
      <div className="admin-approval-container">

        <section className="admin-approval-header">
          <div>

          {error && <p className="admin-approval-error">{error}</p>}
            <span>MODERATION</span>
            <h1>
              Event
              <strong> approvals.</strong>
            </h1>
            <p>
              Review event submissions before they become visible
              to students across EventSphere.
            </p>
          </div>

          <div className="approval-counter">
            <Clock3 size={16} />
            {pending.length} pending
          </div>
        </section>

        <div className="approval-list">
          {requests.map((request) => (
            <article className="approval-card" key={request._id}>

              <img className="approval-image" src={request.image} alt={request.title} />

              <div className="approval-card-top">
                <span className="approval-category">
                  {request.category}
                </span>

                <span
                  className={`approval-status ${request.status}`}
                >
                  {request.status.replace("_", " ")}
                </span>
              </div>

              <h2>{request.title}</h2>

              <p>{request.description}</p>

              <div className="approval-details">
                <span>
                  <User size={13} />
                  {request.organizer?.name || "Unknown organizer"}
                </span>

                <span>
                  <CalendarDays size={13} />
                  {new Date(request.date).toLocaleDateString()}
                </span>

                <span>
                  <MapPin size={13} />
                  {request.venue}
                </span>
              </div>

              <div className="approval-actions">

                <button
                  className="view"
                  onClick={() => setSelected(request)}
                >
                  <Eye size={14} />
                  Review
                </button>

                {pending.some((item) => item._id === request._id) && (
                  <>
                    <button
                      className="approve"
                      onClick={() =>
                        updateRequest(
                          request._id,
                          "approved"
                        )
                      }
                    >
                      <Check size={14} />
                      Approve
                    </button>

                    <button
                      className="reject"
                      onClick={() =>
                        updateRequest(
                          request._id,
                          "rejected"
                        )
                      }
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </>
                )}

              </div>
            </article>
          ))}
        </div>

      </div>

      {selected && (
        <div
          className="approval-modal-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="approval-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="approval-close"
              onClick={() => setSelected(null)}
            >
              <X size={17} />
            </button>

            <span>{selected.category}</span>

            <img className="approval-modal-image" src={selected.image} alt={selected.title} />

            <h2>{selected.title}</h2>

            <p>{selected.description}</p>

            <div className="approval-modal-info">
              <div>
                <User size={16} />
                <span>
                  Organizer
                  <strong>{selected.organizer?.name || "Unknown organizer"}</strong>
                </span>
              </div>

              <div>
                <CalendarDays size={16} />
                <span>
                  Date
                  <strong>{new Date(selected.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
                </span>
              </div>

              <div>
                <MapPin size={16} />
                <span>
                  Location
                  <strong>{selected.venue}</strong>
                </span>
              </div>

                <div>
                  <Clock3 size={16} />
                  <span>
                    Time
                    <strong>{selected.time || "Not specified"}</strong>
                  </span>
                </div>

                <div>
                  <span>
                    Event type
                    <strong>{selected.eventType || "Not specified"}</strong>
                  </span>
                </div>

                <div>
                  <span>
                    Department
                    <strong>{selected.department || "Not specified"}</strong>
                  </span>
                </div>

                <div>
                  <span>
                    Capacity
                    <strong>{selected.maxParticipants || "Not specified"}</strong>
                  </span>
                </div>

                <div>
                  <CalendarDays size={16} />
                  <span>
                    Registration deadline
                    <strong>{selected.registrationDeadline ? new Date(selected.registrationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Not specified"}</strong>
                  </span>
                </div>
            </div>

            {pending.some((item) => item._id === selected._id) && (
              <div className="approval-modal-actions">
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Review comment or requested changes" rows={3} />
                <button
                  className="approve"
                  onClick={() =>
                    updateRequest(
                      selected._id,
                      "approved"
                    )
                  }
                >
                  <Check size={15} />
                  Approve event
                </button>

                <button
                  className="approve"
                  onClick={() => updateRequest(selected._id, "changes_requested")}
                >
                  Request changes
                </button>

                <button
                  className="reject"
                  onClick={() =>
                    updateRequest(
                      selected._id,
                      "rejected"
                    )
                  }
                >
                  <X size={15} />
                  Reject event
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default EventApproval;