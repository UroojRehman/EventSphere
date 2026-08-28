import {
  Award,
  CalendarDays,
  Download,
  Eye,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import certificateService from "../../services/certificateService";
import registrationService from "../../services/registrationService";
import attendanceService from "../../services/attendanceService";
import "./Certificates.css";

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [feeEvents, setFeeEvents] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      certificateService.getMyCertificates(),
      registrationService.getMyRegistrations(),
      attendanceService.getMyAttendance(),
    ]).then(([certificateResponse, registrationResponse, attendanceResponse]) => {
      const issued = certificateResponse.certificates || [];
      setCertificates(issued);
      const issuedEventIds = new Set(issued.map((item) => item.event?._id));
      const attendedEventIds = new Set((attendanceResponse.attendances || []).filter((item) => item.attended).map((item) => item.event?._id));
      setFeeEvents((registrationResponse.registrations || []).filter((item) => item.status === "confirmed" && attendedEventIds.has(item.event?._id) && !issuedEventIds.has(item.event?._id)));
    });
  }, []);

  const uploadPaymentProof = async (registration, file) => {
    if (!file) return;
    setUploadingId(registration._id);
    setError("");
    try {
      const response = await registrationService.submitCertificatePaymentProof(registration._id, file);
      setFeeEvents((current) => current.map((item) => item._id === registration._id
        ? { ...item, certificatePaymentStatus: response.registration.certificatePaymentStatus }
        : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploadingId(null);
    }
  };

  const download = async (certificate) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/certificates/${certificate._id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `Certificate-${certificate.certificateNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const view = async (certificate) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/certificates/${certificate._id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const url = URL.createObjectURL(await response.blob());
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="participant-certificates-page">
      <div className="participant-certificates-container">

        {/* HEADER */}
        <section className="certificates-header">
          <div>
            <div className="certificates-kicker">
              <Award size={14} />
              ACHIEVEMENTS
            </div>

            <h1>
              My
              <span> certificates.</span>
            </h1>

            <p>
              View and manage certificates earned through your EventSphere
              participation and campus activities.
            </p>
          </div>

          <div className="certificates-count">
            <FileCheck2 size={20} />
            <div>
              <strong>{certificates.length}</strong>
              <span>Certificates earned</span>
            </div>
          </div>
        </section>

        {error && <p className="certificate-info">{error}</p>}
        {feeEvents.length > 0 && <section className="certificate-info">
          <div className="certificate-info-icon"><Award size={20} /></div>
          <div>
            <strong>Certificate fees</strong>
            <p>Pay the requested fee, then upload a screenshot. Your certificate appears after organizer approval.</p>
            {feeEvents.map((registration) => <div key={registration._id}>
              <span>{registration.event?.title || "Attended event"}: {registration.certificatePaymentStatus === "not_requested" ? "Waiting for organizer fee request" : registration.certificatePaymentStatus === "proof_submitted" ? "Payment proof under review" : registration.certificatePaymentStatus === "approved" ? "Payment approved" : `Fee requested: ${registration.certificateFeeAmount}`}</span>
              {registration.certificatePaymentStatus === "requested" || registration.certificatePaymentStatus === "rejected" ? <label>Upload payment screenshot<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingId === registration._id} onChange={(event) => uploadPaymentProof(registration, event.target.files?.[0])} /></label> : null}
            </div>)}
          </div>
        </section>}

        {/* CERTIFICATES */}
        <section className="certificates-grid">
          {certificates.map((certificate, index) => (
            <article
              className="certificate-card"
              key={certificate._id}
            >
              <div className="certificate-top">
                <div className="certificate-icon">
                  <Award size={23} />
                </div>

                <span className="certificate-status">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              </div>

              <div className="certificate-number">
                0{index + 1}
              </div>

              <h2>{certificate.event?.title || "Event certificate"}</h2>

              <p className="certificate-type">
                Participation Certificate
              </p>

              <div className="certificate-meta">

                <div>
                  <CalendarDays size={15} />
                  <span>{new Date(certificate.issuedOn).toLocaleDateString()}</span>
                </div>

                <div>
                  <FileCheck2 size={15} />
                  <span>{certificate.issuedBy?.name || "EventSphere organizer"}</span>
                </div>

              </div>

              <div className="certificate-actions">
                <button type="button" onClick={() => view(certificate)}>
                  <Eye size={15} />
                  View
                </button>

                <button type="button" className="certificate-download" onClick={() => download(certificate)}>
                  <Download size={15} />
                  Download
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* INFO */}
        <section className="certificate-info">
          <div className="certificate-info-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <strong>Your certificates are verified</strong>
            <p>
              Certificates issued through EventSphere are connected with your
              participation records and can be used as proof of attendance.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Certificates;