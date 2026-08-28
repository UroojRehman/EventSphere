import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Edit3,
  Trash2,
  MapPin,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";
import Modal from "../../components/Modal";
import mediaService from "../../services/mediaService";
import "./Events.css";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", category: "", eventType: "", department: "", description: "", venue: "", date: "", time: "", endTime: "", maxParticipants: "", promotionCaption: "", hashtags: "", image: "", imageFile: null });

  const loadEvents = async () => {
    try {
      setError("");
      const response = await eventService.getAllEventsAdmin();
      setEvents(response.events || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      (event.organizer?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" || event.status === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  const updateStatus = async (id, status) => {
    try {
      if (status === "approved") {
        await eventService.approveEvent(id);
      } else {
        await eventService.rejectEvent(id);
      }
      await loadEvents();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const startEditing = (event) => {
    navigate(`/admin/events/${event._id}/edit`);
  };

  const saveEdit = async (formEvent) => {
    formEvent.preventDefault();
    try {
      const { imageFile, ...eventData } = editForm;
      await eventService.updateAdminEvent(editingEvent._id, {
        ...eventData,
        maxParticipants: Number(editForm.maxParticipants),
        hashtags: editForm.hashtags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (imageFile) {
        const uploadResponse = await mediaService.uploadMedia(imageFile, editingEvent._id, editForm.title, editForm.description);
        const uploadedBanner = uploadResponse.media?.fileUrl;
        if (uploadedBanner) {
          await eventService.updateAdminEvent(editingEvent._id, { banner: uploadedBanner });
        }
      }
      setEditingEvent(null);
      await loadEvents();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await eventService.deleteAdminEvent(event._id);
      await loadEvents();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-events-page">
      <div className="admin-events-container">

        <section className="admin-events-header">
          <div>
            <span>EVENT MANAGEMENT</span>
            <h1>
              All
              <strong> events.</strong>
            </h1>
            <p>
              Review, monitor and manage every event published
              on EventSphere.
            </p>
          </div>
        </section>

        <div className="admin-events-stats">
          <div>
            <CalendarDays size={18} />
            <strong>{events.length}</strong>
            <span>Total events</span>
          </div>

          <div>
            <CheckCircle2 size={18} />
            <strong>
              {events.filter((e) => e.status === "approved").length}
            </strong>
            <span>Approved</span>
          </div>

          <div>
            <Clock3 size={18} />
            <strong>
              {events.filter((e) => e.status === "pending").length}
            </strong>
            <span>Pending</span>
          </div>

          <div>
            <XCircle size={18} />
            <strong>
              {events.filter((e) => e.status === "rejected").length}
            </strong>
            <span>Rejected</span>
          </div>
        </div>

        <section className="admin-events-panel">

          {error && <p className="admin-events-error">{error}</p>}

          <div className="admin-events-toolbar">
            <div className="admin-events-search">
              <Search size={16} />
              <input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-event-filters">
              {["All", "Approved", "Pending", "Rejected"].map(
                (item) => (
                  <button
                    key={item}
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {loading ? <p>Loading events...</p> : <div className="admin-events-table-wrap">
            <table className="admin-events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date / Location</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <div className="admin-event-title">
                        <strong>{event.title}</strong>
                        <span>{event.category}</span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-event-organizer">
                        {event.organizer?.name || "Unknown organizer"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-event-date">
                        <span>
                          <CalendarDays size={11} />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span>
                          <MapPin size={11} />
                          {event.venue}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="admin-event-registrations">
                        <Users size={12} />
                        {event.seatsBooked || 0}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-event-status ${event.status.toLowerCase()}`}
                      >
                        {event.status.replace("_", " ")}
                      </span>
                    </td>

                    <td>
                      <div className="admin-event-actions">
                        <button title="View" onClick={() => setSelectedEvent(event)}>
                          <Eye size={14} />
                        </button>

                        <button title="Edit" onClick={() => startEditing(event)}>
                          <Edit3 size={14} />
                        </button>

                        <button title="Delete" className="reject" onClick={() => deleteEvent(event)}>
                          <Trash2 size={14} />
                        </button>

                        {event.status !== "approved" && (
                          <button
                            className="approve"
                            onClick={() =>
                              updateStatus(event._id, "approved")
                            }
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {event.status !== "rejected" && (
                          <button
                            className="reject"
                            onClick={() =>
                              updateStatus(event._id, "rejected")
                            }
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

        </section>
      </div>

      <Modal isOpen={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} title="Event details" size="lg">
        {selectedEvent && <div className="space-y-3 p-6 text-sm text-slate-300">
          <h2 className="text-xl font-black text-white">{selectedEvent.title}</h2>
          <p>{selectedEvent.description}</p>
          <p><strong>Category:</strong> {selectedEvent.category} · <strong>Type:</strong> {selectedEvent.eventType}</p>
          <p><strong>Department:</strong> {selectedEvent.department} · <strong>Venue:</strong> {selectedEvent.venue}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · <strong>Time:</strong> {selectedEvent.time}</p>
          <p><strong>Organizer:</strong> {selectedEvent.organizer?.name || "Unknown"}</p>
        </div>}
      </Modal>

      <Modal isOpen={Boolean(editingEvent)} onClose={() => setEditingEvent(null)} title="Edit event" size="lg">
        <form onSubmit={saveEdit} className="grid gap-4 p-6 text-sm text-slate-300">
          {[["title", "Title"], ["venue", "Venue"], ["date", "Date"], ["time", "Time"], ["maxParticipants", "Maximum participants"]].map(([name, label]) => (
            <label key={name} className="grid gap-1"><span>{label}</span><input required type={name === "date" ? "date" : name === "maxParticipants" ? "number" : "text"} value={editForm[name]} onChange={(event) => setEditForm({ ...editForm, [name]: event.target.value })} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white" /></label>
          ))}
          <label className="grid gap-1"><span>Description</span><textarea required rows="5" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white" /></label>
          <label className="grid gap-1"><span>Replace event image</span><input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(event) => setEditForm({ ...editForm, imageFile: event.target.files?.[0] || null })} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white" />{editForm.image && <img src={editForm.image} alt="Current event" className="mt-2 h-24 w-40 rounded-lg object-cover" />}</label>
          <button type="submit" className="rounded-lg bg-cyan-600 px-4 py-3 font-bold text-white">Save changes</button>
        </form>
      </Modal>

    </div>
  );
}

export default Events;