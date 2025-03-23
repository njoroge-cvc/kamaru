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

// Gallery API
export const fetchGalleryImages = () => api.get("/gallery");
export const uploadImage = (imageData) => api.post("/gallery/upload", imageData);

// Video API
export const fetchVideos = () => api.get("/videos");
export const addVideo = (videoData) => api.post("/videos/add", videoData);

// Event API
export const fetchEvents = () => api.get("/events");
export const fetchEventDetails = (eventId) => api.get(`/events/${eventId}`);
export const createEvent = (eventData) => api.post("/events", eventData);

// Participant API
export const registerParticipant = (participantData) =>
  api.post("/participants/register", participantData);

export default api;