import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Camera,
  Images,
  X,
  Maximize2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import "./Gallery.css";
import mediaService from "../../services/mediaService";
import { useAuthContext } from "../../context/AuthContext";

const fallbackGalleryItems = [
  {
    title: "Innovation Summit",
    category: "Technical Fests",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=90",
  },
  {
    title: "Cultural Night",
    category: "Cultural Events",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=90",
  },
  {
    title: "Sports Festival",
    category: "Sports Meets",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=90",
  },
  {
    title: "Student Workshop",
    category: "Workshops and Seminars",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=90",
  },
  {
    title: "Campus Community",
    category: "Annual Day Functions",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=90",
  },
  {
    title: "Creative Showcase",
    category: "Intercollegiate Competitions",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=90",
  },
];

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState(fallbackGalleryItems);
  const [searchParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [eventFilter, setEventFilter] = useState(searchParams.get("event") || "All events");
  const [eventTypeFilter, setEventTypeFilter] = useState("All event types");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [yearFilter, setYearFilter] = useState("All years");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("All media");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const { user } = useAuthContext();
  const [savedMediaIds, setSavedMediaIds] = useState(new Set());

  useEffect(() => {
    const loadGallery = async () => {
      const response = await mediaService.getGallery();
        const items = (response.media || [])
          .filter((item) => item.fileUrl)
          .map((item) => ({
            ...item,
            title: item.event?.title || item.title || "Campus moment",
            category: item.event?.category || item.category || "Campus",
            eventType: item.event?.eventType || item.eventType || "Other",
            department: item.event?.department || item.department || "General",
            year: item.event?.date
              ? new Date(item.event.date).getFullYear().toString()
              : "Unknown",
            image: item.fileUrl,
          }));

        if (items.length) setGalleryItems(items);
      if (user?.role === "participant" && localStorage.getItem("token")) {
        const savedResponse = await mediaService.getSavedMedia();
        setSavedMediaIds(new Set((savedResponse.media || []).map((item) => item._id)));
      }
    };
    loadGallery().catch(() => {});
  }, [user?.role]);

  const toggleSavedMedia = async (event, item) => {
    event.stopPropagation();
    if (!user || user.role !== "participant") return;
    const isSaved = savedMediaIds.has(item._id);
    if (isSaved) {
      await mediaService.removeSavedMedia(item._id);
      setSavedMediaIds((current) => {
        const next = new Set(current);
        next.delete(item._id);
        return next;
      });
    } else {
      await mediaService.saveMedia(item._id);
      setSavedMediaIds((current) => new Set(current).add(item._id));
    }
  };

  const eventOptions = [...new Set(galleryItems.map((item) => item.title))];
  const categoryOptions = [...new Set(galleryItems.map((item) => item.category).filter(Boolean))].sort();
  const departmentOptions = [...new Set(galleryItems.map((item) => item.department).filter(Boolean))];
  const yearOptions = [...new Set(galleryItems.map((item) => item.year).filter(Boolean))];
  const eventTypeOptions = [...new Set(galleryItems.map((item) => item.eventType).filter(Boolean))];
  const mediaTypeOptions = [...new Set(galleryItems.map((item) => item.mediaType).filter(Boolean))].sort();
  const filteredItems = galleryItems.filter((item) => (
    (eventFilter === "All events" || item.title === eventFilter) &&
    (categoryFilter === "All categories" || item.category === categoryFilter) &&
    (departmentFilter === "All departments" || item.department === departmentFilter) &&
    (yearFilter === "All years" || item.year === yearFilter) &&
    (eventTypeFilter === "All event types" || item.eventType === eventTypeFilter) &&
    (mediaTypeFilter === "All media" || item.mediaType === mediaTypeFilter)
  ));

  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const closeViewer = () => {
    setSelectedIndex(null);
  };

  const showPrevious = (e) => {
    e?.stopPropagation();

    setSelectedIndex((current) => {
      if (current === null) return null;

      return current === 0 ? filteredItems.length - 1 : current - 1;
    });
  };

  const showNext = (e) => {
    e?.stopPropagation();

    setSelectedIndex((current) => {
      if (current === null) return null;

      return current === filteredItems.length - 1 ? 0 : current + 1;
    });
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <>
      <div className="gallery-page">
        <div className="gallery-container">
          {/* HEADER */}
          <section className="gallery-header">
            <div>
              <div className="gallery-kicker">
                <Camera size={14} />
                CAMPUS MOMENTS
              </div>

              <h1>
                Memories worth
                <span> sharing.</span>
              </h1>

              <p>
                Explore moments from events, activities and experiences
                happening across the EventSphere community.
              </p>
            </div>

            <div className="gallery-count">
              <Images size={19} />

              <strong>{filteredItems.length.toString().padStart(2, "0")}</strong>

              <span>Gallery items</span>
            </div>
          </section>

          <div className="gallery-category-strip" aria-label="Gallery categories">
            {["All categories", ...categoryOptions].map((category) => (
              <button key={category} type="button" className={categoryFilter === category ? "active" : ""} onClick={() => setCategoryFilter(category)}>
                {category}
              </button>
            ))}
          </div>

          <div className="gallery-filters">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option>All categories</option>
              {categoryOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
              <option>All events</option>
              {eventOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              <option>All departments</option>
              {departmentOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option>All years</option>
              {yearOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
            <select value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value)}>
              <option>All media</option>
              {mediaTypeOptions.map((type) => <option key={type} value={type}>{type === "image" ? "Images" : type === "video" ? "Videos" : type}</option>)}
            </select>
            <select value={eventTypeFilter} onChange={(event) => setEventTypeFilter(event.target.value)} aria-label="Event type">
              <option>All event types</option>
              {eventTypeOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          {/* GALLERY */}
          <div className="gallery-grid">
            {filteredItems.map((item, index) => (
              <motion.article
                className={`gallery-card gallery-card-${index + 1}`}
                key={item._id || `${item.title}-${item.image}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setSelectedIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedIndex(index);
                  }
                }}
                aria-label={`Open ${item.title}`}
              >
                {item.mediaType === "video" ? (
                  <video src={item.image} muted playsInline preload="metadata" />
                ) : (
                  <img src={item.image} alt={item.title} />
                )}

                <div className="gallery-overlay" />

                <div className="gallery-info">
                  <span>{item.eventType || item.category}</span>
                  <h2>{item.title}</h2>
                  <small>{item.department} · {item.year}</small>
                </div>

                <div className="gallery-arrow">
                  <Maximize2 size={16} />
                </div>
                {user?.role === "participant" && item._id && (
                  <button type="button" className="gallery-save-button" onClick={(event) => toggleSavedMedia(event, item)} aria-label={savedMediaIds.has(item._id) ? "Remove from saved media" : "Save media"}>
                    <Bookmark size={16} fill={savedMediaIds.has(item._id) ? "currentColor" : "none"} />
                  </button>
                )}
              </motion.article>
            ))}
          </div>

          {/* BOTTOM */}
          <div className="gallery-bottom">
            <p>More campus experiences are coming soon.</p>

            <Link to="/events">
              Discover upcoming events
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* IMAGE VIEWER */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="gallery-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewer}
          >
            {/* TOP BAR */}
            <div
              className="gallery-lightbox-top"
              onClick={(event) => event.stopPropagation()}
            >
              <div>
                <span>{selectedItem.category}</span>

                <h2>{selectedItem.title}</h2>
              </div>

              <button
                type="button"
                className="gallery-close"
                onClick={closeViewer}
                aria-label="Close image viewer"
              >
                <X size={22} />
              </button>
            </div>

            {/* PREVIOUS */}
            <button
              type="button"
              className="gallery-nav gallery-nav-left"
              onClick={showPrevious}
              aria-label="Previous image"
            >
              <ArrowLeft size={22} />
            </button>

            {/* IMAGE */}
            <motion.div
              className="gallery-lightbox-image-wrap"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(event) => event.stopPropagation()}
            >
              {selectedItem.mediaType === "video" ? (
                <video
                  key={selectedItem.image}
                  src={selectedItem.image}
                  controls
                  autoPlay
                  className="gallery-lightbox-image"
                />
              ) : (
                <img
                  key={selectedItem.image}
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="gallery-lightbox-image"
                />
              )}

              <div className="gallery-image-counter">
                {selectedIndex + 1} / {filteredItems.length}
              </div>
            </motion.div>

            {/* NEXT */}
            <button
              type="button"
              className="gallery-nav gallery-nav-right"
              onClick={showNext}
              aria-label="Next image"
            >
              <ArrowRight size={22} />
            </button>

            {/* BOTTOM HINT */}
            <div className="gallery-lightbox-hint">
              <span>ESC</span>
              Close
              <span>← →</span>
              Navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;