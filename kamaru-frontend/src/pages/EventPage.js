import React, { useEffect, useState } from "react";
import { cld } from "../utils/cloudinary";
import { useParams, Link } from "react-router-dom";
import { fetchEvent, eventCalendarUrl } from "../api";
import { timingOf, statusOf } from "../utils/events";

import { useNavigate } from "react-router-dom";
import ReadMore from "../components/ReadMore";
import { useSeo, SITE } from "../utils/seo";

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

  useSeo({
    title: event?.title,
    description: event ? `${event.theme ? event.theme + ". " : ""}${event.location}, ${new Date(event.date_time).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}. ${String(event.details || "").slice(0, 110)}` : undefined,
    path: `/events/${id}`,
    image: event?.image_url,
    jsonLd: event && {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.theme || event.details,
      startDate: event.date_time,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      image: event.image_url,
      location: { "@type": "Place", name: event.location, address: { "@type": "PostalAddress", addressLocality: event.location, addressCountry: "KE" } },
      organizer: { "@id": `${SITE}/#organization` },
      isAccessibleForFree: /free/i.test(event.cost || "Free"),
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-ochre-dark border-opacity-75"></div>
      </div>
    );
  }

  if (!event) return <p className="text-center text-bead-red">Event not found.</p>;

  // Upcoming/past from the server (Kenyan time); postponed/cancelled override it
  const shownStatus = statusOf(event) !== "scheduled" ? statusOf(event) : timingOf(event);
  const STATUS_LABEL = { upcoming: "Upcoming", past: "Past", postponed: "Postponed", cancelled: "Cancelled" };

  const formattedDate = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.date_time));

return (
  <div className="bg-cream min-h-screen">
    
    {/* Hero Section */}
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <img
        src={event.image_url ? cld(event.image_url, 1920) : "/og-image.jpg"}
        alt={event.title}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-10 text-white">
        
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`inline-block px-4 py-2 text-sm font-semibold k-quad-shape ${
              shownStatus === "upcoming"
                ? "bg-bead-green text-cream"
                : shownStatus === "past"
                ? "bg-earth-600 text-cream"
                : shownStatus === "postponed"
                ? "bg-bead-gold text-earth"
                : "bg-bead-red text-cream"
            }`}
          >
            {STATUS_LABEL[shownStatus]}
          </span>
          {event.kind_label && <span className="inline-block k-quad-shape bg-kamaru px-4 py-2 text-sm font-semibold text-earth">{event.kind_label}</span>}
          {event.season && <span className="inline-block k-quad-shape bg-cream/20 px-4 py-2 text-sm font-semibold text-cream">{event.season}</span>}
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-black mb-4">
          {event.title}
        </h1>

        <p className="text-lg md:text-xl opacity-90">
          {formattedDate}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {event.registration_required && event.registration_link && shownStatus === "upcoming" && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-kamaru hover:bg-kamaru-light text-earth px-8 py-4 k-quad font-semibold transition-all"
            >
              Register Now
            </a>
          )}
          {/* Calendar file comes from the newer API (which also sends `timing`) */}
          {shownStatus === "upcoming" && event.timing && (
            <a href={eventCalendarUrl(event.id)} className="inline-block bg-cream/15 hover:bg-cream hover:text-earth text-cream px-6 py-4 k-quad font-semibold transition-all">
              Add to calendar
            </a>
          )}
        </div>
      </div>
    </div>

    {/* Breadcrumb */}
    <div className="max-w-7xl mx-auto px-6 py-6">
      <nav className="text-sm text-earth-600">
        <Link to="/" className="hover:text-kamaru">
          Home
        </Link>
        {" / "}
        <Link to="/#events" className="hover:text-kamaru">
          Events
        </Link>
        {" / "}
        <span className="text-earth">{event.title}</span>
      </nav>
    </div>

    {/* Content */}
    <div className="max-w-7xl mx-auto px-6 pb-16">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2">

          {/* Theme */}
          {event.theme && (
            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-earth/5 p-8 mb-8">
              <h2 className="text-sm uppercase tracking-widest text-kamaru font-semibold mb-3">
                Theme
              </h2>

              <h3 className="text-2xl md:text-3xl font-bold text-earth">
                {event.theme}
              </h3>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-3xl shadow-sm ring-1 ring-earth/5 p-8">
            <h2 className="text-2xl font-bold text-earth mb-6">
              About This Event
            </h2>

            <ReadMore collapsedHeight={220}>
              <p className="text-earth-700 leading-8 whitespace-pre-line">
                {event.details}
              </p>
            </ReadMore>
          </div>

        </div>

        {/* Sidebar */}
        <div>

          <div className="bg-white rounded-3xl shadow-sm ring-1 ring-earth/5 p-6 sticky top-24">

            <h3 className="text-xl font-bold text-earth mb-6">
              Event Information
            </h3>

            <div className="space-y-5">

              <div>
                <p className="text-sm text-earth-600 uppercase">
                  Date & Time
                </p>
                <p className="font-medium text-earth">
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-earth-600 uppercase">
                  Location
                </p>
                <p className="font-medium text-earth">
                  {event.location}
                </p>

                {event.map_link && (
                  <a
                    href={event.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-kamaru hover:underline"
                  >
                    View on Map →
                  </a>
                )}
              </div>

              <div>
                <p className="text-sm text-earth-600 uppercase">
                  Cost
                </p>

                <p className="font-medium text-earth">
                  {event.cost || "Free"}
                </p>
              </div>

              <div>
                <p className="text-sm text-earth-600 uppercase">
                  Status
                </p>

                <p className="font-medium text-earth">
                  {STATUS_LABEL[shownStatus]}
                </p>
              </div>

            </div>

            {event.registration_required &&
              event.registration_link && (
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center mt-8 bg-kamaru hover:bg-kamaru-light text-earth py-4 k-quad font-semibold transition"
                >
                  Register Now
                </a>
              )}
          </div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 bg-white rounded-3xl shadow-sm ring-1 ring-earth/5 p-10 text-center">

        <h2 className="text-3xl font-bold text-earth mb-4">
          Join Us For This Experience
        </h2>

        <p className="text-earth-600 max-w-2xl mx-auto mb-6">
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
                className="k-btn-primary px-8 py-4"
              >
                Register Now
              </a>
            )}

          <button
            onClick={() => navigate(-1)}
            className="k-btn-dark px-8 py-4"
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
