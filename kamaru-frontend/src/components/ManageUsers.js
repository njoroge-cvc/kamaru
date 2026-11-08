import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaUserEdit, FaTrash, FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { fetchUsers, updateUser, deleteUser, fetchRoles } from "../api";
import { ROLE_LABELS, PERMS } from "../auth";
import { useSession } from "./useSession";
import { PageHeader, Modal, Field, EmptyState, usePaged, Pager } from "./ui";

const ROLE_STYLE = {
  superadmin: "k-badge-earth !bg-earth !text-kamaru",
  admin: "k-badge-red",
  coordinator: "k-badge-blue",
  media: "k-badge-gold",
  member: "k-badge-earth",
};

const PERM_LABELS = {
  "dashboard:view": "Dashboard",
  "events:manage": "Events",
  "participants:manage": "Participants",
  "seasons:manage": "Seasons & registration",
  "gallery:manage": "Gallery",
  "videos:manage": "Videos",
  "site_images:manage": "Site media",
  "users:manage": "Users & roles",
  "blog:manage": "Blog",
  "admins:manage": "Administrator access",
};

const PRIVILEGED = ["admin", "superadmin"];

const ManageUsers = () => {
  // Only Super admins can grant/remove admin-level roles or change admin-level accounts
  const { permissions } = useSession();
  const canManageAdmins = permissions.includes(PERMS.ADMINS);
  const lockedFor = (user) => !canManageAdmins && PRIVILEGED.includes(user.role);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [busy, setBusy] = useState(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      fetchUsers().then((r) => setUsers(r.data)),
      fetchRoles()
        .then((r) => setRoles(r.data))
        .catch(() => setRoles(Object.entries(ROLE_LABELS).map(([role, label]) => ({ role, label, permissions: [] })))),
    ])
      .catch(() => toast.error("Couldn't load users."))
      .finally(() => setLoading(false));
  }, []);

  const replaceUser = (u) => setUsers((list) => list.map((x) => (x.id === u.id ? u : x)));

  const changeRole = async (user, role) => {
    if (role === user.role) return;
    if (!window.confirm(`Change ${user.username}'s role to ${ROLE_LABELS[role] || role}?`)) return;
    setBusy(user.id);
    try {
      const r = await updateUser(user.id, { role });
      replaceUser(r.data.user);
      toast.success(`${user.username} is now ${ROLE_LABELS[role] || role}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't change role.");
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setBusy(editingUser.id);
    try {
      const r = await updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
      });
      replaceUser(r.data.user);
      setEditingUser(null);
      toast.success("User updated.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't update user.");
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.username}? This can't be undone.`)) return;
    setBusy(user.id);
    try {
      await deleteUser(user.id);
      setUsers((list) => list.filter((u) => u.id !== user.id));
      toast.success("User deleted.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Couldn't delete user.");
    } finally {
      setBusy(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        (roleFilter === "all" || u.role === roleFilter) &&
        (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, query, roleFilter]);
  const paged = usePaged(filtered, 10);

  const roleLabel = (r) => ROLE_LABELS[r] || r;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((u) => ({ Username: u.username, Email: u.email, Role: roleLabel(u.role) })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "kamaru_users.xlsx");
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.text("Kamaru Challenge — Users", 14, 12);
    autoTable(doc, {
      startY: 18,
      head: [["Username", "Email", "Role"]],
      body: filtered.map((u) => [u.username, u.email, roleLabel(u.role)]),
      headStyles: { fillColor: [43, 26, 16] },
    });
    doc.save("kamaru_users.pdf");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Access"
        title="Users & Roles"
        description="Give each team member only the access they need. Roles take effect the next time they load the site."
        actions={
          <>
            <button onClick={exportToPDF} className="k-btn-outline k-btn-sm"><FaFilePdf /> PDF</button>
            <button onClick={exportToExcel} className="k-btn-outline k-btn-sm"><FaFileExcel /> Excel</button>
          </>
        }
      />

      {/* What each role can do */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {roles.map((r) => (
          <div key={r.role} className="k-card p-5">
            <span className={ROLE_STYLE[r.role] || "k-badge-earth"}>{r.label}</span>
            <p className="mt-3 text-sm text-earth-700">
              {r.permissions.length
                ? r.permissions.filter((p) => p !== "dashboard:view").map((p) => PERM_LABELS[p] || p).join(" · ")
                : "Public site & contestant registration"}
            </p>
            <p className="mt-2 text-xs text-earth-600">{users.filter((u) => u.role === r.role).length} user(s)</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-600" />
          <input className="k-input pl-11" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="k-input sm:w-56" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r.role} value={r.role}>{r.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="k-card h-48 animate-pulse" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users match." />
      ) : (
        <div className="k-table-wrap bg-white">
          <table className="k-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.slice.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-kamaru/20 font-bold uppercase text-kamaru-dark">
                        {user.username?.[0]}
                      </span>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td className="text-earth-700">{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={busy === user.id || lockedFor(user)}
                      title={lockedFor(user) ? "Only a Super admin can change this account" : undefined}
                      onChange={(e) => changeRole(user, e.target.value)}
                      className="k-input w-44 py-1.5"
                      aria-label={`Role for ${user.username}`}
                    >
                      {roles.map((r) => (
                        <option key={r.role} value={r.role} disabled={!canManageAdmins && PRIVILEGED.includes(r.role)}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button className="k-icon-btn" onClick={() => setEditingUser(user)} disabled={lockedFor(user)} aria-label="Edit user" title={lockedFor(user) ? "Only a Super admin can edit this account" : "Edit"}>
                      <FaUserEdit />
                    </button>
                    <button className="k-icon-btn hover:!text-bead-red" onClick={() => handleDeleteUser(user)} disabled={busy === user.id || lockedFor(user)} aria-label="Delete user" title={lockedFor(user) ? "Only a Super admin can delete this account" : "Delete"}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager paged={paged} label="users" />

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit user" size="sm">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Field label="Username">
              <input className="k-input" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} required />
            </Field>
            <Field label="Email">
              <input type="email" className="k-input" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
            </Field>
            <Field label="Role">
              <select className="k-input" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.role} value={r.role} disabled={!canManageAdmins && PRIVILEGED.includes(r.role)}>{r.label}</option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="k-btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
              <button type="submit" className="k-btn-primary" disabled={busy === editingUser.id}>Save changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsers;
