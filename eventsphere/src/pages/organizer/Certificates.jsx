
import {
  Award,
  CheckCircle2,
  Download,
  Eye,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import certificateService from "../../services/certificateService";
import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import "./Certificates.css";

const certificateData = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    event: "Innovation Summit 2026",
    type: "Participation",
    status: "Issued",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    event: "Innovation Summit 2026",
    type: "Participation",
    status: "Issued",
  },
  {
    id: 3,
    name: "Hamza Ali",
    email: "hamza.ali@example.com",
    event: "Cultural Night",
    type: "Achievement",
    status: "Pending",
  },
  {
    id: 4,
    name: "Ayesha Malik",
    email: "ayesha.malik@example.com",
    event: "Sports Festival",
    type: "Achievement",
    status: "Issued",
  },
  {
    id: 5,
    name: "Usman Raza",
    email: "usman.raza@example.com",
    event: "Student Workshop",
    type: "Participation",
    status: "Pending",
  },
  {
    id: 6,
    name: "Maham Noor",
    email: "maham.noor@example.com",
    event: "Innovation Summit 2026",
    type: "Participation",
    status: "Issued",
  },
];

function Certificates() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const [eventResponse, certificateResponse] = await Promise.all([
          eventService.getMyEvents(),
          certificateService.getOrganizerCertificates(),
        ]);
        const issued = certificateResponse.certificates || [];
        const registrationResponses = await Promise.all(
          (eventResponse.events || []).map((event) => registrationService.getEventRegistrations(event._id))
        );
        const issuedKeys = new Set(issued.map((item) => `${item.event?._id}-${item.participant?._id}`));
        const eligible = registrationResponses.flatMap((response) =>
          (response.registrations || [])
            .filter((item) => item.status === "confirmed")
            .map((item) => ({
              id: `${item.event._id}-${item.participant._id}`,
              eventId: item.event._id,
              participantId: item.participant._id,
              registrationId: item._id,
              feePaid: item.certificateFeePaid,
              feeAmount: item.certificateFeeAmount || 0,
              paymentStatus: item.certificatePaymentStatus || (item.certificateFeePaid ? "approved" : "not_requested"),
              paymentProofUrl: item.certificatePaymentProofUrl,
              name: item.participant.name,
              email: item.participant.email,
              event: item.event.title,
              type: "Participation",
              status: issuedKeys.has(`${item.event._id}-${item.participant._id}`) ? "Issued" : "Pending",
              certificateId: issued.find((certificate) => `${certificate.event?._id}-${certificate.participant?._id}` === `${item.event._id}-${item.participant._id}`)?._id,
            }))
        );
        setCertificates(eligible);
      } catch (requestError) {
        setError(requestError.message);
      }
    };
    loadCertificates();
  }, []);

  const issuedCount = certificates.filter(
    (item) => item.status === "Issued"
  ).length;

  const pendingCount = certificates.filter(
    (item) => item.status === "Pending"
  ).length;

  const filteredCertificates = useMemo(() => {
    return certificates.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.event.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [certificates, search, filter]);

  const issueCertificate = async (item) => {
    try {
      const response = await certificateService.generateCertificate(item.eventId, item.participantId);
      setCertificates((prev) => prev.map((certificate) => certificate.id === item.id
        ? { ...certificate, status: "Issued", certificateId: response.certificate._id }
        : certificate));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const requestFee = async (item) => {
    const amount = window.prompt("Enter the certificate fee amount", String(item.feeAmount || ""));
    if (amount === null) return;
    try {
      await registrationService.requestCertificateFee(item.registrationId, amount);
      setCertificates((current) => current.map((certificate) => certificate.id === item.id
        ? { ...certificate, feeAmount: Number(amount), paymentStatus: "requested" }
        : certificate));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const reviewPayment = async (item, approved) => {
    try {
      const response = await registrationService.reviewCertificatePayment(item.registrationId, approved);
      setCertificates((current) => current.map((certificate) => certificate.id === item.id
        ? { ...certificate, paymentStatus: approved ? "approved" : "rejected", feePaid: approved, status: approved ? "Issued" : certificate.status, certificateId: response.certificate?._id || certificate.certificateId }
        : certificate));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const downloadCertificate = async (item) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/certificates/${item.certificateId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Certificate download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.name}-certificate.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadPersonalized = async (item, file) => {
    if (!file) return;
    setUploadingId(item.id);
    try {
      const response = await certificateService.uploadPersonalizedCertificate(
        file,
        item.eventId,
        item.participantId
      );
      setCertificates((prev) => prev.map((certificate) => certificate.id === item.id
        ? { ...certificate, status: "Issued", certificateId: response.certificate._id }
        : certificate));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="organizer-certificates-page">
      <div className="organizer-certificates-container">

        {/* HEADER */}
        <section className="certificates-header">
          <div>
            <div className="certificates-kicker">
              <Award size={14} />
              ORGANIZER PANEL
            </div>

            <h1>
              Event
              <span> certificates.</span>
            </h1>

            <p>
              Manage participant certificates, issue achievements
              and provide recognition for successful participation.
            </p>
          </div>

          <div className="certificates-header-icon">
            <Award size={26} />
          </div>
        </section>

        {/* STATS */}
        <div className="certificates-stats">

          <div className="certificate-stat">
            <div className="certificate-stat-icon">
              <Users size={18} />
            </div>

            <div>
              <strong>{certificates.length}</strong>
              <span>Total certificates</span>
            </div>
          </div>

          <div className="certificate-stat">
            <div className="certificate-stat-icon issued">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <strong>{issuedCount}</strong>
              <span>Issued</span>
            </div>
          </div>

          <div className="certificate-stat">
            <div className="certificate-stat-icon pending">
              <Award size={18} />
            </div>

            <div>
              <strong>{pendingCount}</strong>
              <span>Pending</span>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}
        <div className="certificates-toolbar">
          {error && <p className="organizer-error-message">{error}</p>}

          <div className="certificates-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search participant or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All certificates</option>
            <option value="Issued">Issued</option>
            <option value="Pending">Pending</option>
          </select>

        </div>

        {/* CERTIFICATES LIST */}
        <div className="certificates-list">

          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((item) => (
              <article
                className="certificate-card"
                key={item.id}
              >

                <div className="certificate-card-icon">
                  <Award size={22} />
                </div>

                <div className="certificate-main">

                  <div className="certificate-person">
                    <div className="certificate-avatar">
                      {item.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.email}</span>
                    </div>
                  </div>

                  <div className="certificate-event">
                    <span>EVENT</span>
                    <strong>{item.event}</strong>
                  </div>

                  <div className="certificate-type">
                    <span>TYPE</span>
                    <strong>{item.type}</strong>
                    <small>Fee: {item.feeAmount || 0} | {item.paymentStatus.replace("_", " ")}</small>
                  </div>

                  <div>
                    <span
                      className={`certificate-status ${item.status.toLowerCase()}`}
                    >
                      {item.status === "Issued" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Award size={12} />
                      )}

                      {item.status}
                    </span>
                  </div>

                  <div className="certificate-actions">

                    {item.status === "Pending" ? (
                      <>
                        {item.paymentStatus === "not_requested" && <button type="button" className="certificate-issue" onClick={() => requestFee(item)}><Send size={14} /> Request fee</button>}
                        {item.paymentStatus === "proof_submitted" && <>
                          <a className="certificate-view" href={`http://localhost:3000${item.paymentProofUrl}`} target="_blank" rel="noreferrer">View proof</a>
                          <button type="button" className="certificate-issue" onClick={() => reviewPayment(item, true)}>Approve payment</button>
                          <button type="button" className="certificate-view" onClick={() => reviewPayment(item, false)}>Reject</button>
                        </>}
                        {item.paymentStatus === "approved" && <button type="button" className="certificate-issue" onClick={() => issueCertificate(item)}><Send size={14} /> Issue certificate</button>}
                        {item.paymentStatus === "requested" && <span>Awaiting payment proof</span>}
                        {item.paymentStatus === "rejected" && <button type="button" className="certificate-issue" onClick={() => requestFee(item)}><Send size={14} /> Request again</button>}
                        <label
                          className="certificate-upload"
                          title="Upload personalized PDF"
                        >
                          {uploadingId === item.id ? "Uploading..." : "Upload PDF"}
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            disabled={uploadingId === item.id || item.paymentStatus !== "approved"}
                            onChange={(event) => uploadPersonalized(item, event.target.files?.[0])}
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="certificate-view"
                          title="Preview certificate"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="certificate-download"
                          title="Download certificate"
                          onClick={() =>
                            downloadCertificate(item).catch((requestError) => setError(requestError.message))
                          }
                        >
                          <Download size={15} />
                        </button>
                      </>
                    )}

                  </div>

                </div>
              </article>
            ))
          ) : (
            <div className="certificates-empty">
              <Award size={27} />

              <strong>
                No certificates found
              </strong>

              <span>
                Only confirmed participants with attendance records appear here.
              </span>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="certificates-footer">
          <span>
            Showing {filteredCertificates.length} of{" "}
            {certificates.length} certificates
          </span>

          <span>
            EventSphere · Certificate Management
          </span>
        </div>

      </div>
    </div>
  );
}

export default Certificates;

