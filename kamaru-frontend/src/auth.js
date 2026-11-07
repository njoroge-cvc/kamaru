// Client-side session + permission helpers.
// The backend is the real gatekeeper (every protected endpoint checks permissions);
// these only decide what the UI shows.

const KEYS = ["token", "is_admin", "role", "permissions"];
const EVENT = "kamaru:session";

export const PERMS = {
  DASHBOARD: "dashboard:view",
  EVENTS: "events:manage",
  PARTICIPANTS: "participants:manage",
  SEASONS: "seasons:manage",
  GALLERY: "gallery:manage",
  VIDEOS: "videos:manage",
  SITE_IMAGES: "site_images:manage",
  USERS: "users:manage",
  BLOG: "blog:manage",
};

export const ROLE_LABELS = {
  member: "Member",
  media: "Media team",
  coordinator: "Coordinator",
  admin: "Administrator",
};

const safeGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

export const getSession = () => {
  const token = safeGet("token");
  let permissions = [];
  try {
    permissions = JSON.parse(safeGet("permissions") || "[]");
  } catch {
    permissions = [];
  }
  const role = safeGet("role") || (safeGet("is_admin") === "true" ? "admin" : token ? "member" : null);
  // Older sessions (before RBAC) only stored is_admin
  if (!permissions.length && role === "admin") permissions = Object.values(PERMS);
  return { token, role, permissions };
};

export const hasPermission = (perm) => getSession().permissions.includes(perm);
export const isStaff = () => hasPermission(PERMS.DASHBOARD);

/** Accepts the login response or a /users/me profile. */
export const saveSession = ({ token, role, permissions, is_admin }) => {
  if (token) localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);
  if (permissions) localStorage.setItem("permissions", JSON.stringify(permissions));
  localStorage.setItem("is_admin", String(is_admin ?? role === "admin"));
  window.dispatchEvent(new Event(EVENT));
};

export const clearSession = () => {
  KEYS.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(EVENT));
};

/** Subscribe to login/logout/role changes. Returns an unsubscribe function. */
export const onSessionChange = (cb) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
