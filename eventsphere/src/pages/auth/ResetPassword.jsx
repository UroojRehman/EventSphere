import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import "./ResetPassword.css";
import authService from "../../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("Password must be at least 8 characters and include a letter and a number.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-glow reset-glow-one" />
      <div className="reset-glow reset-glow-two" />

      <div className="reset-container">
        <div className="reset-brand">
          <div className="reset-brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>EventSphere</strong>
            <span>Campus Event System</span>
          </div>
        </div>

        <div className="reset-card">
          {success ? (
            <div className="reset-success">
              <div className="reset-success-icon">
                <CheckCircle2 size={30} />
              </div>

              <span>PASSWORD UPDATED</span>

              <h1>You're all set.</h1>

              <p>
                Your password has been updated successfully. Redirecting you
                to the login page.
              </p>
            </div>
          ) : (
            <>
              <div className="reset-heading">
                <div className="reset-icon">
                  <Lock size={22} />
                </div>

                <span>NEW PASSWORD</span>

                <h1>Create a new password.</h1>

                <p>
                  Choose a new password to secure your EventSphere account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="reset-form">
                {error && <p className="reset-error">{error}</p>}
                <label>
                  <span>New password</span>

                  <div className="reset-input">
                    <Lock size={17} />

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Confirm password</span>

                  <div className="reset-input">
                    <Lock size={17} />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </label>

                <button type="submit" className="reset-submit">
                  Update password
                  <ArrowRight size={17} />
                </button>
              </form>

              <Link to="/login" className="reset-login">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;