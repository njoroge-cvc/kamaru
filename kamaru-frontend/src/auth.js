// Client-side session + permission helpers.
// The backend is the real gatekeeper (every protected endpoint checks permissions);
// these only decide what the UI shows.

const KEYS = ["token", "is_admin", "role", "permissions", "kamaru:remember", "kamaru:lastActive"];
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
  NEWSLETTER: "newsletter:manage",
  ADMINS: "admins:manage", // Super admins: grant/remove Administrator and Super admin access
};

export const ROLE_LABELS = {
  member: "Member",
  media: "Media team",
  coordinator: "Coordinator",
  admin: "Administrator",
  superadmin: "Super admin",
};

const safeGet = (k) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

/** The sign-in token (or null). Every API call reads it through here. */
export const getToken = () => safeGet("token");

// ---------------------------------------------------------------------------
// Inactivity sign-out. The last-activity time lives in localStorage, so every open tab
// shares one clock, and it survives a browser restart (closing the browser and coming
// back after the limit means you're signed out).
// ---------------------------------------------------------------------------
export const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const IDLE_WARNING_MS = 2 * 60 * 1000; // warn 2 minutes before

export const rememberMe = () => safeGet("kamaru:remember") === "1";
export const lastActive = () => Number(safeGet("kamaru:lastActive")) || 0;
export const touchActivity = () => {
  try {
    localStorage.setItem("kamaru:lastActive", String(Date.now()));
  } catch {}
};
/** True when a signed-in, not-remembered session has been idle past the limit. */
export const isIdleExpired = () =>
  !!getToken() && !rememberMe() && lastActive() > 0 && Date.now() - lastActive() > IDLE_LIMIT_MS;

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
  if (!permissions.length && role === "admin") permissions = Object.values(PERMS).filter((p) => p !== PERMS.ADMINS);
  return { token, role, permissions };
};

export const hasPermission = (perm) => getSession().permissions.includes(perm);
export const isStaff = () => hasPermission(PERMS.DASHBOARD);

/** Accepts the login response or a /users/me profile. */
export const saveSession = ({ token, role, permissions, is_admin, remember }) => {
  if (token) {
    localStorage.setItem("token", token);
    // A fresh login sets the "keep me signed in" choice and starts the activity clock
    localStorage.setItem("kamaru:remember", remember ? "1" : "0");
    touchActivity();
  }
  if (role) localStorage.setItem("role", role);
  if (permissions) localStorage.setItem("permissions", JSON.stringify(permissions));
  localStorage.setItem("is_admin", String(is_admin ?? ["admin", "superadmin"].includes(role)));
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
