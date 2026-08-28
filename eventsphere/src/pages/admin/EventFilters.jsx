import { Edit3, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";
import "../Categories.css";

const filterGroups = [
  { kind: "department", label: "Departments", placeholder: "Department name" },
  { kind: "eventType", label: "Event types", placeholder: "Event type name" },
];

function EventFilters() {
  const [items, setItems] = useState({ department: [], eventType: [] });
  const [drafts, setDrafts] = useState({ department: "", eventType: "" });
  const [editing, setEditing] = useState({ department: null, eventType: null });
  const [error, setError] = useState("");

  const load = async (kind) => {
    const response = await categoryService.getAllAdmin(kind);
    setItems((current) => ({ ...current, [kind]: response.categories || [] }));
  };

  useEffect(() => {
    Promise.all(filterGroups.map(({ kind }) => load(kind))).catch((requestError) => setError(requestError.message));
  }, []);

  const save = async (event, kind) => {
    event.preventDefault();
    setError("");
    try {
      if (editing[kind]) await categoryService.update(editing[kind], drafts[kind]);
      else await categoryService.create(drafts[kind], kind);
      setDrafts((current) => ({ ...current, [kind]: "" }));
      setEditing((current) => ({ ...current, [kind]: null }));
      await load(kind);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (item, kind) => {
    try {
      await categoryService.adminDelete(item._id);
      await load(kind);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-container event-filters-container">
        <span className="categories-kicker">TAXONOMY MANAGEMENT</span>
        <h1>Event <strong>filters.</strong></h1>
        <p>Manage the departments and event types available when creating and filtering events.</p>

        {error && <p className="categories-error">{error}</p>}

        <div className="event-filters-grid">
          {filterGroups.map(({ kind, label, placeholder }) => (
            <section className="event-filter-section" key={kind}>
              <div className="event-filter-heading">
                <SlidersHorizontal size={18} />
                <h2>{label}</h2>
              </div>
              <form className="categories-form" onSubmit={(event) => save(event, kind)}>
                <input
                  required
                  value={drafts[kind]}
                  placeholder={placeholder}
                  onChange={(event) => setDrafts((current) => ({ ...current, [kind]: event.target.value }))}
                />
                <button type="submit"><Plus size={16} />{editing[kind] ? "Update" : "Add"}</button>
              </form>
              <div className="categories-list">
                {items[kind].map((item) => (
                  <div className="category-row" key={item._id}>
                    <strong>{item.name}</strong>
                    <button type="button" onClick={() => {
                      setEditing((current) => ({ ...current, [kind]: item._id }));
                      setDrafts((current) => ({ ...current, [kind]: item.name }));
                    }}><Edit3 size={15} /></button>
                    <button type="button" onClick={() => remove(item, kind)}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventFilters;