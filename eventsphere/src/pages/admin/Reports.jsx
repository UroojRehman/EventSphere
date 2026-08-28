import {
  BarChart3,
  CalendarDays,
  Download,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import "./Reports.css";
import { useEffect, useState } from "react";
import registrationService from "../../services/registrationService";
import attendanceService from "../../services/attendanceService";
import eventService from "../../services/eventService";
import adminService from "../../services/adminService";

function Reports() {
  const [metrics, setMetrics] = useState({ registrations: 0, attendance: 0, events: 0 });
  const [reportData, setReportData] = useState({ registrationsByMonth: [], categoryTotals: [] });
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    Promise.all([
      registrationService.getAllRegistrationsAdmin(),
      attendanceService.getAllAttendanceAdmin(),
      eventService.getAllEventsAdmin(),
      adminService.getReportData(),
    ]).then(([registrations, attendance, events, data]) => {
      setMetrics({
        registrations: registrations.count || 0,
        attendance: attendance.count || 0,
        events: events.count || 0,
      });
      setReportData(data);
    });
  }, []);

  const exportReport = async (format) => {
    setExporting(format);
    try { await adminService.exportReport(format); } finally { setExporting(""); }
  };

  const reportStats = [
    { title: "Total registrations", value: metrics.registrations, change: "Live", icon: UserCheck },
    { title: "Event attendance", value: metrics.attendance, change: "Live", icon: Users },
    { title: "Events hosted", value: metrics.events, change: "Live", icon: CalendarDays },
    { title: "Avg. participation", value: metrics.registrations ? `${Math.round((metrics.attendance / metrics.registrations) * 100)}%` : "0%", change: "Live", icon: TrendingUp },
  ];

  return (
    <div className="admin-reports-page">
      <div className="admin-reports-container">

        <section className="admin-reports-header">
          <div>
            <span>ANALYTICS & REPORTING</span>

            <h1>
              Platform
              <strong> reports.</strong>
            </h1>

            <p>
              Analyze event participation, registrations and
              overall EventSphere activity.
            </p>
          </div>

          <div className="admin-report-download-group">
          <button className="admin-report-download" onClick={() => exportReport("xlsx")} disabled={Boolean(exporting)}>
            <Download size={15} />
            {exporting === "xlsx" ? "Exporting..." : "Excel"}
          </button>
          <button className="admin-report-download" onClick={() => exportReport("pdf")} disabled={Boolean(exporting)}>
            <Download size={15} />
            {exporting === "pdf" ? "Exporting..." : "PDF"}
          </button>
          </div>
        </section>

        <div className="admin-report-stats">
          {reportStats.map((item) => {
            const Icon = item.icon;

            return (
              <div className="admin-report-stat" key={item.title}>
                <div className="report-stat-icon">
                  <Icon size={18} />
                </div>

                <strong>{item.value}</strong>

                <div>
                  <span>{item.title}</span>
                  <b>{item.change}</b>
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-reports-grid">

          <section className="admin-report-panel">
            <div className="report-panel-header">
              <div>
                <span>REGISTRATION TREND</span>
                <h2>Monthly registrations</h2>
              </div>

              <BarChart3 size={19} />
            </div>

            <div className="report-chart">
              {Array.from({ length: 12 }, (_, index) => reportData.registrationsByMonth.find((item) => item._id.month === index + 1)?.count || 0).map(
                (height, index) => (
                  <div className="report-column" key={index}>
                    <div
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />

                    <span>
                      {[
                        "J",
                        "F",
                        "M",
                        "A",
                        "M",
                        "J",
                        "J",
                        "A",
                        "S",
                        "O",
                        "N",
                        "D",
                      ][index]}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="admin-report-panel">
            <div className="report-panel-header">
              <div>
                <span>EVENT CATEGORIES</span>
                <h2>Participation</h2>
              </div>
            </div>

            <div className="category-report-list">
              {reportData.categoryTotals.map((category) => (
                <div
                  className="category-report"
                  key={category.name}
                >
                  <div>
                    <span>{category._id || "Other"}</span>
                    <strong>{category.registrations}</strong>
                  </div>

                  <div className="category-progress">
                    <span
                      style={{
                        width: `${Math.min((category.registrations / Math.max(...reportData.categoryTotals.map((item) => item.registrations), 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <section className="admin-report-summary">
          <div>
            <span>REPORT SUMMARY</span>
            <h2>EventSphere performance overview</h2>
          </div>

          <p>
            Event participation continues to grow steadily.
            Technical and sports events currently show the
            strongest student engagement, while workshops have
            room for additional promotion.
          </p>
        </section>

      </div>
    </div>
  );
}

export default Reports;