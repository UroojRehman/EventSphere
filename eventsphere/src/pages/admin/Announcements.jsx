import {
  Bell,
  Edit3,
  Megaphone,
  Plus,
  Search,
  Trash2,
  X,
  Users,
  Send
} from "lucide-react";

import { useEffect, useState } from "react";

import announcementService from "../../services/announcementService";
import eventService from "../../services/eventService";
import adminService from "../../services/adminService";
import { useAuthContext } from "../../context/AuthContext";

import "./Announcements.css";

const emptyForm = {
  title: "",
  category: "Campus",
  text: "",
  status: "draft",
  targetRoles: [],
  targetUserIds: [],
  eventId: ""
};

const AVAILABLE_ROLES = [
  {
    value: "participant",
    label: "Participants"
  },
  {
    value: "organizer",
    label: "Organizers"
  },
  {
    value: "admin",
    label: "Administrators"
  }
];

function Announcements() {
  const { user } = useAuthContext();

  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({ ...emptyForm });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // LOAD ANNOUNCEMENTS
  // --------------------------------------------------

  const loadItems = async () => {
    try {
      setError("");

      const response = await announcementService.getAll();

      setItems(response.announcements || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load announcements.");
    }
  };

  // --------------------------------------------------
  // LOAD EVENTS
  // --------------------------------------------------

  const loadEvents = async () => {
    try {
      if (user?.role !== "organizer") return;

      const response = await eventService.getMyEvents();

      setEvents(response.events || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load events.");
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!user) return;

    loadItems();
    loadEvents();
  }, [user]);

  // --------------------------------------------------
  // FETCH USERS BASED ON SELECTED ROLES
  // --------------------------------------------------

  const fetchUsersByRoles = async (roles) => {
    if (!roles.length) {
      setUsers([]);
      return;
    }

    try {
      setLoadingUsers(true);
      setError("");

      const results = await Promise.all(
        roles.map((role) => adminService.getUsersByRole(role))
      );

      const allUsers = results.flatMap(
        (response) => response.users || []
      );

      // Remove duplicate users
      const uniqueUsers = Array.from(
        new Map(
          allUsers.map((item) => [item._id, item])
        ).values()
      );

      setUsers(uniqueUsers);

      // Automatically select all users belonging to selected roles
      setForm((previous) => ({
        ...previous,
        targetUserIds: uniqueUsers.map((item) => item._id)
      }));
    } catch (requestError) {
      setError(
        requestError.message ||
        "Unable to fetch users for selected roles."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // --------------------------------------------------
  // ROLE CHANGE
  // --------------------------------------------------

  const handleRoleChange = (role) => {
    setForm((previous) => {
      const alreadySelected = previous.targetRoles.includes(role);

      const updatedRoles = alreadySelected
        ? previous.targetRoles.filter((item) => item !== role)
        : [...previous.targetRoles, role];

      fetchUsersByRoles(updatedRoles);

      return {
        ...previous,
        targetRoles: updatedRoles,
        targetUserIds: []
      };
    });
  };

  // --------------------------------------------------
  // USER SELECTION
  // --------------------------------------------------

  const toggleUser = (userId) => {
    setForm((previous) => {
      const exists = previous.targetUserIds.includes(userId);

      return {
        ...previous,
        targetUserIds: exists
          ? previous.targetUserIds.filter((id) => id !== userId)
          : [...previous.targetUserIds, userId]
      };
    });
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const submit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        throw new Error("Announcement title is required.");
      }

      if (!form.text.trim()) {
        throw new Error("Announcement text is required.");
      }

      if (user?.role === "admin" && !form.targetRoles.length) {
        throw new Error(
          "Please select at least one target role."
        );
      }

      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        text: form.text.trim(),
        status: form.status,

        targetRoles:
          user?.role === "admin"
            ? form.targetRoles
            : ["participant"],

        targetUserIds:
          user?.role === "admin"
            ? form.targetUserIds
            : [],

        eventId: form.eventId || null
      };

      if (editingId) {
        await announcementService.update(
          editingId,
          payload
        );

        setSuccess("Announcement updated successfully.");
      } else {
        await announcementService.create(payload);

        setSuccess("Announcement created successfully.");
      }

      resetForm();

      await loadItems();
    } catch (requestError) {
      setError(
        requestError.message ||
        "Unable to save announcement."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const resetForm = () => {
    setForm({ ...emptyForm });

    setEditingId(null);
    setUsers([]);

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const startEdit = (item) => {
    const roles = item.targetRoles || [];

    setEditingId(item._id);

    setForm({
      title: item.title || "",
      category: item.category || "Campus",
      text: item.text || "",
      status: item.status || "draft",
      targetRoles: roles,
      targetUserIds: item.targetUserIds || [],
      eventId: item.event?._id || ""
    });

    if (roles.length) {
      fetchUsersByRoles(roles);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) {
      return;
    }

    try {
      setError("");

      await announcementService.remove(id);

      await loadItems();

      setSuccess("Announcement deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (requestError) {
      setError(
        requestError.message ||
        "Unable to delete announcement."
      );
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filtered = items.filter((item) =>
    `${item.title} ${item.category} ${item.text}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="admin-announcements-page">

      <div className="admin-announcements-container">

        {/* HEADER */}

        <section className="admin-announcements-header">
          <div>
            <span>CONTENT MANAGEMENT</span>

            <h1>
              Campus
              <strong> announcements.</strong>
            </h1>

            <p>
              Publish important updates and target them
              to the right users.
            </p>
          </div>
        </section>

        {/* SUCCESS */}

        {success && (
          <div className="admin-announcements-success">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="admin-announcements-error">
            {error}
          </div>
        )}

        {/* ADD / EDIT ANNOUNCEMENT */}

        <section className="announcement-editor">

          <div className="announcement-editor-header">

            <div>
              <div className="announcement-editor-icon">
                <Megaphone size={20} />
              </div>

              <div>
                <h2>
                  {editingId
                    ? "Edit Announcement"
                    : "Create New Announcement"}
                </h2>

                <p>
                  {editingId
                    ? "Update the announcement details and audience."
                    : "Create an announcement and select who should receive it."}
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                className="announcement-cancel"
                onClick={resetForm}
              >
                <X size={15} />
                Cancel
              </button>
            )}

          </div>

          <form
            className="admin-announcement-form"
            onSubmit={submit}
          >

            {/* TITLE */}

            <div className="form-group">
              <label>Announcement Title</label>

              <input
                name="title"
                required
                placeholder="e.g. Annual Sports Gala Registration Open"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* CATEGORY */}

            <div className="form-group">
              <label>Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Campus">
                  Campus
                </option>

                <option value="Event">
                  Event
                </option>

                <option value="Academic">
                  Academic
                </option>

                <option value="General">
                  General
                </option>

                <option value="Important">
                  Important
                </option>
              </select>
            </div>

            {/* TEXT */}

            <div className="form-group full-width">
              <label>Announcement Message</label>

              <textarea
                name="text"
                required
                rows={5}
                placeholder="Write your announcement..."
                value={form.text}
                onChange={handleChange}
              />
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>
              </select>
            </div>

            {/* ADMIN TARGETING */}

            {user?.role === "admin" && (
              <div className="announcement-targeting full-width">

                <div className="targeting-heading">
                  <Users size={18} />

                  <div>
                    <h3>
                      Target Audience
                    </h3>

                    <p>
                      Select roles. Users belonging to
                      those roles will be fetched automatically.
                    </p>
                  </div>
                </div>

                {/* ROLES */}

                <div className="role-selector">

                  {AVAILABLE_ROLES.map((role) => {

                    const selected =
                      form.targetRoles.includes(
                        role.value
                      );

                    return (
                      <button
                        type="button"
                        key={role.value}
                        className={
                          selected
                            ? "role-chip active"
                            : "role-chip"
                        }
                        onClick={() =>
                          handleRoleChange(
                            role.value
                          )
                        }
                      >
                        {role.label}
                      </button>
                    );
                  })}

                </div>

                {/* FETCH STATUS */}

                {loadingUsers && (
                  <p className="target-loading">
                    Fetching users for selected roles...
                  </p>
                )}

                {/* USERS */}

                {!loadingUsers &&
                  users.length > 0 && (
                    <div className="target-users">

                      <div className="target-users-header">

                        <strong>
                          Users found: {users.length}
                        </strong>

                        <span>
                          Selected:{" "}
                          {form.targetUserIds.length}
                        </span>

                      </div>

                      <div className="target-user-list">

                        {users.map((targetUser) => {

                          const selected =
                            form.targetUserIds.includes(
                              targetUser._id
                            );

                          return (
                            <label
                              key={targetUser._id}
                              className={
                                selected
                                  ? "target-user selected"
                                  : "target-user"
                              }
                            >

                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleUser(
                                    targetUser._id
                                  )
                                }
                              />

                              <div>
                                <strong>
                                  {targetUser.name}
                                </strong>

                                <small>
                                  {targetUser.email}
                                </small>
                              </div>

                              <span>
                                {targetUser.role}
                              </span>

                            </label>
                          );
                        })}

                      </div>
                    </div>
                  )}

                {/* NO USERS */}

                {!loadingUsers &&
                  form.targetRoles.length > 0 &&
                  users.length === 0 && (
                    <p className="target-empty">
                      No users found for the selected roles.
                    </p>
                  )}

              </div>
            )}

            {/* ORGANIZER EVENT */}

            {user?.role === "organizer" && (
              <div className="form-group full-width">

                <label>
                  Event Target
                </label>

                <select
                  name="eventId"
                  value={form.eventId}
                  onChange={handleChange}
                >
                  <option value="">
                    All participants
                  </option>

                  {events.map((event) => (
                    <option
                      key={event._id}
                      value={event._id}
                    >
                      {event.title}
                    </option>
                  ))}
                </select>

                <small>
                  Selecting an event allows the
                  announcement to be associated with
                  that event.
                </small>

              </div>
            )}

            {/* ACTIONS */}

            <div className="announcement-form-actions">

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
              >
                {editingId ? (
                  <>
                    <Edit3 size={16} />
                    {loading
                      ? "Updating..."
                      : "Update Announcement"}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {loading
                      ? "Publishing..."
                      : "Create Announcement"}
                  </>
                )}
              </button>

            </div>

          </form>
        </section>

        {/* SEARCH */}

        <div className="admin-announcement-toolbar">

          <div className="admin-announcement-search">

            <Search size={16} />

            <input
              placeholder="Search announcements..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        {/* ANNOUNCEMENT LIST */}

        <div className="admin-announcement-list">

          {filtered.map((item, index) => (

            <article
              className="admin-announcement-card"
              key={item._id}
            >

              <div className="announcement-index">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="announcement-main">

                <div className="announcement-meta">

                  <span>
                    {item.category}
                  </span>

                  <time>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleDateString()
                      : ""}
                  </time>

                  <b
                    className={item.status}
                  >
                    {item.status}
                  </b>

                </div>

                <h2>
                  {item.title}
                </h2>

                <p>
                  {item.text}
                </p>

                {/* TARGET INFO */}

                <div className="announcement-target-info">

                  {item.targetRoles?.length > 0 && (
                    <span>
                      <Users size={13} />

                      {item.targetRoles.join(", ")}
                    </span>
                  )}

                  {item.targetUserIds?.length > 0 && (
                    <span>
                      {item.targetUserIds.length} targeted users
                    </span>
                  )}

                  {item.event && (
                    <span>
                      Event: {item.event.title}
                    </span>
                  )}

                </div>

                {/* ACTIONS */}

                <div className="announcement-actions">

                  {user?.role === "admin" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(item)
                        }
                      >
                        <Edit3 size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete"
                        onClick={() =>
                          remove(item._id)
                        }
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </>
                  )}

                </div>

              </div>

              <div className="announcement-icon">
                <Megaphone size={22} />
              </div>

            </article>

          ))}

        </div>

        {!filtered.length && (
          <div className="admin-announcements-empty">

            <Bell size={30} />

            <strong>
              No announcements found
            </strong>

          </div>
        )}

      </div>

    </div>
  );
}

export default Announcements;