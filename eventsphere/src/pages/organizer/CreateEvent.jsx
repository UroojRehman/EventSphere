import { useEffect, useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import eventService from "../../services/eventService";
import categoryService from "../../services/categoryService";
import mediaService from "../../services/mediaService";
import { validateEventFields } from "../../utils/validation";
import "./CreateEvent.css";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    eventType: "",
    department: "",
    date: "",
    time: "",
    endTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    location: "",
    capacity: "",
    description: "",
    image: null,
    promotionCaption: "",
    hashtags: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    categoryService.getAll().then((response) => setCategories(response.categories || []));
    categoryService.getAll("department").then((response) => setDepartments(response.categories || []));
    categoryService.getAll("eventType").then((response) => setEventTypes(response.categories || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const nextFieldErrors = validateEventFields(formData);
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      const deadline = new Date(`${formData.date}T00:00:00`);
      deadline.setDate(deadline.getDate() - 1);
      const response = await eventService.createEvent({
        title: formData.title,
        category: formData.category,
        eventType: formData.eventType,
        department: formData.department,
        description: formData.description,
        venue: formData.location,
        date: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        timezone: formData.timezone,
        maxParticipants: Number(formData.capacity),
        registrationDeadline: deadline.toISOString(),
        banner: "",
        promotionCaption: formData.promotionCaption,
        hashtags: formData.hashtags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      if (formData.image) {
        await mediaService.uploadMedia(
          formData.image,
          response.event._id,
          formData.title,
          formData.description
        );
      }
      setMessage("Event created successfully and sent for approval.");
      setTimeout(() => navigate("/organizer/my-events"), 800);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="organizer-create-page">
      <div className="organizer-create-container">

        {/* HEADER */}
        <div className="organizer-create-header">
          <div>
            <Link to="/organizer/events" className="organizer-back-link">
              <ArrowLeft size={15} />
              Back to events
            </Link>

            <div className="organizer-create-kicker">
              ORGANIZER PANEL
            </div>

            <h1>
              Create a new
              <span> event.</span>
            </h1>

            <p>
              Add the details of your upcoming campus event and publish it
              for students to discover.
            </p>
          </div>

          <div className="organizer-create-icon">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* SUCCESS */}
        {message && (
          <div className="organizer-success-message">
            <span>{message}</span>
          </div>
        )}
        {error && <div className="organizer-error-message">{error}</div>}

        {/* FORM */}
        <form
          className="organizer-event-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* BASIC INFORMATION */}
          <section className="organizer-form-section">

            <div className="organizer-form-section-heading">
              <div>
                <span>01 — Basic information</span>
                <h2>Event details</h2>
              </div>

              <Tag size={20} />
            </div>

            <div className="organizer-form-grid">

              <label className="organizer-field organizer-field-full">
                <span>Event title</span>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  maxLength="120"
                  required
                />
                {fieldErrors.title && <small className="organizer-field-error">{fieldErrors.title}</small>}
              </label>

              <label className="organizer-field">
                <span>Category</span>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                {fieldErrors.category && <small className="organizer-field-error">{fieldErrors.category}</small>}
              </label>

              <label className="organizer-field">
                <span>Maximum participants</span>

                <div className="organizer-input-icon">
                  <Users size={16} />

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    min="1"
                    max="100000"
                    step="1"
                    required
                  />
                </div>
                {fieldErrors.capacity && <small className="organizer-field-error">{fieldErrors.capacity}</small>}
              </label>

              <label className="organizer-field">
                <span>Department</span>
                <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="" disabled>Select department</option>
                  {departments.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
                {fieldErrors.department && <small className="organizer-field-error">{fieldErrors.department}</small>}
              </label>

              <label className="organizer-field">
                <span>Event type</span>
                <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                  <option value="" disabled>Select event type</option>
                  {eventTypes.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
                {fieldErrors.eventType && <small className="organizer-field-error">{fieldErrors.eventType}</small>}
              </label>

            </div>
          </section>

          {/* DATE & LOCATION */}
          <section className="organizer-form-section">

            <div className="organizer-form-section-heading">
              <div>
                <span>02 — Schedule & location</span>
                <h2>When and where?</h2>
              </div>

              <MapPin size={20} />
            </div>

            <div className="organizer-form-grid">

              <label className="organizer-field">
                <span>Date</span>

                <div className="organizer-input-icon">
                  <CalendarDays size={16} />

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                {fieldErrors.date && <small className="organizer-field-error">{fieldErrors.date}</small>}
              </label>

              <label className="organizer-field">
                <span>Time</span>

                <div className="organizer-input-icon">
                  <Clock3 size={16} />

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.time && <small className="organizer-field-error">{fieldErrors.time}</small>}
              </label>

              <label className="organizer-field">
                <span>End time</span>
                <div className="organizer-input-icon">
                  <Clock3 size={16} />
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                </div>
                {fieldErrors.endTime && <small className="organizer-field-error">{fieldErrors.endTime}</small>}
              </label>

              <label className="organizer-field">
                <span>Time zone</span>
                <select name="timezone" value={formData.timezone} onChange={handleChange} required>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Karachi">Asia/Karachi</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
                {fieldErrors.timezone && <small className="organizer-field-error">{fieldErrors.timezone}</small>}
              </label>

              <label className="organizer-field organizer-field-full">
                <span>Venue / location</span>

                <div className="organizer-input-icon">
                  <MapPin size={16} />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Main Auditorium, Block A"
                    maxLength="200"
                    required
                  />
                </div>
                  {fieldErrors.location && <small className="organizer-field-error">{fieldErrors.location}</small>}
              </label>

            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="organizer-form-section">

            <div className="organizer-form-section-heading">
              <div>
                <span>03 — Event information</span>
                <h2>Tell students about it</h2>
              </div>
            </div>

            <div className="organizer-form-grid">

              <label className="organizer-field organizer-field-full">
                <span>Description</span>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event, activities, requirements and other important information..."
                  rows="7"
                  maxLength="5000"
                  required
                />
                {fieldErrors.description && <small className="organizer-field-error">{fieldErrors.description}</small>}
              </label>

              <label className="organizer-field">
                <span>Promotion caption</span>
                <input type="text" name="promotionCaption" value={formData.promotionCaption} onChange={handleChange} placeholder="Join us for an unforgettable campus experience" />
              </label>

              <label className="organizer-field">
                <span>Hashtags</span>
                <input type="text" name="hashtags" value={formData.hashtags} onChange={handleChange} placeholder="#EventSphere, #CampusLife" />
              </label>

              <label className="organizer-field organizer-field-full">
                  <span>Event image</span>

                <div className="organizer-input-icon">
                  <ImagePlus size={16} />

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    name="image"
                    onChange={(event) => setFormData((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
                  />
                </div>
                {formData.image && <small>{formData.image.name}</small>}
              </label>

            </div>
          </section>

          {/* ACTIONS */}
          <div className="organizer-form-actions">

            <Link
              to="/organizer/events"
              className="organizer-cancel-btn"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="organizer-save-btn"
              disabled={submitting}
            >
              <Save size={17} />
              {submitting ? "Creating event..." : "Create event"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateEvent;