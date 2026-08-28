import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import authService from "../../services/authService";
import { emailPattern } from "../../utils/validation";
import "./Login.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!emailPattern.test(form.email.trim()) || !form.password.trim()) {
      setError("Enter a valid administrator email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await authService.adminLogin({ ...form, email: form.email.trim(), twoFactorCode });
      if (response.requiresTwoFactor) {
        setTwoFactorStep(true);
        setRequiresSetup(Boolean(response.requiresSetup));
        setTwoFactorSecret(response.twoFactorSecret || "");
      } else {
        login(response);
        navigate("/admin/dashboard");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon"><ShieldCheck size={20} /></div>
          <div><strong>EventSphere</strong><span>Administrator Console</span></div>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <span>SECURE ADMIN ACCESS</span>
            <h1>Sign in to administration.</h1>
            <p>{twoFactorStep ? "Confirm your identity with an authenticator app." : "Use an administrator account with elevated permissions."}</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <p className="auth-error">{error}</p>}
            <label><span>Administrator email</span><div className="auth-input"><Mail size={17} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div></label>
            <label><span>Password</span><div className="auth-input"><Lock size={17} /><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></div></label>
            {twoFactorStep && <>
              {requiresSetup && <p className="auth-helper">Add this secret to Google Authenticator, Microsoft Authenticator, or Authy: <strong>{twoFactorSecret}</strong></p>}
              <label><span>Authenticator code</span><div className="auth-input"><ShieldCheck size={17} /><input inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, ""))} placeholder="6-digit code" required /></div></label>
            </>}
            <button type="submit" className="auth-submit" disabled={submitting}>{submitting ? "Verifying..." : twoFactorStep ? "Verify code" : "Continue"}<ArrowRight size={17} /></button>
          </form>
          <div className="auth-footer"><Link to="/login">Back to standard login</Link></div>
          <div className="auth-footer"><Link to="/">Return to home</Link></div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
