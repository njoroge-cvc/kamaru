import React, { useState, useEffect } from "react";
import { fetchGalleryImages, fetchEvents } from "../api"; // Import API functions
import { Link } from "react-router-dom"; // Import Link from react-router-dom

const HomePage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [events, setEvents] = useState([]);

  
  // Fetch Hero Images from Cloudinary (Gallery)
  useEffect(() => {
    fetchGalleryImages()
      .then((response) => {
        if (response.data && Array.isArray(response.data.images)) {
          // Select first 3 images for hero section (adjust if needed)
          setHeroImages(response.data.images.slice(0, 3));
        }
      })
      .catch((error) => console.error("Error fetching hero images:", error));
  }, []);

  // Automatically switch images in the carousel every 5 seconds
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  useEffect(() => {
    fetchEvents().then((response) => setEvents(response.data));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (Dynamic Carousel) */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {heroImages.length > 0 ? (
          <img
            src={heroImages[currentImageIndex]?.image_url}
            alt={`Hero ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300 text-gray-700">
            <p>Loading hero images...</p>
          </div>
        )}
      </div>

      {/* Event Overview */}
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold text-[#8F3B1B]">
          Kamaru Challenge - Ndeiya Edition
        </h1>
        <p className="text-lg text-[#D57500] mt-2">
          Fanning the Flame of Values through Music & Culture
        </p>
        <p className="text-md text-gray-700 mt-4 leading-relaxed">
          This annual musical competition provides a platform for the community
          to rediscover and showcase their talents through the Kikuyu language,
          promoting timeless values.
        </p>
      </div>
      
      {/* Upcoming Events */}
      <div>
      <h1>Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="border p-4">
            <img src={event.image_url} alt={event.title} />
            <h2>{event.title}</h2>
            <p>{event.date_time}</p>
            <Link to={`/events/${event.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>

      {/* Other sections */}
    </div>
  );
};

export default HomePage;
