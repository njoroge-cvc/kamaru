import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaFilePdf, FaFileExcel, FaSearch, FaUserTag } from "react-icons/fa";
import * as XLSX from "xlsx";
import { fetchUsers, updateUser, deleteUser, fetchRoles } from "../api";
import { ROLE_LABELS, PERMS, rolesLabel } from "../auth";
import { useSession } from "./useSession";
import { PageHeader, Modal, Field, EmptyState, usePaged, Pager } from "./ui";

const ROLE_STYLE = {
  superadmin: "k-badge-earth !bg-earth !text-kamaru",
  admin: "k-badge-red",
  coordinator: "k-badge-blue",
  media: "k-badge-gold",
  staff: "k-badge-green",
  member: "k-badge-earth",
};

const ROLE_HINT = {
  staff: "Any staff member or official (judges, MCs, desk team). Can open the dashboard's Documents.",
  media: "Gallery, videos, site media, blog and newsletter.",
  coordinator: "Seasons and registration, participants, events and the blog.",
  admin: "Everything, including users and roles (not Administrator accounts).",
  superadmin: "Everything, including making or removing Administrators.",
};
// A user's staff roles (older API responses only sent `role`)
const rolesOf = (u) => (u.roles ? u.roles : u.role && u.role !== "member" ? [u.role] : []);

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
  "newsletter:manage": "Newsletter",
  "admins:manage": "Administrator access",
  "stats:view": "Overview charts",
  "documents:view": "Documents",
  "documents:manage": "Upload & manage documents",
};

const PRIVILEGED = ["admin", "superadmin"];

const ManageUsers = () => {
  // Only Super admins can grant/remove admin-level roles or change admin-level accounts
  const { permissions } = useSession();
  const canManageAdmins = permissions.includes(PERMS.ADMINS);
  const lockedFor = (user) => !canManageAdmins && rolesOf(user).some((r) => PRIVILEGED.includes(r));
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setBusy(editingUser.id);
    try {
      const r = await updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        roles: editingUser.roles,
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
        (roleFilter === "all" ||
          (roleFilter === "group:member" && rolesOf(u).length === 0) ||
          (roleFilter === "group:staff" && rolesOf(u).length > 0) ||
          rolesOf(u).includes(roleFilter)) &&
        (!q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, query, roleFilter]);
  const paged = usePaged(filtered, 10);

  const staffRoles = roles.filter((r) => r.role !== "member");
  const openEditor = (user) => setEditingUser({ ...user, roles: rolesOf(user) });
  const toggleRole = (role) =>
    setEditingUser((u) => ({ ...u, roles: u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role] }));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((u) => ({ Username: u.username, Email: u.email, Group: rolesOf(u).length ? "Staff" : "Member", Roles: rolesLabel(rolesOf(u)) })));
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
      head: [["Username", "Email", "Group", "Roles"]],
      body: filtered.map((u) => [u.username, u.email, rolesOf(u).length ? "Staff" : "Member", rolesLabel(rolesOf(u))]),
      headStyles: { fillColor: [43, 26, 16] },
    });
    doc.save("kamaru_users.pdf");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Access"
        title="Users & Roles"
        description="Two groups: members, and staff (officials). Staff can hold one or several roles; their access is everything those roles allow. Changes take effect the next time they load the site."
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
            <p className="mt-2 text-xs text-earth-600">
              {r.role === "member" ? users.filter((u) => rolesOf(u).length === 0).length : users.filter((u) => rolesOf(u).includes(r.role)).length} user(s)
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute z-10 left-4 top-1/2 -translate-y-1/2 text-earth-600" />
          <input className="k-input pl-11" placeholder="Search by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="k-input sm:w-56" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">Everyone</option>
          <option value="group:member">Members</option>
          <option value="group:staff">All staff</option>
          {staffRoles.map((r) => (
            <option key={r.role} value={r.role}>Role: {r.label}</option>
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
                <th>Group &amp; roles</th>
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
                    {rolesOf(user).length === 0 ? (
                      <span className="k-badge k-badge-earth">Member</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {rolesOf(user).map((r) => (
                          <span key={r} className={`k-badge ${ROLE_STYLE[r] || "k-badge-earth"}`}>{ROLE_LABELS[r] || r}</span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <button className="k-icon-btn" onClick={() => openEditor(user)} disabled={lockedFor(user)} aria-label={`Edit ${user.username}'s roles`} title={lockedFor(user) ? "Only a Super admin can change this account" : "Edit account and roles"}>
                      <FaUserTag />
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

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Account and roles">
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Field label="Username">
              <input className="k-input" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} required />
            </Field>
            <Field label="Email">
              <input type="email" className="k-input" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
            </Field>
            <fieldset>
              <legend className="k-label">Group and roles</legend>
              <p className="k-hint -mt-1 mb-3">
                No roles ticked = a member. Tick one or more to make them staff; they get everything those roles allow.
              </p>
              <div className="space-y-2">
                {staffRoles.map((r) => {
                  const locked = !canManageAdmins && PRIVILEGED.includes(r.role);
                  return (
                    <label key={r.role} className={`k-cut flex items-start gap-3 bg-cream p-3 ${locked ? "opacity-50" : "cursor-pointer"}`}>
                      <input type="checkbox" checked={editingUser.roles.includes(r.role)} disabled={locked} onChange={() => toggleRole(r.role)} className="mt-0.5 h-4 w-4 accent-kamaru" />
                      <span>
                        <span className="block text-sm font-semibold text-earth">{r.label}</span>
                        <span className="block text-xs text-earth-600">{ROLE_HINT[r.role]}{locked ? " Only a Super admin can grant this." : ""}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-earth-700">
                Result: <strong>{editingUser.roles.length ? `Staff group: ${rolesLabel(staffRoles.map((r) => r.role).filter((r) => editingUser.roles.includes(r)).reverse())}` : "Member"}</strong>
              </p>
            </fieldset>
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
