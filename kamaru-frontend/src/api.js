import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios instance for API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
// Register a new user
export const registerUser = (userData) => api.post("/users/register", userData);
export const loginUser = (credentials) => api.post("/users/login", credentials);
export const getAdminDashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in local storage.");
    return Promise.reject("No token found.");
  }

  return api.get("/users/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

// Fetch all users (admin-only)
export const fetchUsers = () =>
  api.get("/users/admin/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Fetch a single user by ID (admin-only)
export const fetchUser = (userId) =>
  api.get(`/users/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Update a user (admin-only)
export const updateUser = (userId, userData) =>
  api.put(`/users/admin/users/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Delete a user (admin-only)
export const deleteUser = (userId) =>
  api.delete(`/users/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  
// Participant API
// Fetch all participants
export const fetchParticipants = () =>
  api.get("/participants", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token
    },
  });

// Public registration
export const registerParticipant = (participantData) =>
  api.post("/register", participantData);

// Admin registration
export const adminRegisterParticipant = (participantData) =>
  api.post("/admin/register", participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Update a participant (admin-only)
export const updateParticipant = (participantId, participantData) =>
  api.put(`/participant/${participantId}`, participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Delete a participant (admin-only)
export const deleteParticipant = (participantId) =>
  api.delete(`/participant/${participantId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });


// Gallery API
// Fetch all gallery images
export const fetchGalleryImages = () => api.get("/gallery");

// Upload a new image
export const uploadImage = (formData) =>
  api.post("/gallery/upload", formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

// Delete an image
export const deleteImage = (imageId) =>
  api.delete(`/gallery/${imageId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });


// Video API
// Fetch all videos
export const fetchVideos = () => api.get("/videos");

// Add a new video
export const addVideo = (videoData) =>
  api.post("/videos/add", videoData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Delete a video
export const deleteVideo = (videoId) =>
  api.delete(`/videos/delete/${videoId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Event API
export const fetchEvents = () => api.get("/events");

export const fetchEvent = (eventId) => api.get(`/events/${eventId}`);

export const createEvent = (eventData) =>
  api.post("/events/admin", eventData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const updateEvent = (eventId, eventData) =>
  api.put(`/events/admin/${eventId}`, eventData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export const deleteEvent = (eventId) =>
  api.delete(`/events/admin/${eventId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export default api;