import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Phone,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import authService from "../../services/authService";
import { emailPattern } from "../../utils/validation";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    contactNumber: "",
    department: "",
    enrollmentNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

    const nextFieldErrors = {};
    const name = form.name.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const contactNumber = form.contactNumber.trim();
    if (!name) nextFieldErrors.name = "Full name is required.";
    else if (name.length < 2 || name.length > 100) nextFieldErrors.name = "Name must be 2-100 characters.";
    if (!username) nextFieldErrors.username = "Username is required.";
    else if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) nextFieldErrors.username = "Use 3-20 letters, numbers, or underscores.";
    if (!email) nextFieldErrors.email = "Email address is required.";
    else if (!emailPattern.test(email)) nextFieldErrors.email = "Please enter a valid email address.";
    if (!contactNumber) nextFieldErrors.contactNumber = "Contact number is required.";
    else if (!/^\+?[0-9\s-]{7,15}$/.test(contactNumber)) nextFieldErrors.contactNumber = "Please enter a valid contact number.";
    if (form.department.trim().length < 2) nextFieldErrors.department = "Department is required.";
    if (form.enrollmentNumber.trim().length < 2) nextFieldErrors.enrollmentNumber = "Enrollment number is required.";
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) nextFieldErrors.password = "Use at least 8 characters, including a letter and a number.";
    if (!form.confirmPassword) nextFieldErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) nextFieldErrors.confirmPassword = "Passwords do not match.";
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) return;

    setError("");
    setSubmitting(true);

    try {
      await authService.register({
        name,
        username,
        email,
        contactNumber,
        department: form.department.trim(),
        enrollmentNumber: form.enrollmentNumber.trim(),
        password: form.password,
      });
      navigate("/login");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-glow register-glow-one" />
      <div className="register-glow register-glow-two" />

      <div className="register-container">
        <Link to="/" className="register-back-link">
          <ArrowLeft size={15} />
          Back to home
        </Link>

        <div className="register-brand">
          <div className="register-brand-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>EventSphere</strong>
            <span>Campus Event System</span>
          </div>
        </div>

        <div className="register-layout">
          <div className="register-card">
          <div className="register-heading">
            <span>GET STARTED</span>
            <h1>Create your account.</h1>
            <p>
              Join EventSphere and stay connected with campus life.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            {error && <p className="register-error">{error}</p>}
            <label>
              <span>Full name</span>

              <div className="register-input">
                <User size={17} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  minLength="2"
                  maxLength="100"
                  required
                />
              </div>
              {fieldErrors.name && <small className="register-field-error">{fieldErrors.name}</small>}
            </label>

            <label>
              <span>Username</span>

              <div className="register-input">
                <User size={17} />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  pattern="[A-Za-z0-9_]{3,20}"
                  title="Use 3-20 letters, numbers, or underscores."
                  required
                />
              </div>
              {fieldErrors.username && <small className="register-field-error">{fieldErrors.username}</small>}
            </label>

            <label>
              <span>Email address</span>

              <div className="register-input">
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
              {fieldErrors.email && <small className="register-field-error">{fieldErrors.email}</small>}
            </label>

            <label>
              <span>Contact number</span>

              <div className="register-input">
                <Phone size={17} />
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  pattern="\\+?[0-9\\s-]{7,15}"
                  title="Enter a valid contact number."
                  required
                />
              </div>
              {fieldErrors.contactNumber && <small className="register-field-error">{fieldErrors.contactNumber}</small>}
            </label>

            <label>
              <span>Department</span>
              <div className="register-input">
                <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Your department" minLength="2" maxLength="100" required />
              </div>
              {fieldErrors.department && <small className="register-field-error">{fieldErrors.department}</small>}
            </label>

            <label>
              <span>Enrollment number</span>
              <div className="register-input">
                <input type="text" name="enrollmentNumber" value={form.enrollmentNumber} onChange={handleChange} placeholder="Your enrollment number" minLength="2" maxLength="50" required />
              </div>
              {fieldErrors.enrollmentNumber && <small className="register-field-error">{fieldErrors.enrollmentNumber}</small>}
            </label>

            <label>
              <span>Password</span>

              <div className="register-input">
                <Lock size={17} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  minLength="8"
                  maxLength="128"
                  pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
                  title="Use at least 8 characters, including a letter and a number."
                  required
                />
              </div>
              {fieldErrors.password && <small className="register-field-error">{fieldErrors.password}</small>}
            </label>

            <label>
              <span>Confirm password</span>

              <div className="register-input">
                <Lock size={17} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  minLength="8"
                  maxLength="128"
                  required
                />
              </div>
              {fieldErrors.confirmPassword && <small className="register-field-error">{fieldErrors.confirmPassword}</small>}
            </label>

            <button type="submit" className="register-submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="register-footer">
            <span>Already have an account?</span>
            <Link to="/login">Sign in</Link>
          </div>
          </div>

          <motion.aside
            className="register-showcase"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <span className="showcase-orb showcase-orb-one" />
            <span className="showcase-orb showcase-orb-two" />
            <div className="showcase-mark"><Sparkles size={18} /></div>
            <p>JOIN THE SPHERE</p>
            <h2>Your next favorite campus memory starts here.</h2>
            <div className="showcase-lines" aria-hidden="true"><i /><i /><i /></div>
            <small>Meet people. Try something new.</small>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

export default Register;