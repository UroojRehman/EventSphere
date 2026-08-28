import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import categoryService from "../services/categoryService";
import "./Categories.css";

function Categories() {
  const { user } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = user?.role === "admin"
        ? await categoryService.getAllAdmin()
        : await categoryService.getAll();
      setCategories(response.categories || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editingId) await categoryService.update(editingId, name);
      else await categoryService.create(name);
      setName("");
      setEditingId(null);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const remove = async (item) => {
    try {
      if (user.role === "admin") await categoryService.adminDelete(item._id);
      else await categoryService.requestDelete(item._id);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-container">
        <span className="categories-kicker">TAXONOMY MANAGEMENT</span>
        <h1>Event <strong>categories.</strong></h1>
        <p>Create and organize categories used by events and gallery media.</p>
        <form className="categories-form" onSubmit={save}>
          <input required value={name} placeholder="Category name" onChange={(event) => setName(event.target.value)} />
          <button type="submit"><Plus size={16} />{editingId ? "Update" : "Add category"}</button>
        </form>
        {error && <p className="categories-error">{error}</p>}
        <div className="categories-list">
          {categories.map((item) => (
            <div className="category-row" key={item._id}>
              <strong>{item.name}</strong>
              {item.deletionRequested && <span>Deletion pending admin approval</span>}
              <button onClick={() => { setEditingId(item._id); setName(item.name); }}><Edit3 size={15} /></button>
              <button disabled={item.deletionRequested} onClick={() => remove(item)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Categories;
