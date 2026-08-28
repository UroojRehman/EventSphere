import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import "./CheckIn.css";

function CheckIn() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <main className="check-in-page">
      <section className="check-in-panel">
        <div className="check-in-icon"><ClipboardCheck size={28} /></div>
        <span className="check-in-kicker">EVENTSPHERE CHECK-IN</span>
        <h1>Attendance QR code</h1>
        {token ? (
          <>
            <CheckCircle2 className="check-in-success" size={24} />
            <p>QR code recognized. Show this screen to the event organizer so they can complete your check-in.</p>
            <code>{token}</code>
          </>
        ) : (
          <p>This QR code is missing a check-in token. Please ask the participant to open a fresh QR code.</p>
        )}
      </section>
    </main>
  );
}

export default CheckIn;
