import { Camera, Check, Eye, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import mediaService from "../../services/mediaService";
import "./Gallery.css";

function Gallery() {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadMedia = async () => {
    try {
      const response = await mediaService.getAllMediaAdmin();
      setMedia(response.media || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => { loadMedia(); }, []);

  const filtered = media.filter((item) =>
    `${item.title || ""} ${item.event?.title || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMedia = async (id) => {
    if (!window.confirm("Delete this media item?")) return;
    try {
      await mediaService.deleteMediaAdmin(id);
      await loadMedia();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const moderateMedia = async (id, approved) => {
    try {
      if (approved) await mediaService.approveMedia(id);
      else await mediaService.rejectMedia(id, "Rejected by administrator");
      await loadMedia();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="admin-gallery-page">
      <div className="admin-gallery-container">
        <section className="admin-gallery-header">
          <div>
            <span>MEDIA MANAGEMENT</span>
            <h1>Event<strong> gallery.</strong></h1>
            <p>Manage photos and visual memories uploaded for campus events.</p>
          </div>
          <button className="admin-gallery-add"><Plus size={16} />Add media</button>
        </section>
        <div className="admin-gallery-toolbar">
          <div className="admin-gallery-search">
            <Search size={16} />
            <input placeholder="Search media..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>
        {error && <p className="admin-gallery-error">{error}</p>}
        <div className="admin-gallery-grid">
          {filtered.map((item) => (
            <article className="admin-gallery-card" key={item._id}>
              <div className="admin-gallery-image">
                <img src={item.fileUrl} alt={item.title || item.event?.title || "Event media"} />
                <span><Camera size={12} />1</span>
              </div>
              <div className="admin-gallery-content">
                <span>{item.category}</span>
                <h2>{item.title || item.event?.title || "Untitled media"}</h2>
                <small>{item.status || "unknown"}</small>
                <div className="admin-gallery-actions">
                  <button><Eye size={14} />View</button>
                  {item.status === "pending" && <><button onClick={() => moderateMedia(item._id, true)}><Check size={14} /></button><button onClick={() => moderateMedia(item._id, false)}><X size={14} /></button></>}
                  <button className="delete" onClick={() => deleteMedia(item._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && <div className="admin-gallery-empty"><ImagePlus size={30} /><strong>No media found</strong></div>}
      </div>
    </div>
  );
}

export default Gallery;
