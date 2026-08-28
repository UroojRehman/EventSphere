import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ImagePlus,
  MapPin,
  Save,
  Tag,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import eventService from "../../services/eventService";
import mediaService from "../../services/mediaService";
import { validateEventForm } from "../../utils/validation";
import "./EditEvent.css";

function EditEvent({ adminMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "Innovation Summit 2026",
    category: "Technical",
    date: "2026-09-15",
    time: "10:00",
    endTime: "",
    timezone: "UTC",
    location: "Main Auditorium, Block A",
    capacity: "250",
    description:
      "Join students, faculty members and industry professionals for an inspiring day of innovation, technology and ideas.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    promotionCaption: "",
    hashtags: "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!id) return;
    const loadEvent = adminMode ? eventService.getAdminEventById : eventService.getOrganizerEventById;
    loadEvent(id).then((event) => {
      setFormData({
        title: event.title,
        category: event.category,
        date: new Date(event.date).toISOString().slice(0, 10),
        time: event.time,
        endTime: event.endTime || "",
        timezone: event.timezone || "UTC",
        location: event.venue,
        capacity: String(event.maxParticipants),
        description: event.description,
        image: event.image || event.banner || "",
        promotionCaption: event.promotionCaption || "",
        hashtags: (event.hashtags || []).join(", "),
      });
    }).catch((requestError) => setError(requestError.message));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateEventForm({ ...formData, image: imageFile || formData.image });
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const updateEvent = adminMode ? eventService.updateAdminEvent : eventService.updateEvent;
      await updateEvent(id, {
        title: formData.title,
        category: formData.category,
        venue: formData.location,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        timezone: formData.timezone,
        maxParticipants: Number(formData.capacity),
        description: formData.description,
        banner: formData.image,
        promotionCaption: formData.promotionCaption,
        hashtags: formData.hashtags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (imageFile) {
        const uploadResponse = await mediaService.uploadMedia(
          imageFile,
          id,
          formData.title,
          formData.description
        );
        if (adminMode && uploadResponse.media?.fileUrl) {
          await eventService.updateAdminEvent(id, { banner: uploadResponse.media.fileUrl });
        }
      }
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="organizer-edit-page">
      <div className="organizer-edit-container">

        {/* HEADER */}
        <div className="organizer-edit-header">
          <div>
            <Link
                to={adminMode ? "/admin/events" : "/organizer/events"}
              className="organizer-edit-back"
            >
              <ArrowLeft size={15} />
              Back to events
            </Link>

            <div className="organizer-edit-kicker">
                {adminMode ? "ADMIN PANEL" : "ORGANIZER PANEL"}
            </div>

            <h1>
              Edit your
              <span> event.</span>
            </h1>

            <p>
              Update the event information, schedule, location and
              registration details.
            </p>
          </div>

          <div className="organizer-edit-icon">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* SUCCESS */}
        {saved && (
          <div className="organizer-edit-success">
            <strong>Event updated successfully!</strong>
            <span>Your latest changes have been saved.</span>
          </div>
        )}
        {error && <div className="organizer-error-message">{error}</div>}

        {/* FORM */}
        <form
          className="organizer-edit-form"
          onSubmit={handleSubmit}
        >

          {/* EVENT DETAILS */}
          <section className="organizer-edit-section">

            <div className="organizer-edit-section-heading">
              <div>
                <span>01 — Basic information</span>
                <h2>Event details</h2>
              </div>

              <Tag size={20} />
            </div>

            <div className="organizer-edit-grid">

              <label className="organizer-edit-field organizer-edit-full">
                <span>Event title</span>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength="120"
                  required
                />
              </label>

              <label className="organizer-edit-field">
                <span>Category</span>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Academic">Academic</option>
                  <option value="Community">Community</option>
                </select>
              </label>

              <label className="organizer-edit-field">
                <span>Maximum participants</span>

                <div className="organizer-edit-input-icon">
                  <Users size={16} />

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="100000"
                    step="1"
                    required
                  />
                </div>
              </label>

            </div>
          </section>

          {/* SCHEDULE */}
          <section className="organizer-edit-section">

            <div className="organizer-edit-section-heading">
              <div>
                <span>02 — Schedule & location</span>
                <h2>When and where?</h2>
              </div>

              <MapPin size={20} />
            </div>

            <div className="organizer-edit-grid">

              <label className="organizer-edit-field">
                <span>Date</span>

                <div className="organizer-edit-input-icon">
                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>

              <label className="organizer-edit-field">
                <span>Time</span>

                <div className="organizer-edit-input-icon">
                  <Clock3 size={16} />

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>

              <label className="organizer-edit-field">
                <span>End time</span>
                <div className="organizer-edit-input-icon">
                  <Clock3 size={16} />
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </div>
              </label>

              <label className="organizer-edit-field organizer-edit-full">
                <span>Time zone</span>
                <select name="timezone" value={formData.timezone} onChange={handleChange} required>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Karachi">Asia/Karachi</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </label>

              <label className="organizer-edit-field organizer-edit-full">
                <span>Venue / location</span>

                <div className="organizer-edit-input-icon">
                  <MapPin size={16} />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </label>

            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="organizer-edit-section">

            <div className="organizer-edit-section-heading">
              <div>
                <span>03 — Event information</span>
                <h2>Content & media</h2>
              </div>

              <ImagePlus size={20} />
            </div>

            <div className="organizer-edit-grid">

              <label className="organizer-edit-field organizer-edit-full">
                <span>Description</span>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="7"
                  required
                />
              </label>

              <label className="organizer-edit-field">
                <span>Promotion caption</span>
                <input type="text" name="promotionCaption" value={formData.promotionCaption} onChange={handleChange} />
              </label>

              <label className="organizer-edit-field">
                <span>Hashtags</span>
                <input type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} placeholder="#EventSphere, #CampusLife" />
              </label>

              <label className="organizer-edit-field organizer-edit-full">
                <span>Replace event image</span>

                <div className="organizer-edit-input-icon">
                  <ImagePlus size={16} />

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    name="image"
                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                  />
                </div>
                {imageFile && <small>{imageFile.name}</small>}
              </label>

            </div>

              {formData.image && (
              <div className="organizer-edit-preview">
                <img
                  src={formData.image}
                  alt="Event preview"
                />

                <div>
                  <span>IMAGE PREVIEW</span>
                  <strong>Current event cover</strong>
                </div>
              </div>
            )}

          </section>

          {/* ACTIONS */}
          <div className="organizer-edit-actions">

            <Link
                to={adminMode ? "/admin/events" : "/organizer/events"}
              className="organizer-edit-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="organizer-edit-save"
              disabled={submitting}
            >
              <Save size={17} />
              {submitting ? "Saving..." : "Save changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditEvent;