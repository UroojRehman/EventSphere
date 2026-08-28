
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  Search,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import eventService from "../../services/eventService";
import attendanceService from "../../services/attendanceService";
import "./Attendance.css";

const attendanceData = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    event: "Innovation Summit 2026",
    time: "09:12 AM",
    status: "Present",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    event: "Innovation Summit 2026",
    time: "09:18 AM",
    status: "Present",
  },
  {
    id: 3,
    name: "Hamza Ali",
    email: "hamza.ali@example.com",
    event: "Cultural Night",
    time: "--",
    status: "Absent",
  },
  {
    id: 4,
    name: "Ayesha Malik",
    email: "ayesha.malik@example.com",
    event: "Sports Festival",
    time: "10:04 AM",
    status: "Present",
  },
  {
    id: 5,
    name: "Usman Raza",
    email: "usman.raza@example.com",
    event: "Student Workshop",
    time: "11:03 AM",
    status: "Present",
  },
  {
    id: 6,
    name: "Maham Noor",
    email: "maham.noor@example.com",
    event: "Innovation Summit 2026",
    time: "--",
    status: "Absent",
  },
  {
    id: 7,
    name: "Bilal Hassan",
    email: "bilal.hassan@example.com",
    event: "Cultural Night",
    time: "06:15 PM",
    status: "Present",
  },
  {
    id: 8,
    name: "Hira Shah",
    email: "hira.shah@example.com",
    event: "Sports Festival",
    time: "09:45 AM",
    status: "Present",
  },
];

function Attendance() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [records, setRecords] = useState(attendanceData);
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    if (!scannerOpen) return undefined;

    const scanner = new Html5Qrcode("attendance-qr-reader");
    let scanHandled = false;
    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        if (scanHandled) return;
        scanHandled = true;
        let token = decodedText;
        try {
          const scannedUrl = new URL(decodedText);
          token = scannedUrl.searchParams.get("token") || decodedText;
        } catch {
          // Keep supporting legacy QR codes containing the raw token.
        }
        setScannerOpen(false);
        setCheckInMessage("QR code recognized. Checking in participant...");
        try {
          await attendanceService.markAttendance(null, token, true);
          setCheckInMessage("Participant checked in successfully.");
          setCheckInCode("");
        } catch (requestError) {
          setCheckInMessage(requestError.message);
        }
      },
      () => {}
    ).catch((requestError) => setCheckInMessage(requestError.message));

    return () => {
      scanner.stop()
        .then(() => scanner.clear())
        .catch(() => {
          try {
            scanner.clear();
          } catch {
            // The scanner may already be stopped during unmount.
          }
        });
    };
  }, [scannerOpen]);

  useEffect(() => {
    eventService.getMyEvents().then(async (eventResponse) => {
      const responses = await Promise.all(
        (eventResponse.events || []).map((event) => attendanceService.getEventAttendance(event._id))
      );
      setRecords(responses.flatMap((response) => (response.attendances || []).map((item) => ({
        id: item._id,
        registrationId: item.registration?._id || item.registration,
        name: item.participant?.name || "Unknown participant",
        email: item.participant?.email || "",
        event: item.event?.title || "Unknown event",
        time: item.markedOn ? new Date(item.markedOn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
        status: item.attended ? "Present" : "Absent",
      }))));
    });
  }, []);

  const presentCount = records.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = records.filter(
    (item) => item.status === "Absent"
  ).length;

  const attendancePercentage = records.length
    ? Math.round((presentCount / records.length) * 100)
    : 0;

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.event.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  const updateAttendance = async (item, status) => {
    await attendanceService.markAttendance(null, item.registrationId, status === "Present");
    setRecords((prev) => prev.map((record) => record.id === item.id ? {
      ...record,
      status,
      time: status === "Present" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
    } : record));
  };

  const checkInByCode = async (event) => {
    event.preventDefault();
    setCheckInMessage("");
    try {
      await attendanceService.markAttendance(null, checkInCode.trim(), true);
      setCheckInMessage("Participant checked in successfully.");
      setCheckInCode("");
    } catch (requestError) {
      setCheckInMessage(requestError.message);
    }
  };

  const exportAttendance = () => {
    const headers = [
      "Participant",
      "Email",
      "Event",
      "Check-in Time",
      "Status",
    ];

    const rows = records.map((item) => [
      item.name,
      item.email,
      item.event,
      item.time,
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
    link.download = "event-attendance.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="organizer-attendance-page">
      <div className="organizer-attendance-container">

        {/* HEADER */}
        <div className="attendance-header">
          <div>
            <Link
              to="/organizer"
              className="attendance-back"
            >
              <ArrowLeft size={15} />
              Back to dashboard
            </Link>

            <div className="attendance-kicker">
              ORGANIZER PANEL
            </div>

            <h1>
              Event
              <span> attendance.</span>
            </h1>

            <p>
              Track participant attendance, check-in times and
              event participation from one place.
            </p>
          </div>

          <div className="attendance-header-icon">
            <UserCheck size={25} />
          </div>
        </div>

        {/* STATS */}
        <div className="attendance-stats">

          <div className="attendance-stat">
            <div className="attendance-stat-icon">
              <Users size={18} />
            </div>

            <div>
              <strong>{records.length}</strong>
              <span>Total participants</span>
            </div>
          </div>

          <div className="attendance-stat">
            <div className="attendance-stat-icon present">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>{presentCount}</strong>
              <span>Present</span>
            </div>
          </div>

          <div className="attendance-stat">
            <div className="attendance-stat-icon absent">
              <XCircle size={18} />
            </div>

            <div>
              <strong>{absentCount}</strong>
              <span>Absent</span>
            </div>
          </div>

          <div className="attendance-stat">
            <div className="attendance-stat-icon rate">
              <Clock3 size={18} />
            </div>

            <div>
              <strong>{attendancePercentage}%</strong>
              <span>Attendance rate</span>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}
        <div className="attendance-toolbar">

          <div className="attendance-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search participant or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="attendance-toolbar-actions">

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All attendance</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>

            <button
              type="button"
              className="attendance-export"
              onClick={exportAttendance}
            >
              <Download size={15} />
              Export
            </button>

          </div>
        </div>

        <form className="attendance-toolbar" onSubmit={checkInByCode}>
          <div className="attendance-search">
            <UserCheck size={17} />
            <input value={checkInCode} onChange={(event) => setCheckInCode(event.target.value)} placeholder="Enter participant check-in code" required />
          </div>
          <button type="button" className="attendance-export" onClick={() => setScannerOpen((current) => !current)}>
            <UserCheck size={15} /> {scannerOpen ? "Close scanner" : "Scan QR"}
          </button>
          <button type="submit" className="attendance-export"><CheckCircle2 size={15} /> Check in</button>
          {checkInMessage && <span>{checkInMessage}</span>}
        </form>
        {scannerOpen && <div id="attendance-qr-reader" className="attendance-qr-reader" />}

        {/* TABLE */}
        <div className="attendance-table-wrapper">

          <div className="attendance-table">

            <div className="attendance-table-head">
              <span>Participant</span>
              <span>Event</span>
              <span>Check-in</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredRecords.length > 0 ? (
              filteredRecords.map((item) => (
                <div
                  className="attendance-table-row"
                  key={item.id}
                >

                  {/* PARTICIPANT */}
                  <div className="attendance-participant">

                    <div className="attendance-avatar">
                      {item.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <strong>{item.name}</strong>

                      <span>
                        {item.email}
                      </span>
                    </div>

                  </div>

                  {/* EVENT */}
                  <div className="attendance-event">
                    <strong>{item.event}</strong>
                  </div>

                  {/* TIME */}
                  <div className="attendance-time">
                    <Clock3 size={13} />
                    {item.time}
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`attendance-status ${item.status.toLowerCase()}`}
                    >
                      {item.status === "Present" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}

                      {item.status}
                    </span>
                  </div>

                  {/* ACTION */}
                  <div className="attendance-actions">

                    {item.status === "Absent" ? (
                      <button
                        type="button"
                        className="attendance-mark-present"
                        title="Mark present"
                        onClick={() =>
                          updateAttendance(
                            item,
                            "Present"
                          )
                        }
                      >
                        <UserCheck size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="attendance-mark-absent"
                        title="Mark absent"
                        onClick={() =>
                          updateAttendance(
                            item,
                            "Absent"
                          )
                        }
                      >
                        <XCircle size={15} />
                      </button>
                    )}

                  </div>

                </div>
              ))
            ) : (
              <div className="attendance-empty">
                <Search size={25} />

                <strong>
                  No attendance records found
                </strong>

                <span>
                  Try changing your search or filter.
                </span>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="attendance-footer">

          <span>
            Showing {filteredRecords.length} of{" "}
            {records.length} records
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

export default Attendance;
