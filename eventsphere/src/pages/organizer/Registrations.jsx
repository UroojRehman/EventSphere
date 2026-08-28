
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Mail,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import "./Registrations.css";

const registrationsData = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    event: "Innovation Summit 2026",
    category: "Technical",
    date: "Aug 25, 2026",
    status: "Confirmed",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    event: "Innovation Summit 2026",
    category: "Technical",
    date: "Aug 24, 2026",
    status: "Confirmed",
  },
  {
    id: 3,
    name: "Hamza Ali",
    email: "hamza.ali@example.com",
    event: "Cultural Night",
    category: "Cultural",
    date: "Aug 23, 2026",
    status: "Pending",
  },
  {
    id: 4,
    name: "Ayesha Malik",
    email: "ayesha.malik@example.com",
    event: "Sports Festival",
    category: "Sports",
    date: "Aug 22, 2026",
    status: "Confirmed",
  },
  {
    id: 5,
    name: "Usman Raza",
    email: "usman.raza@example.com",
    event: "Student Workshop",
    category: "Workshop",
    date: "Aug 21, 2026",
    status: "Cancelled",
  },
  {
    id: 6,
    name: "Maham Noor",
    email: "maham.noor@example.com",
    event: "Innovation Summit 2026",
    category: "Technical",
    date: "Aug 20, 2026",
    status: "Confirmed",
  },
  {
    id: 7,
    name: "Bilal Hassan",
    email: "bilal.hassan@example.com",
    event: "Cultural Night",
    category: "Cultural",
    date: "Aug 19, 2026",
    status: "Pending",
  },
  {
    id: 8,
    name: "Hira Shah",
    email: "hira.shah@example.com",
    event: "Sports Festival",
    category: "Sports",
    date: "Aug 18, 2026",
    status: "Confirmed",
  },
];

function Registrations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");

  const loadRegistrations = async () => {
    try {
      const eventResponse = await eventService.getMyEvents();
      const responses = await Promise.all(
        (eventResponse.events || []).map((event) => registrationService.getEventRegistrations(event._id))
      );
      setRegistrations(responses.flatMap((response) => (response.registrations || []).map((item) => ({
        id: item._id,
        registrationId: item._id,
        name: item.participant?.name || "Unknown participant",
        email: item.participant?.email || "",
        event: item.event?.title || "Unknown event",
        category: item.event?.category || "",
        date: new Date(item.registeredOn || item.createdAt).toLocaleDateString(),
        status: { confirmed: "Confirmed", pending: "Pending", cancelled: "Cancelled", rejected: "Rejected" }[item.status] || item.status,
      }))));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadRegistrations();
    const refreshTimer = window.setInterval(loadRegistrations, 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.event.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, registrations]);

  const confirmedCount = registrations.filter(
    (item) => item.status === "Confirmed"
  ).length;

  const pendingCount = registrations.filter(
    (item) => item.status === "Pending"
  ).length;

  const cancelledCount = registrations.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const updateStatus = async (id, status) => {
    try {
      await registrationService.updateRegistrationStatus(id, status.toLowerCase());
      await loadRegistrations();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const contactParticipant = async (item) => {
    const message = window.prompt(`Message ${item.name}`);
    if (!message) return;
    try {
      await registrationService.contactParticipant(item.registrationId, message);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Event",
      "Category",
      "Date",
      "Status",
    ];

    const rows = registrations.map((item) => [
      item.name,
      item.email,
      item.event,
      item.category,
      item.date,
      item.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "event-registrations.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="organizer-registrations-page">
      <div className="organizer-registrations-container">

        {/* HEADER */}
        <div className="registrations-header">
          <div>
            <Link
              to="/organizer"
              className="registrations-back"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>

            <div className="registrations-kicker">
              ORGANIZER PANEL
            </div>

            <h1>
              Event
              <span> registrations.</span>
            </h1>

            <p>
              Manage participants, review registrations and keep
              track of who is joining your events.
            </p>
          </div>

          <div className="registrations-header-icon">
            <Users size={25} />
          </div>
        </div>

        {/* STATS */}
        <div className="registrations-stats">

          <div className="registration-stat">
            <div className="registration-stat-icon">
              <Users size={18} />
            </div>

            <div>
              <strong>{registrations.length}</strong>
              <span>Total registrations</span>
            </div>
          </div>

          <div className="registration-stat">
            <div className="registration-stat-icon confirmed">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>{confirmedCount}</strong>
              <span>Confirmed</span>
            </div>
          </div>

          <div className="registration-stat">
            <div className="registration-stat-icon pending">
              <Users size={18} />
            </div>

            <div>
              <strong>{pendingCount}</strong>
              <span>Pending</span>
            </div>
          </div>

          <div className="registration-stat">
            <div className="registration-stat-icon cancelled">
              <XCircle size={18} />
            </div>

            <div>
              <strong>{cancelledCount}</strong>
              <span>Cancelled</span>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}
        <div className="registrations-toolbar">
          {error && <p className="organizer-error-message">{error}</p>}

          <div className="registration-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search participant or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="registration-toolbar-actions">

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={handleExport}
              className="registration-export"
            >
              <Download size={15} />
              Export
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="registrations-table-wrapper">

          <div className="registrations-table">

            <div className="registration-table-head">
              <span>Participant</span>
              <span>Event</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((item) => (
                <div
                  className="registration-table-row"
                  key={item.id}
                >

                  <div className="registration-participant">

                    <div className="registration-avatar">
                      {item.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <strong>{item.name}</strong>

                      <span>
                        <Mail size={11} />
                        {item.email}
                      </span>
                    </div>

                  </div>

                  <div className="registration-event">
                    <strong>{item.event}</strong>
                    <span>{item.category}</span>
                  </div>

                  <div className="registration-date">
                    {item.date}
                  </div>

                  <div>
                    <span
                      className={`registration-status ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="registration-actions">

                    {item.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          className="registration-confirm"
                          title="Confirm registration"
                          onClick={() =>
                            updateStatus(item.id, "Confirmed")
                          }
                        >
                          <CheckCircle2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="registration-cancel"
                          title="Reject registration"
                          onClick={() =>
                            updateStatus(item.id, "Rejected")
                          }
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    )}

                    {item.status === "Confirmed" && (
                      <button
                        type="button"
                        className="registration-mail"
                        title="Contact participant"
                        onClick={() => contactParticipant(item)}
                      >
                        <Mail size={15} />
                      </button>
                    )}

                    {item.status === "Cancelled" && (
                      <button
                        type="button"
                        className="registration-confirm"
                        title="Restore registration"
                        onClick={() =>
                          updateStatus(item.id, "Confirmed")
                        }
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}

                  </div>

                </div>
              ))
            ) : (
              <div className="registration-empty">
                <Search size={25} />
                <strong>No registrations found</strong>
                <span>
                  Try changing your search or filter.
                </span>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER INFO */}
        <div className="registrations-footer">
          <span>
            Showing {filteredRegistrations.length} of{" "}
            {registrations.length} registrations
          </span>

          <Link to="/organizer/events">
            Manage events
            <ArrowLeft size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Registrations;
