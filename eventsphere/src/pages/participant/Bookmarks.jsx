import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import eventService from "../../services/eventService";
import mediaService from "../../services/mediaService";
import "./Bookmarks.css";

const initialBookmarks = [
  {
    id: 1,
    title: "Innovation & Technology Summit",
    category: "Technical",
    date: "Sep 05, 2026",
    time: "10:00 AM",
    location: "Main Auditorium",
    description:
      "Explore emerging technologies, student projects and innovative ideas.",
  },
  {
    id: 2,
    title: "Campus Cultural Night",
    category: "Cultural",
    date: "Sep 12, 2026",
    time: "06:30 PM",
    location: "College Ground",
    description:
      "An evening filled with performances, music, creativity and campus activities.",
  },
  {
    id: 3,
    title: "Inter-College Sports Festival",
    category: "Sports",
    date: "Sep 18, 2026",
    time: "09:00 AM",
    location: "Sports Complex",
    description:
      "Join students from different colleges for an exciting sports festival.",
  },
  {
    id: 4,
    title: "Career Development Workshop",
    category: "Workshop",
    date: "Sep 24, 2026",
    time: "02:00 PM",
    location: "Seminar Hall",
    description:
      "Learn practical skills for building your career and preparing for opportunities.",
  },
];

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [savedMedia, setSavedMedia] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    eventService.getMyBookmarks().then((response) => {
      setBookmarks((response.events || []).map((item) => ({
        id: item._id,
        title: item.title || "Saved event",
        category: item.category || "",
        date: item.date ? new Date(item.date).toLocaleDateString() : "-",
        time: item.time || "",
        location: item.venue || "",
        description: item.description || "Saved event",
      })));
    });
    mediaService.getSavedMedia().then((response) => setSavedMedia(response.media || []));
  }, []);

  const removeBookmark = (id) => {
    eventService.toggleBookmark(id).then(() => {
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));
    });
  };

  const removeMedia = (id) => {
    mediaService.removeSavedMedia(id).then(() => setSavedMedia((current) => current.filter((item) => item._id !== id)));
  };

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const query = search.toLowerCase();

    return (
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.category.toLowerCase().includes(query) ||
      bookmark.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">

        {/* HEADER */}
        <section className="bookmarks-header">
          <div>
            <div className="bookmarks-kicker">
              <Sparkles size={13} />
              SAVED EVENTS
            </div>

            <h1>
              Your event
              <span> bookmarks.</span>
            </h1>

            <p>
              Keep your favorite campus events saved in one place so you can
              quickly find and register for them later.
            </p>
          </div>

          <div className="bookmarks-count">
            <Bookmark size={20} />
            <strong>{bookmarks.length}</strong>
            <span>Saved events</span>
          </div>
        </section>

        {/* TOOLBAR */}
        <div className="bookmarks-toolbar">
          <div className="bookmarks-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search saved events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link to="/events" className="bookmarks-explore-btn">
            Explore events
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* EVENTS */}
        {filteredBookmarks.length > 0 ? (
          <div className="bookmarks-list">
            {filteredBookmarks.map((bookmark, index) => (
              <article className="bookmark-card" key={bookmark.id}>

                <div className="bookmark-number">
                  0{index + 1}
                </div>

                <div className="bookmark-icon">
                  <Bookmark size={20} />
                </div>

                <div className="bookmark-content">
                  <div className="bookmark-meta">
                    <span>{bookmark.category}</span>
                    <time>{bookmark.date}</time>
                  </div>

                  <h2>{bookmark.title}</h2>

                  <p>{bookmark.description}</p>

                  <div className="bookmark-details">
                    <div>
                      <CalendarDays size={14} />
                      {bookmark.date}
                    </div>

                    <div>
                      <Clock3 size={14} />
                      {bookmark.time}
                    </div>

                    <div>
                      <MapPin size={14} />
                      {bookmark.location}
                    </div>
                  </div>

                  <div className="bookmark-actions">
                    <Link
                      to={`/participant/events/${bookmark.id}/register`}
                      className="bookmark-view-btn"
                    >
                      View event
                      <ArrowRight size={15} />
                    </Link>

                    <button
                      type="button"
                      className="bookmark-remove-btn"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bookmarks-empty">
            <div className="bookmarks-empty-icon">
              <Bookmark size={28} />
            </div>

            <h2>No saved events found.</h2>

            <p>
              {bookmarks.length === 0
                ? "You haven't bookmarked any events yet."
                : "Try searching with a different keyword."}
            </p>

            <Link to="/events">
              Browse events
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {savedMedia.length > 0 && <section className="bookmarks-list">
          <div className="bookmarks-header"><div><div className="bookmarks-kicker"><Sparkles size={13} /> SAVED MEDIA</div><h2>Favorite images and videos</h2></div></div>
          {savedMedia.map((item) => <article className="bookmark-card" key={item._id}>
            <div className="bookmark-icon"><Bookmark size={20} /></div>
            <div className="bookmark-content"><h2>{item.title}</h2><p>{item.description || "Saved event media"}</p><div className="bookmark-actions"><a href={item.fileUrl} target="_blank" rel="noreferrer" className="bookmark-view-btn">Open media <ArrowRight size={15} /></a><button type="button" className="bookmark-remove-btn" onClick={() => removeMedia(item._id)}><Trash2 size={15} /> Remove</button></div></div>
          </article>)}
        </section>}

      </div>
    </div>
  );
}

export default Bookmarks;