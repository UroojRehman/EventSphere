
import {
  Camera,
  Eye,
  ImagePlus,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import mediaService from "../../services/mediaService";
import eventService from "../../services/eventService";
import "./Gallery.css";

const initialGallery = [
  {
    id: 1,
    title: "Innovation Summit 2026",
    category: "Technical",
    date: "Aug 25, 2026",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=85",
    photos: 24,
  },
  {
    id: 2,
    title: "Cultural Night",
    category: "Cultural",
    date: "Aug 22, 2026",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=85",
    photos: 38,
  },
  {
    id: 3,
    title: "Sports Festival",
    category: "Sports",
    date: "Aug 18, 2026",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=85",
    photos: 31,
  },
  {
    id: 4,
    title: "Student Workshop",
    category: "Workshop",
    date: "Aug 14, 2026",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85",
    photos: 18,
  },
  {
    id: 5,
    title: "Campus Community",
    category: "Community",
    date: "Aug 10, 2026",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=85",
    photos: 27,
  },
  {
    id: 6,
    title: "Creative Showcase",
    category: "Creative",
    date: "Aug 06, 2026",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85",
    photos: 22,
  },
];

function Gallery() {
  const [gallery, setGallery] = useState(initialGallery);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    mediaService.getMyMedia().then((response) => {
      setGallery((response.media || []).map((item) => ({
        id: item._id,
        title: item.title || item.event?.title || "Event media",
        category: item.category,
        date: new Date(item.createdAt).toLocaleDateString(),
        image: item.fileUrl,
        photos: 1,
        status: item.status,
      })));
    });
    eventService.getMyEvents().then((response) => setEvents(response.events || []));
  }, []);

  const [newAlbum, setNewAlbum] = useState({
    title: "",
    eventId: "",
    image: null,
  });

  const categories = [
    "All",
    "Technical",
    "Cultural",
    "Sports",
    "Workshop",
    "Community",
    "Creative",
  ];

  const filteredGallery = gallery.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this album?"
    );

    if (!confirmed) return;

    mediaService.deleteMedia(id).then(() => {
      setGallery((prev) => prev.map((item) => item.id === id
        ? { ...item, status: "deletion_requested" }
        : item));
    });

    setSelectedItem(null);
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();

    if (!newAlbum.title.trim() || !newAlbum.eventId || !newAlbum.image) return;

    await mediaService.uploadMedia(
      newAlbum.image,
      newAlbum.eventId,
      newAlbum.title
    );
    await mediaService.getMyMedia().then((response) => setGallery((response.media || []).map((item) => ({
      id: item._id,
      title: item.title || item.event?.title || "Event media",
      category: item.category,
      date: new Date(item.createdAt).toLocaleDateString(),
      image: item.fileUrl,
      photos: 1,
      status: item.status,
    }))));

    setNewAlbum({
      title: "",
      eventId: "",
      image: null,
    });

    setShowAdd(false);
  };

  return (
    <div className="organizer-gallery-page">
      <div className="organizer-gallery-container">

        {/* HEADER */}
        <section className="organizer-gallery-header">

          <div>
            <div className="organizer-gallery-kicker">
              <Camera size={14} />
              ORGANIZER PANEL
            </div>

            <h1>
              Event
              <span> gallery.</span>
            </h1>

            <p>
              Manage event albums, upload memories and keep your
              campus experiences organized in one place.
            </p>
          </div>

          <button
            type="button"
            className="gallery-add-button"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={17} />
            Create album
          </button>

        </section>

        {/* STATS */}
        <div className="organizer-gallery-stats">

          <div className="gallery-stat">
            <strong>{gallery.length}</strong>
            <span>Total albums</span>
          </div>

          <div className="gallery-stat">
            <strong>
              {gallery.reduce(
                (total, item) => total + item.photos,
                0
              )}
            </strong>
            <span>Total photos</span>
          </div>

          <div className="gallery-stat">
            <strong>{categories.length - 1}</strong>
            <span>Categories</span>
          </div>

        </div>

        {/* TOOLBAR */}
        <div className="organizer-gallery-toolbar">

          <div className="gallery-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search albums..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="gallery-filters">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                {category}
              </button>
            ))}
          </div>

        </div>

        {/* GALLERY GRID */}
        <div className="organizer-gallery-grid">

          {filteredGallery.length > 0 ? (
            filteredGallery.map((item) => (
              <article
                className="organizer-gallery-card"
                key={item.id}
              >

                <div className="gallery-image-wrapper">

                  <img
                    src={item.image}
                    alt={item.title}
                  />

                  <div className="gallery-image-overlay" />

                  <span className="gallery-photo-count">
                    <Camera size={12} />
                    {item.photos}
                  </span>

                  <button
                    type="button"
                    className="gallery-menu-button"
                    onClick={() =>
                      setSelectedItem(item)
                    }
                  >
                    <MoreVertical size={17} />
                  </button>

                </div>

                <div className="organizer-gallery-card-content">

                  <div className="gallery-card-meta">
                    <span>{item.category}</span>
                    <time>{item.date}</time>
                    {item.status === "deletion_requested" && <b>Deletion pending</b>}
                  </div>

                  <h2>{item.title}</h2>

                  <div className="gallery-card-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedItem(item)
                      }
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button type="button">
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      disabled={item.status === "deletion_requested"}
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

              </article>
            ))
          ) : (
            <div className="gallery-empty">
              <ImagePlus size={30} />

              <strong>No albums found</strong>

              <span>
                Try another search or category.
              </span>
            </div>
          )}

        </div>

      </div>

      {/* VIEW MODAL */}
      {selectedItem && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="gallery-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="gallery-modal-close"
              onClick={() => setSelectedItem(null)}
            >
              <X size={18} />
            </button>

            <img
              src={selectedItem.image}
              alt={selectedItem.title}
            />

            <div className="gallery-modal-content">

              <span>{selectedItem.category}</span>

              <h2>{selectedItem.title}</h2>

              <p>
                {selectedItem.photos} photos ·{" "}
                {selectedItem.date}
              </p>

              <div className="gallery-modal-actions">

                <button type="button">
                  <Pencil size={14} />
                  Edit album
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    handleDelete(selectedItem.id)
                  }
                >
                  <Trash2 size={14} />
                  Delete
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ADD ALBUM MODAL */}
      {showAdd && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="gallery-add-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="gallery-add-header">
              <div>
                <span>Create new album</span>
                <h2>Add event photos</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAdd(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAlbum}>

              <label>
                Album title
                <input
                  type="text"
                  placeholder="e.g. Annual Sports Day"
                  value={newAlbum.title}
                  onChange={(e) =>
                    setNewAlbum({
                      ...newAlbum,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Event
                <select
                  value={newAlbum.eventId}
                  onChange={(e) =>
                    setNewAlbum({
                      ...newAlbum,
                      eventId: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>Select event</option>
                  {events.map((event) => (
                      <option
                        value={event._id}
                        key={event._id}
                      >
                        {event.title}
                      </option>
                  ))}
                </select>
              </label>

              <label>
                Media file
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={(e) =>
                    setNewAlbum({
                      ...newAlbum,
                      image: e.target.files?.[0] || null,
                    })
                  }
                />
                {newAlbum.image && <small>{newAlbum.image.name}</small>}
              </label>

              <button
                type="submit"
                className="gallery-create-submit"
              >
                <Plus size={15} />
                Create album
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Gallery;

