import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import authService from "../../services/authService";
import { useAuthContext } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, updateUser } = useAuthContext();
  const [form, setForm] = useState({ name: "", contactNumber: "", department: "", preferences: { eventUpdates: true, registrationReminders: true, announcements: true } });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authService.getMyProfile().then((response) => {
      setForm({
        name: response.user.name || "",
        contactNumber: response.user.contactNumber || "",
        department: response.user.department || "",
        preferences: response.user.preferences || { eventUpdates: true, registrationReminders: true, announcements: true },
      });
    }).catch((requestError) => setError(requestError.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await authService.updateMyProfile(form);
      updateUser(response.user);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="participant-profile-page">
      <div className="participant-profile-container">
        <div className="participant-profile-heading">
          <div className="participant-profile-icon"><UserRound size={22} /></div>
          <div><span>PARTICIPANT ACCOUNT</span><h1>Manage your profile.</h1><p>Keep your student details current for event eligibility and registration.</p></div>
        </div>
        <form className="participant-profile-form" onSubmit={handleSubmit}>
          <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Email address<input value={user?.email || ""} readOnly /></label>
          <label>Username<input value={user?.username || ""} readOnly /></label>
          <label>Contact number<input value={form.contactNumber} onChange={(event) => setForm({ ...form, contactNumber: event.target.value })} required /></label>
          <label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required /></label>
          <label>Enrollment number<input value={user?.enrollmentNumber || ""} readOnly /></label>
          <fieldset className="participant-profile-preferences">
            <legend>Communication preferences</legend>
            {[["eventUpdates", "Event updates"], ["registrationReminders", "Registration reminders"], ["announcements", "Campus announcements"]].map(([key, label]) => (
              <label key={key}><input type="checkbox" checked={form.preferences[key]} onChange={(event) => setForm({ ...form, preferences: { ...form.preferences, [key]: event.target.checked } })} />{label}</label>
            ))}
          </fieldset>
          {error && <p className="participant-profile-error">{error}</p>}
          {message && <p className="participant-profile-success">{message}</p>}
          <button type="submit"><Save size={16} /> Save profile</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
