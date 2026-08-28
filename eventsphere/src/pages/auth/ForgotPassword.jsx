import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./ForgotPassword.css";
import authService from "../../services/authService";
import { emailPattern } from "../../utils/validation";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await authService.forgotPassword(normalizedEmail);
      setSent(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-glow forgot-glow-one" />
      <div className="forgot-glow forgot-glow-two" />

      <div className="forgot-container">
        <div className="forgot-brand">
          <div className="forgot-brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>EventSphere</strong>
            <span>Campus Event System</span>
          </div>
        </div>

        <div className="forgot-card">
          {sent ? (
            <div className="forgot-success">
              <div className="forgot-success-icon">
                <Mail size={27} />
              </div>

              <span>CHECK YOUR EMAIL</span>

              <h1>Reset link sent.</h1>

              <p>
                If an account exists with this email address, you'll receive
                instructions to reset your password.
              </p>

              <Link to="/login" className="forgot-back-button">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="forgot-back">
                <ArrowLeft size={15} />
                Back to login
              </Link>

              <div className="forgot-heading">
                <div className="forgot-icon">
                  <KeyRound size={22} />
                </div>

                <span>ACCOUNT RECOVERY</span>

                <h1>Forgot your password?</h1>

                <p>
                  Enter your email address and we'll help you get back into
                  your EventSphere account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="forgot-form">
                {error && <p className="forgot-error">{error}</p>}
                <label>
                  <span>Email address</span>

                  <div className="forgot-input">
                    <Mail size={17} />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </label>

                <button type="submit" className="forgot-submit">
                  Send reset link
                  <ArrowRight size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;