    import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function EventCard({
  event,
  featured = false,
  onBookmark,
  onRegister,
}) {
  const [bookmarked, setBookmarked] = useState(Boolean(event?.bookmarked));

  const {
    _id,
    id,
    title = "Campus Event",
    description = "Discover this exciting college event.",
    category = "General",
    date = "TBA",
    time = "TBA",
    venue = "Campus",
    image,
    organizer = "EventSphere",
    totalSeats = 100,
    seatsAvailable = 72,
    status = "upcoming",
  } = event || {};

  const eventId = _id || id || "event";

  const availability =
    totalSeats > 0
      ? Math.max(0, Math.round((seatsAvailable / totalSeats) * 100))
      : 0;

  const isAlmostFull = seatsAvailable <= 15;
  const isFull = seatsAvailable <= 0;

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setBookmarked((prev) => !prev);

    if (onBookmark) {
      onBookmark(event, !bookmarked);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onRegister) {
      onRegister(event);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -7 }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-colors hover:border-cyan-200 ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden ${
          featured ? "h-72 sm:h-80" : "h-56"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-violet-600/20">
            <CalendarDays size={48} className="text-cyan-300/50" />
          </div>
        )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-black/20" />

        {/* Category */}
        <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 shadow-sm backdrop-blur-md">
          {category}
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm backdrop-blur-md transition ${
            bookmarked
              ? "border-cyan-300 bg-cyan-50 text-cyan-600"
              : "border-white/60 bg-white/85 text-slate-700 hover:bg-white"
          }`}
          aria-label="Bookmark event"
        >
          <Bookmark size={17} fill={bookmarked ? "currentColor" : "none"} />
        </button>

        {/* Status */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              status === "ongoing"
                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                : isFull
                ? "bg-red-400"
                : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            }`}
          />

          <span className="text-xs font-bold capitalize text-white">
            {status === "ongoing"
              ? "Live Now"
              : isFull
              ? "Fully Booked"
              : status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-400">
          <span>{organizer}</span>
        </div>

        <Link to={`/events/${eventId}`}>
          <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-900 transition group-hover:text-cyan-700">
            {title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {description}
        </p>

        {/* Details */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition group-hover:border-cyan-100">
            <CalendarDays size={15} className="mb-2 text-cyan-600" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Date
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {date}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition group-hover:border-cyan-100">
            <Clock3 size={15} className="mb-2 text-violet-500" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Time
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {time}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition group-hover:border-cyan-100">
            <MapPin size={15} className="mb-2 text-blue-500" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Venue
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {venue}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition group-hover:border-cyan-100">
            <Users size={15} className="mb-2 text-emerald-500" />
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Seats
            </p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
              {isFull ? "Full" : `${seatsAvailable} available`}
            </p>
          </div>
        </div>

        {/* Capacity */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-400">Availability</span>
            <span
              className={
                isAlmostFull ? "text-orange-400" : "text-cyan-400"
              }
            >
              {availability}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${availability}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${
                isAlmostFull
                  ? "bg-gradient-to-r from-orange-400 to-red-400"
                  : "bg-gradient-to-r from-cyan-400 to-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-2">
          <Link
            to={`/events/${eventId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          >
            Details
            <ArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            disabled={isFull}
            onClick={handleRegister}
            className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-xs font-black transition ${
              isFull
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-slate-950 text-white shadow-lg shadow-slate-900/10 hover:bg-cyan-700"
            }`}
          >
            {isFull ? "Full" : "Register"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default EventCard;