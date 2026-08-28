import {
  Mail,
  MoreVertical,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import authService from "../../services/authService";
import Modal from "../../components/Modal";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    contactNumber: "",
    department: "",
    enrollmentNumber: "",
    password: "",
    confirmPassword: "",
    role: "participant",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = () => authService.getAllUsersAdmin().then((response) => {
      setUsers((response.users || []).map((user) => ({
        ...user,
        id: user._id,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        status: user.status === "suspended" ? "Suspended" : "Active",
        joined: new Date(user.createdAt).toLocaleDateString(),
      })));
    });

  useEffect(() => { loadUsers(); }, []);

  const addUser = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!editingUser && form.password !== form.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await authService.updateUserAdmin(editingUser.id, {
          name: form.name,
          username: form.username,
          email: form.email,
          contactNumber: form.contactNumber,
          department: form.department,
          enrollmentNumber: form.enrollmentNumber,
          role: form.role,
        });
      } else {
        const userData = { ...form };
        delete userData.confirmPassword;
        await authService.register(userData);
      }
      await loadUsers();
      setForm({ name: "", username: "", email: "", contactNumber: "", department: "", enrollmentNumber: "", password: "", confirmPassword: "", role: "participant" });
      setIsAddModalOpen(false);
      setEditingUser(null);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      role === "All" || user.role === role;

    return matchSearch && matchRole;
  });

  const toggleStatus = (id) => {
    const target = users.find((user) => user.id === id);
    if (!target) return;
    authService.updateUserStatusAdmin(id, target.status === "Active" ? "suspended" : "active")
      .then(() => loadUsers())
      .catch((requestError) => setRequestError(requestError.message));
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      contactNumber: user.contactNumber || "",
      department: user.department || "",
      enrollmentNumber: user.enrollmentNumber || "",
      password: "",
      confirmPassword: "",
      role: user.role.toLowerCase(),
    });
    setIsAddModalOpen(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await authService.deleteUserAdmin(id);
      await loadUsers();
    } catch (requestError) {
      setRequestError(requestError.message);
    }
  };

  const resetUserPassword = async (targetUser) => {
    const password = window.prompt(`Set a new password for ${targetUser.name}`);
    if (!password) return;
    try {
      await authService.adminResetUserPassword(targetUser.id, password);
      setRequestError("");
    } catch (requestError) {
      setRequestError(requestError.message);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">

        <section className="admin-users-header">
          <div>
            <span>USER MANAGEMENT</span>
            <h1>
              Platform
              <strong> users.</strong>
            </h1>
            <p>
              Manage participants, organizers and platform
              accounts from one place.
            </p>
          </div>

          <button
            className="admin-users-add"
            onClick={() => { setEditingUser(null); setRequestError(""); setIsAddModalOpen(true); }}
          >
            <UserPlus size={16} />
            Add user
          </button>
        </section>

        <div className="admin-users-stats">
          <div>
            <UsersIcon size={18} />
            <strong>{users.length}</strong>
            <span>Total users</span>
          </div>

          <div>
            <UserCheck size={18} />
            <strong>
              {users.filter((u) => u.status === "Active").length}
            </strong>
            <span>Active users</span>
          </div>

          <div>
            <ShieldCheck size={18} />
            <strong>
              {users.filter((u) => u.role === "Organizer").length}
            </strong>
            <span>Organizers</span>
          </div>

          <div>
            <UserX size={18} />
            <strong>
              {users.filter((u) => u.status === "Suspended").length}
            </strong>
            <span>Suspended</span>
          </div>
        </div>

        <section className="admin-users-panel">

          {requestError && <p className="admin-users-error">{requestError}</p>}

          <div className="admin-users-toolbar">

            <div className="admin-users-search">
              <Search size={16} />
              <input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-role-filter">
              {["All", "Participant", "Organizer", "Admin"].map((item) => (
                <button
                  key={item}
                  className={role === item ? "active" : ""}
                  onClick={() => setRole(item)}
                >
                  {item}
                </button>
              ))}
            </div>

          </div>

          <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>
                            <Mail size={11} />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="admin-role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-user-status ${
                          user.status === "Active"
                            ? "active"
                            : "suspended"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <span className="admin-joined">
                        {user.joined}
                      </span>
                    </td>

                    <td>
                      <div className="admin-user-actions">
                        <button
                          onClick={() =>
                            toggleStatus(user.id)
                          }
                        >
                          {user.status === "Active"
                            ? "Suspend"
                            : "Activate"}
                        </button>

                        <button onClick={() => resetUserPassword(user)}>Reset password</button>

                        <button className="icon" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`}>
                          <MoreVertical size={16} />
                        </button>
                        <button className="icon delete" onClick={() => deleteUser(user.id)} aria-label={`Delete ${user.name}`}>
                          <UserX size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>

      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingUser(null); }}
        title={editingUser ? "Edit user" : "Add user"}
      >
        <form onSubmit={addUser} className="space-y-4 p-6">
          {formError && <p className="text-sm text-rose-400">{formError}</p>}
          {[["name", "Full name"], ["username", "Username"], ["email", "Email address"], ["contactNumber", "Contact number"], ["department", "Department"], ["enrollmentNumber", "Enrollment number"], ...(!editingUser ? [["password", "Password"], ["confirmPassword", "Confirm password"]] : [])].map(([name, label]) => (
            <label className="block" key={name}>
              <span className="mb-1 block text-xs font-bold text-slate-300">{label}</span>
              <input
                required
                type={name === "email" ? "email" : name === "password" ? "password" : "text"}
                value={form[name]}
                onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-300">Account role</span>
            <select
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {submitting ? "Saving user..." : editingUser ? "Save changes" : "Create user"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Users;