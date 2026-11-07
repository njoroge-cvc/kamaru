import axios from "axios";
import { clearSession } from "./auth";

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "/api";

// Axios instance for API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Expired or invalid session: clear stale credentials so the UI stops claiming
// the user is logged in, then send them to log in again.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const msg = String(error.response?.data?.msg || "");
    const hadToken = !!localStorage.getItem("token");
    if (hadToken && (status === 401 || (status === 422 && /token|signature|segments/i.test(msg)))) {
      clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(`/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    return Promise.reject(error);
  }
);

// User API
export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const getAdminDashboard = () =>
  api.get("/users/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const fetchUsers = () =>
  api.get("/users/admin/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const fetchUser = (userId) =>
  api.get(`/users/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const updateUser = (userId, userData) =>
  api.put(`/users/admin/users/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const deleteUser = (userId) =>
  api.delete(`/users/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Participant API
export const fetchParticipants = (seasonId = "") =>
  api.get(
    `/participants/${seasonId ? `?season_id=${seasonId}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
export const registerParticipant = (participantData) =>
  api.post("/participants/", participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const adminRegisterParticipant = (participantData) =>
  api.post("/participants/admin", participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const updateParticipant = (participantId, participantData) =>
  api.put(`/participants/${participantId}`, participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const deleteParticipant = (participantId) =>
  api.delete(`/participants/${participantId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // season API
  export const fetchSeasons = () =>
  api.get("/seasons/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  export const fetchActiveSeason = () =>
    api.get("/seasons/active");

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const createSeason = (data) => api.post("/seasons/", data, { headers: authHeader() });
// data: { name?, year?, is_active?, registration_open?, registration_closes_at? }
export const updateSeason = (seasonId, data) =>
  api.patch(`/seasons/${seasonId}`, data, { headers: authHeader() });

// Current user's profile + role + permissions
// A member's own competition entries (all seasons) and withdrawal while registration is open
export const fetchMyEntries = () => api.get("/participants/mine", { headers: authHeader() });
export const withdrawMyEntry = (id) => api.delete(`/participants/mine/${id}`, { headers: authHeader() });

export const fetchMe = () => api.get("/users/me", { headers: authHeader() });
export const fetchRoles = () => api.get("/users/roles", { headers: authHeader() });

// Gallery API
export const fetchGalleryImages = () => api.get("/gallery");
export const uploadImage = (formData) =>
  api.post("/gallery/upload", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteImage = (imageId) =>
  api.delete(`/gallery/${imageId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// System Images API
export const uploadSystemImage = (formData) =>
  api.post("/sys_images/upload", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
export const fetchSystemImage = (section) => api.get(`/sys_images/${section}`);

export const deleteSystemImage = (imageId) =>
  api.delete(`/sys_images/${imageId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });


export const uploadBanner = (formData) =>
  api.post("/sys_images/banners/upload", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const fetchBanners = () => api.get("/sys_images/banners");

export const deleteBanner = (bannerId) =>
  api.delete(`/sys_images/banners/${bannerId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Video API
export const fetchVideos = () => api.get("/videos");
export const addVideo = (videoData) =>
  api.post("/videos/add", videoData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
export const deleteVideo = (videoId) =>
  api.delete(`/videos/delete/${videoId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Event API
// scope: "upcoming" (default), "past" or "all"
export const fetchEvents = (scope) =>
  api.get("/events/", { params: scope ? { scope } : undefined });
export const fetchEvent = (eventId) => api.get(`/events/${eventId}`);
export const createEvent = (formData) =>
  api.post("/events/", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
export const updateEvent = (eventId, formData) =>
  api.put(`/events/${eventId}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteEvent = (eventId) =>
  api.delete(`/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Stats API
export const fetchStats = () =>
  api.get("/stats/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Password reset APIs
export const forgotPassword = (email) =>
  api.post("/users/forgot_password", { email });

export const resetPassword = (data) =>
  api.post("/users/reset_password", data);

// Newsletter API
export const subscribeToNewsletter = (data) =>
  api.post("/newsletter/subscribe", data);

// Newsletter verification API
export const verifyNewsletter = (token) =>
  api.get(`/newsletter/verify?token=${token}`);

// Contact API
export const sendContactMessage = (data) => api.post("/contact", data);

export default api;

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
const authHeaders = (multipart) => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  ...(multipart ? { "Content-Type": "multipart/form-data" } : {}),
});
export const fetchBlogPosts = () => api.get("/blog/");
export const fetchBlogPost = (slug) => api.get(`/blog/${encodeURIComponent(slug)}`);
export const fetchAllBlogPosts = () => api.get("/blog/admin/all", { headers: authHeaders() });
export const createBlogPost = (formData) => api.post("/blog/", formData, { headers: authHeaders(true) });
export const updateBlogPost = (id, formData) => api.put(`/blog/${id}`, formData, { headers: authHeaders(true) });
export const deleteBlogPost = (id) => api.delete(`/blog/${id}`, { headers: authHeaders() });
export const fetchDashboardStats = () => api.get("/stats/dashboard", { headers: authHeaders() });
