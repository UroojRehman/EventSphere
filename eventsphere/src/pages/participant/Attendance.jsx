
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import attendanceService from "../../services/attendanceService";
import registrationService from "../../services/registrationService";
import "./Attendance.css";

const attendanceData = [
  {
    event: "Innovation Summit 2026",
    category: "Technical",
    date: "Sep 05, 2026",
    time: "10:00 AM",
    venue: "Main Auditorium",
    status: "Upcoming",
  },
  {
    event: "Cultural Night 2026",
    category: "Cultural",
    date: "Aug 18, 2026",
    time: "06:00 PM",
    venue: "College Ground",
    status: "Present",
  },
  {
    event: "Web Development Workshop",
    category: "Workshop",
    date: "Aug 10, 2026",
    time: "11:00 AM",
    venue: "Computer Lab 02",
    status: "Present",
  },
  {
    event: "Sports Festival",
    category: "Sports",
    date: "Jul 28, 2026",
    time: "09:00 AM",
    venue: "Sports Complex",
    status: "Absent",
  },
  {
    event: "Career Guidance Seminar",
    category: "Academic",
    date: "Jul 15, 2026",
    time: "12:00 PM",
    venue: "Seminar Hall",
    status: "Present",
  },
];

function CheckInQr({ token }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    const checkInUrl = `${window.location.origin}/check-in?token=${encodeURIComponent(token)}`;
    QRCode.toDataURL(checkInUrl, { width: 220, margin: 2, errorCorrectionLevel: "M" })
      .then(setSource)
      .catch(() => setSource(""));
  }, [token]);

  if (!source) return null;
  return <img className="attendance-checkin-qr" src={source} alt="Event check-in QR code" />;
}

function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    Promise.all([
      registrationService.getMyRegistrations(),
      attendanceService.getMyAttendance(),
    ]).then(([registrationResponse, attendanceResponse]) => {
      const attendanceByEvent = new Map(
        (attendanceResponse.attendances || []).map((item) => [item.event?._id, item])
      );
      setRecords((registrationResponse.registrations || [])
        .filter((item) => ["confirmed", "waitlist"].includes(item.status))
        .map((registration) => {
          const event = registration.event;
          const attendance = attendanceByEvent.get(event?._id);
          return {
            event: event?.title || "Event",
            category: event?.category || "",
            date: event?.date ? new Date(event.date).toLocaleDateString() : "-",
            time: event?.time || "",
            venue: event?.venue || "",
            status: attendance ? (attendance.attended ? "Present" : "Absent") : "Upcoming",
            checkInToken: registration.checkInToken,
          };
        }));
    });
  }, []);

  const activeAttendance = records;
  const filteredAttendance = activeAttendance.filter((item) => {
    const matchesSearch = item.event
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "All" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  const presentCount = activeAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = activeAttendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const completedCount = activeAttendance.length;

  const attendancePercentage =
    completedCount > 0
      ? Math.round((presentCount / completedCount) * 100)
      : 0;

  return (
    <div className="attendance-page">
      <div className="attendance-container">

        {/* HEADER */}
        <section className="attendance-header">
          <div>
            <div className="attendance-kicker">
              <CheckCircle2 size={14} />
              PARTICIPANT PORTAL
            </div>

            <h1>
              Your event
              <span> attendance.</span>
            </h1>

            <p>
              Track your participation, attendance history and upcoming
              registered events from one place.
            </p>
          </div>

          <Link
            to="/participant/my-events"
            className="attendance-header-button"
          >
            My Events
            <ArrowRight size={15} />
          </Link>
        </section>

        {/* STATS */}
        <section className="attendance-stats">

          <div className="attendance-stat-card attendance-stat-main">
            <div className="attendance-stat-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <span>Attendance rate</span>
              <strong>{attendancePercentage}%</strong>
            </div>

            <div className="attendance-progress">
              <span
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Present</span>
              <strong>{presentCount}</strong>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon attendance-absent-icon">
              <XCircle size={19} />
            </div>

            <div>
              <span>Absent</span>
              <strong>{absentCount}</strong>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon">
              <CalendarDays size={19} />
            </div>

            <div>
              <span>Total attended</span>
              <strong>{completedCount}</strong>
            </div>
          </div>

        </section>

        {/* TOOLBAR */}
        <section className="attendance-toolbar">

          <div className="attendance-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="attendance-filters">
            {["All", "Present", "Absent", "Upcoming"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

        </section>

        {/* TABLE */}
        <section className="attendance-table-card">

          <div className="attendance-table-head">
            <div>
              <span>ATTENDANCE HISTORY</span>
              <h2>Event participation</h2>
            </div>

            <span className="attendance-record-count">
              {filteredAttendance.length} Records
            </span>
          </div>

          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((item) => (
                    <tr key={`${item.event}-${item.date}`}>

                      <td>
                        <div className="attendance-event">
                          <div className="attendance-event-icon">
                            <CalendarDays size={17} />
                          </div>

                          <div>
                            <strong>{item.event}</strong>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="attendance-detail">
                          <strong>{item.date}</strong>
                          <span>
                            <Clock3 size={12} />
                            {item.time}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="attendance-venue">
                          <MapPin size={13} />
                          {item.venue}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`attendance-status attendance-status-${item.status.toLowerCase()}`}
                        >
                          {item.status === "Present" && (
                            <CheckCircle2 size={13} />
                          )}

                          {item.status === "Absent" && (
                            <XCircle size={13} />
                          )}

                          {item.status === "Upcoming" && (
                            <Clock3 size={13} />
                          )}

                          {item.status}
                        </span>
                      </td>

                      <td>
                        <Link
                          to="/participant/my-events"
                          className="attendance-view-button"
                        >
                          View
                          <ArrowRight size={13} />
                        </Link>
                        {item.status === "Upcoming" && item.checkInToken && (
                          <div className="attendance-checkin-wrap">
                            <CheckInQr token={item.checkInToken} />
                            <small className="attendance-checkin-code">Show this QR code to the organizer</small>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">
                      <div className="attendance-empty">
                        <Search size={25} />
                        <strong>No attendance records found</strong>
                        <span>
                          Try changing your search or filter.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>

      </div>
    </div>
  );
}

export default Attendance;

