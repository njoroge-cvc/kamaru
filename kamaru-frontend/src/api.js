import axios from "axios";

// Base URL for the backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Axios instance for API requests
const api = axios.create({ // Create a new axios instance
  baseURL: API_BASE_URL, // Set the base URL for the API
  // Set the content type to JSON for all requests made by this instance (optional) 
  headers: {
    "Content-Type": "application/json", // Set the default content type for requests
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
  api.get("/participants/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Include the token
    },
  });

// Public registration
export const registerParticipant = (participantData) => {
  const token = localStorage.getItem("token");
  return api.post("/participants/", participantData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Admin registration
export const adminRegisterParticipant = (participantData) =>
  api.post("/participants/admin", participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Update a participant (admin-only)
export const updateParticipant = (participantId, participantData) =>
  api.put(`/participants/${participantId}`, participantData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Delete a participant (admin-only)
export const deleteParticipant = (participantId) =>
  api.delete(`/participants/${participantId}`, {
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


// Event API (CRUD) - Admin-only
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
      "Content-Type": "multipart/form-data", // Set the content type for the request to multipart/form-data
    },
  });
export const deleteEvent = (eventId) =>
  api.delete(`/events/${eventId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

// Stats API
// Fetch site-wide statistics
export const fetchStats = () =>
  api.get("/stats/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

export default api;