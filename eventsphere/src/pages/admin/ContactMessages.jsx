import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import contactService from "../../services/contactService";

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    contactService.getMessages()
      .then((response) => setMessages(response.messages || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="min-h-screen text-slate-900">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">Inbox</span>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Contact <span className="text-cyan-600">messages.</span></h1>
      <p className="mt-3 text-sm text-slate-500">Messages submitted through the public Contact Us form.</p>
      {error && <p className="mt-6 text-sm font-semibold text-rose-600">{error}</p>}
      <div className="mt-8 grid gap-4">
        {!error && !messages.length && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No messages yet.</p>}
        {messages.map((item) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={item._id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900">{item.subject}</h2>
                <p className="mt-1 flex items-center gap-2 text-xs text-cyan-700"><Mail size={13} />{item.name} · {item.email}</p>
              </div>
              <time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ContactMessages;