import { ArrowLeft, ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext";
import authService from "../../services/authService";
import { emailPattern } from "../../utils/validation";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim();
    const nextFieldErrors = {};
    if (!email) nextFieldErrors.email = "Email address is required.";
    else if (!emailPattern.test(email)) nextFieldErrors.email = "Please enter a valid email address.";
    if (!form.password.trim()) nextFieldErrors.password = "Password is required.";
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) return;

    setSubmitting(true);

    try {
      const response = await authService.login({ ...form, email });
      login(response);
      navigate(`/${response.user.role}/dashboard`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-container">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={15} />
          Back to home
        </Link>

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>EventSphere</strong>
            <span>Campus Event System</span>
          </div>
        </div>

        <div className="auth-layout">
          <div className="auth-card">
          <div className="auth-heading">
            <span>WELCOME BACK</span>
            <h1>Sign in to your account.</h1>
            <p>
              Access your events, registrations and campus activities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {error && <p className="auth-error">{error}</p>}
            <label>
              <span>Email address</span>

              <div className="auth-input">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  maxLength="254"
                  required
                />
              </div>
              {fieldErrors.email && <small className="auth-field-error">{fieldErrors.email}</small>}
            </label>

            <label>
              <div className="auth-label-row">
                <span>Password</span>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input">
                <Lock size={17} />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  minLength="1"
                  maxLength="128"
                  required
                />
              </div>
              {fieldErrors.password && <small className="auth-field-error">{fieldErrors.password}</small>}
            </label>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/register">Create account</Link>
          </div>
          <div className="auth-footer">
            <Link to="/">Return to home</Link>
          </div>
          </div>

          <motion.aside
            className="auth-showcase"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <span className="showcase-orb showcase-orb-one" />
            <span className="showcase-orb showcase-orb-two" />
            <div className="showcase-mark"><Sparkles size={18} /></div>
            <p>YOUR CAMPUS, IN MOTION</p>
            <h2>Find the moments that make campus memorable.</h2>
            <div className="showcase-lines" aria-hidden="true"><i /><i /><i /></div>
            <small>Discover. Participate. Belong.</small>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

export default Login;