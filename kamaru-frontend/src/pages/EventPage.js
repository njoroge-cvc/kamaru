import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchEvent } from "../api";

import { useNavigate } from "react-router-dom";

const EventPage = () => {

  const navigate = useNavigate();

  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent(id)
      .then((response) => {
        setEvent(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching event:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#8F3B1B] border-opacity-75"></div>
      </div>
    );
  }

  if (!event) return <p className="text-center text-red-500">Event not found.</p>;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.date_time));

return (
  <div className="bg-[#F8F8F8] min-h-screen">
    
    {/* Hero Section */}
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <img
        src={event.image_url}
        alt={event.title}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10 text-white">
        
        <span
          className={`inline-block px-4 py-2 text-sm font-semibold rounded-full mb-4 ${
            event.status === "upcoming"
              ? "bg-green-500 text-white"
              : event.status === "past"
              ? "bg-gray-700 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
        </span>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {event.title}
        </h1>

        <p className="text-lg md:text-xl opacity-90">
          {formattedDate}
        </p>

        {event.registration_required && event.registration_link && (
          <a
            href={event.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 bg-[#D57500] hover:bg-[#b86500] text-white px-8 py-4 rounded-xl font-semibold transition-all"
          >
            Register Now
          </a>
        )}
      </div>
    </div>

    {/* Breadcrumb */}
    <div className="max-w-7xl mx-auto px-6 py-6">
      <nav className="text-sm text-gray-600">
        <Link to="/" className="hover:text-[#D57500]">
          Home
        </Link>
        {" / "}
        <Link to="/#events" className="hover:text-[#D57500]">
          Events
        </Link>
        {" / "}
        <span className="text-gray-800">{event.title}</span>
      </nav>
    </div>

    {/* Content */}
    <div className="max-w-7xl mx-auto px-6 pb-16">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2">

          {/* Theme */}
          {event.theme && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h2 className="text-sm uppercase tracking-widest text-[#D57500] font-semibold mb-3">
                Theme
              </h2>

              <h3 className="text-2xl md:text-3xl font-bold text-[#333]">
                {event.theme}
              </h3>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#333] mb-6">
              About This Event
            </h2>

            <p className="text-gray-700 leading-8 whitespace-pre-line">
              {event.details}
            </p>
          </div>

        </div>

        {/* Sidebar */}
        <div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">

            <h3 className="text-xl font-bold text-[#333] mb-6">
              Event Information
            </h3>

            <div className="space-y-5">

              <div>
                <p className="text-sm text-gray-500 uppercase">
                  Date & Time
                </p>
                <p className="font-medium text-[#333]">
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase">
                  Location
                </p>
                <p className="font-medium text-[#333]">
                  {event.location}
                </p>

                {event.map_link && (
                  <a
                    href={event.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-[#D57500] hover:underline"
                  >
                    View on Map →
                  </a>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase">
                  Cost
                </p>

                <p className="font-medium text-[#333]">
                  {event.cost || "Free"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 uppercase">
                  Status
                </p>

                <p className="font-medium text-[#333] capitalize">
                  {event.status}
                </p>
              </div>

            </div>

            {event.registration_required &&
              event.registration_link && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center mt-8 bg-[#D57500] hover:bg-[#b86500] text-white py-4 rounded-xl font-semibold transition"
                >
                  Register Now
                </a>
              )}
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 bg-white rounded-2xl shadow-sm p-10 text-center">

        <h2 className="text-3xl font-bold text-[#333] mb-4">
          Join Us For This Experience
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Be part of a meaningful community gathering that celebrates
          creativity, culture, learning and connection.
        </p>

        <div className="flex flex-wrap justify-center gap-4">

          {event.registration_required &&
            event.registration_link && (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D57500] text-white px-8 py-4 rounded-xl hover:bg-[#b86500] transition"
              >
                Register Now
              </a>
            )}

          <button
            onClick={() => navigate(-1)}
            className="bg-[#333] text-white px-8 py-4 rounded-xl hover:opacity-90 transition"
          >
            ← Back to Events
          </button>

        </div>
      </div>

    </div>
  </div>
);
};

export default EventPage;
