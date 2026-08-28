import { Mail, MapPin, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import contactService from "../../services/contactService";

const initialSettings = {
  contactEmail: "events@eventsphere.edu",
  emailTitle: "Email us",
  emailText: "For general questions and event support.",
  phone: "+92 300 0000000",
  phoneTitle: "Call support",
  phoneText: "Available during campus support hours.",
  address: "College Campus, Karachi",
  addressTitle: "Visit campus",
  country: "Pakistan",
  supportTitle: "Support hours",
  supportHours: "Monday - Friday · 9:00 AM - 5:00 PM",
};

function ContactSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contactService.getAdmin()
      .then((response) => setSettings((current) => ({ ...current, ...response })))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateField = (event) => {
    setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await contactService.update(settings);
      setSettings(response.settings);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-3xl">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">Site settings</span>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Contact <span className="text-cyan-600">details.</span></h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Update the contact information shown on the public Contact Us page and footer.</p>

        <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-600">{message}</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["emailTitle", "Email card title", "text", Mail],
              ["contactEmail", "Email address", "email", Mail],
              ["emailText", "Email description", "text", Mail],
              ["phoneTitle", "Phone card title", "text", Phone],
              ["phone", "Phone number", "text", Phone],
              ["phoneText", "Phone description", "text", Phone],
              ["addressTitle", "Address card title", "text", MapPin],
              ["address", "Campus address", "text", MapPin],
              ["country", "Country", "text", MapPin],
              ["supportTitle", "Support hours title", "text", Phone],
            ].map(([name, label, type, Icon]) => (
              <label className="block" key={name}>
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600"><Icon size={14} />{label}</span>
                <input required name={name} type={type} value={settings[name]} onChange={updateField} className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-cyan-500" />
              </label>
            ))}
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-600">Support hours</span>
            <input required name="supportHours" value={settings.supportHours} onChange={updateField} placeholder="Monday - Friday - 9:00 AM - 5:00 PM" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-cyan-500" />
          </label>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:opacity-60"><Save size={16} />{saving ? "Saving..." : "Save contact details"}</button>
        </form>
      </div>
    </div>
  );
}

export default ContactSettings;
