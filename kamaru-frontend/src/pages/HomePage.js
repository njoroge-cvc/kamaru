import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { fetchGalleryImages, fetchEvents, fetchVideos, fetchSystemImage, fetchBanners} from "../api";
import { Link } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import Stats from "../components/Stats";
import EventCard from "../components/EventCard";
import MediaCard from "../components/MediaCard";
import { FaUsers, FaMusic, FaHeart } from "react-icons/fa";

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#D57500] text-white p-2 rounded-full shadow-md hover:bg-[#333] transition"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#D57500] text-white p-2 rounded-full shadow-md hover:bg-[#333] transition"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);


const extractYouTubeID = (url) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/
  );
  return match ? match[1] : "";
};

const HomePage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [events, setEvents] = useState([]);
  const [latestVideo, setLatestVideo] = useState(null);
  const [aboutImage, setAboutImage] = useState("");
  const [contactImage, setContactImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  useEffect(() => {
    // Fetch the banner image
  fetchBanners()
      .then((res) => {
        // Check if the response contains banners
        // and set the first one as the banner image
        if (res.data.banners.length > 0) {
          setBannerImage(res.data.banners[1].image_url); //
        }
      })
      .catch((err) => console.error("Banner fetch error:", err));
  }, []);

  useEffect(() => {
    fetchGalleryImages()
      .then((response) => {
        if (response.data?.images) {
          const shuffledImages = response.data.images.sort(() => 0.5 - Math.random());
          setHeroImages(shuffledImages.slice(0, 3));
          setGalleryImages(response.data.images.slice(0, 10));
        }
      })
      .catch((error) => console.error("Error fetching gallery images:", error));

    fetchEvents()
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));

      fetchVideos()
      .then((response) => {
        if (response.data?.videos) {
          const video = response.data.videos[0];
          setLatestVideo({
            ...video,
            youtube_id: extractYouTubeID(video.youtube_url),
          });
        }
      })
      .catch((error) => console.error("Error fetching videos:", error));

    fetchSystemImage("about")
      .then((response) => {
        if (response.data?.image?.image_url) {
          setAboutImage(response.data.image.image_url);
        }
      })
      .catch((error) => console.error("Error fetching About Us image:", error));

    fetchSystemImage("contact")
      .then((response) => {
        if (response.data?.image?.image_url) {
          setContactImage(response.data.image.image_url);
        }
      })
      .catch((error) => console.error("Error fetching Contact Us image:", error));
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const galleryCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full min-h-[300px] md:h-[400px] overflow-hidden">
        {heroImages.map((img, index) => (
          <img
            key={index}
            src={img?.image_url}
            alt={`Hero ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Event Overview */}
      <section
  className="text-center p-6 bg-gray-50 bg-fixed bg-cover bg-center"
  style={{ backgroundImage: `url(${bannerImage || "/default-banner.jpg"})` }}
>
  <h1 className="text-3xl md:text-4xl font-bold text-[#333] mb-6">
    Kamaru Challenge
  </h1>
  <p className="text-lg text-[#D57500] mb-6">
    Fanning the Flame of Values through Music & Culture
  </p>
  <hr className="border-t border-[#D57500] w-64 border-2 mx-auto mb-8" />

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Tile 1: Who we are */}
    <Link
      to="/about_us"
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center"
    >
      <FaUsers className="text-[#D57500] text-5xl mb-4" />
      <h2 className="text-2xl font-bold text-[#333] mb-4 group-hover:text-[#D57500] transition-colors duration-300">
        Who we are?
      </h2>
      <p className="text-gray-700">
        We are a community-driven initiative dedicated to promoting the Kikuyu
        language and culture through music and arts. Our mission is to inspire
        and empower individuals to embrace their heritage while fostering a
        sense of belonging and pride.
      </p>
    </Link>

    {/* Tile 2: What we do */}
    <Link
      to="/about_us"
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center"
    >
      <FaMusic className="text-[#D57500] text-5xl mb-4" />
      <h2 className="text-2xl font-bold text-[#333] mb-4 group-hover:text-[#D57500] transition-colors duration-300">
        What we do?
      </h2>
      <p className="text-gray-700">
        We organize the Kamaru Challenge, an annual musical competition that
        brings together talented individuals from the Kikuyu community. This
        event serves as a platform for participants to showcase their musical
        abilities while celebrating the rich cultural heritage of the Kikuyu
        people.
      </p>
    </Link>

    {/* Tile 3: Why we do it */}
    <Link
      to="/about_us"
      className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center"
    >
      <FaHeart className="text-[#D57500] text-5xl mb-4" />
      <h2 className="text-2xl font-bold text-[#333] mb-4 group-hover:text-[#D57500] transition-colors duration-300">
        Why we do it?
      </h2>
      <p className="text-gray-700">
        We believe in the power of music and culture to unite people and
        promote understanding. By encouraging the use of the Kikuyu language
        and celebrating our traditions, we aim to strengthen our community
        bonds and inspire future generations to embrace their roots.
      </p>
    </Link>
  </div>
</section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-8">
        <Stats />
      </section>

      {/* Upcoming Events */}
      <section id="events" className="p-6">
        <h2 className="text-2xl text-center font-bold text-[#333] mb-4">Upcoming Events</h2>
        <p className="text-center text-[#D57500] mb-4">
          Join us for our upcoming events and be part of the Kamaru Challenge
          community!
        </p>
        <hr className="border-t border-[#D57500] w-64 border-2 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* About Us */}
<section className="bg-[#FFF7ED] p-6">
  <h2 className="text-3xl font-bold text-[#333] text-center mb-4">About Us</h2>
  <p className="text-center text-[#D57500] mb-4">
    Discover our mission and values.
  </p>
  <hr className="border-t border-[#333] w-64 border-2 mx-auto mb-8" />
  <div className="md:flex gap-6 items-center">
    {/* Image Section */}
    <div className="md:w-1/2 relative">
      {aboutImage ? (
        <div className="relative">
          <img
            src={aboutImage}
            alt="About Us"
            className="rounded-lg w-3/4 h-auto object-cover mx-auto"
          />
          {/* Text Overlay */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-[#D57500] bg-opacity-80 text-white px-4 py-2 rounded-t-md shadow-md">
            <p className="text-sm font-semibold">Paul Ndung'u Kioi</p>
            <p className="text-xs">Director, Kamaru Challenge</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
      )}
    </div>

    {/* Text Section */}
    <div className="md:w-1/2 px-4 text-center md:text-left">
      <h3 className="text-3xl font-bold text-[#333] mb-4">Fanning the Flame of Values</h3>
      <p className="text-gray-700 mb-4 leading-relaxed">
        The Kamaru Challenge is a community-driven initiative that aims to
        promote the Kikuyu language and culture through music and arts. We
        believe in the power of music to inspire and unite people, and we
        are committed to fostering a sense of belonging and pride within
        our community.
      </p>
      <p className="text-gray-700 mb-10 leading-relaxed">
        We believe that Africans have grown indifferent towards the unique values that established them as a dignified and happy community. 
        That indifference was hastened by the negative effects of false colonial ideologies that made many perceive their culture as uncivilized 
        and one to be ashamed of.
      </p>
      <Link
        to="/about_us"
        className="bg-[#D57500] text-white px-6 py-3 rounded-md shadow-md hover:bg-[#333] transition duration-300"
      >
        Read More
      </Link>
    </div>
  </div>
</section>

      {/* Gallery Section */}
<section id="gallery" className="p-6">
  <h2 className="text-3xl font-bold text-[#333] text-center mb-4">Our Journey</h2>
  <p className="text-center text-[#D57500] mb-4">
  Captured Moments in a Thousand Words since 2024...
  </p>
  <hr className="border-t border-[#D57500] w-64 border-2 mx-auto mb-8" />

  <div className="max-w-5xl mx-auto relative">
    {galleryImages.length > 0 ? (
      <Slider {...galleryCarouselSettings}>
        {galleryImages.map((image, index) => (
          <div key={index} className="px-2">
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <img
                src={image.image_url}
                alt={`Gallery ${index + 1}`}
                className="gallery-image w-full h-48 object-cover"
              />
            </div>
          </div>
        ))}
      </Slider>
    ) : (
      <p className="text-center text-gray-500">No images available.</p>
    )}
  </div>

  <div className="flex justify-center mt-12">
  <Link
      to="/gallery"
      className="flex items-center gap-2 bg-[#D57500] text-white px-6 py-2 rounded-md shadow-md hover:bg-[#333] transition duration-300"
    >
      More in Gallery
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
  
</section>

      {/* Videos Section */}
<section id="videos" className="p-6">
  <div className="w-full max-w-5xl mx-auto">
    {latestVideo ? (
      <MediaCard title={latestVideo.title} link="/videos">
        <iframe
          src={`https://www.youtube.com/embed/${latestVideo.youtube_id}`}
          title={latestVideo.title}
          className="w-full h-48 md:h-56"
          allowFullScreen
        ></iframe>
      </MediaCard>
    ) : (
      <p className="text-center text-gray-500">No video available.</p>
    )}
  </div>
</section>

      {/* Contact Us Section */}
      <section className="p-6 bg-[#FFF7ED]">
        <h2 className="text-3xl font-bold text-[#333] text-center mb-4">Contact Us</h2>
        <p className="text-center text-[#D57500] mb-4">
          Have questions or need more information?
        </p>
        <hr className="border-t border-[#333] w-64 border-2 mx-auto " />
        <div className="md:flex gap-6 items-center">
          <div className="md:w-1/3">
            {contactImage ? (
              <img
                src={contactImage}
                alt="Contact Us"
                className="rounded-lg w-4/5 h-auto object-cover justify-center mx-auto"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
          </div>
          <div className="md:w-2/3">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Floating Register Button */}
      <FloatingRegisterButton />
    </div>
  );
};

const FloatingRegisterButton = () => (
  <div className="fixed bottom-6 left-6 md:hidden z-50">
    <Link
      to="/register/participant"
      className="bg-[#D57500] text-white px-6 py-3 rounded-full shadow-lg bounce-animation hover:bg-[#333]"
    >
      Register Now
    </Link>
  </div>
);

export default HomePage;
