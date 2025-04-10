import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Axios instance for API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
export const fetchParticipants = () =>
  api.get("/participants/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
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
export const fetchEvents = () => api.get("/events/");
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

// Newsletter API
export const subscribeToNewsletter = (data) =>
  api.post("/newsletter/subscribe", data);

// Contact API
export const sendContactMessage = (data) => api.post("/contact", data);

export default api;
