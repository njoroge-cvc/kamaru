import React, { useState, useEffect } from "react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from "../api";
import { FaTrash, FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import LexicalEditor from "../components/LexicalEditor";

const ManageEvent = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    details: "",
    date_time: "",
    location: "",
    status: "upcoming",
    registration_required: false,
    registration_link: "",
    cost: "Free",
    map_link: "",
    image: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetchEvents("all");
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to load events.");
      console.error("Error fetching events:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDetailsChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      details: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined
      ){
        data.append(key, value);
      }
    });

    try {
      if (editMode) {
        await updateEvent(editEventId, data);
        toast.success("Event updated successfully!");
      } else {
        await createEvent(data);
        toast.success("Event created successfully!");
      }

      // Reset form after successful save
      setFormData({
        title: "",
        theme: "",
        details: "",
        date_time: "",
        location: "",
        status: "upcoming",
        registration_required: false,
        registration_link: "",
        cost: "Free",
        map_link: "",
        image: null,
      });

      setShowForm(false);
      loadEvents();

    } catch (error) {
      toast.error("Failed to save event.");
      console.error("Error saving event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id);
      setEvents(events.filter((event) => event.id !== id));
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  };

  // Edit event handler - populates form with existing data and opens it in edit mode
  const handleEdit = (event) => {
    setEditMode(true); // Enable edit mode
    setEditEventId(event.id); // Store the ID of the event being edited

    // Format date_time for input field (YYYY-MM-DDTHH:MM) and handle null case gracefully
    const formattedDateTime = event.date_time // Check if date_time exists before formatting
    ? event.date_time.slice(0, 16) // Backend stores naive local time; use it as-is (toISOString would shift it to UTC)
    : ""; // If date_time is null or undefined, set it to an empty string to avoid errors
    
    // Populate form data with existing event details
    setFormData({
      title: event.title,
      theme: event.theme,
      details: event.details,
      date_time: formattedDateTime,
      location: event.location,
      status: event.status || "upcoming", // Default to "upcoming" if status is missing
      registration_required: event.registration_required || false, // Default to false if missing
      registration_link: event.registration_link || "",
      cost: event.cost || "Free", // Default to "Free" if cost is missing
      map_link: event.map_link || "",
      image: null,
    });


    setShowForm(true); // Open the form modal after populating it with data
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="k-h2">Manage Events</h2>
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({
              title: "",
              theme: "",
              details: "",
              date_time: "",
              location: "",
              status: "upcoming",
              registration_required: false,
              registration_link: "",
              cost: "Free",
              map_link: "",
              image: null,
            });
            setShowForm(true);
          }}
          className="k-btn-primary w-full sm:w-auto"
        >
          <FaPlus /> <span>Create Event</span>
        </button>
      </div>

      <div className="relative w-full mt-4">
        <div className="k-table-wrap bg-white">
          <table className="k-table min-w-[900px]">
            <thead >
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Theme</th>
                <th className="p-2 text-left">Details</th>
                <th className="p-2 text-left">Date & Time</th>
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Cost</th>
                <th className="p-2 text-left">Registration</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isExpanded = expandedRows[event.id];
                const plainDetails = event.details.replace(/<[^>]+>/g, "");
                const preview = plainDetails.length > 60 ? plainDetails.slice(0, 60) + "..." : plainDetails;
                return (
                  <tr key={event.id} className="border-b">
                    <td className="p-2 break-words whitespace-normal text-xs sm:text-sm">{event.title}</td>
                    <td className="p-2 break-words whitespace-normal text-xs sm:text-sm">{event.theme}</td>
                    <td className="p-2 max-w-[120px] break-words whitespace-normal text-xs sm:text-sm">
                      {isExpanded ? (
                        <>
                          <div className="whitespace-pre-line">{event.details}</div>
                          <button
                            className="text-ochre text-xs font-semibold underline mt-1"
                            onClick={() => toggleExpand(event.id)}
                          >
                            Show less
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{preview}</span>
                          {plainDetails.length > 60 && (
                            <button
                              className="text-ochre text-xs font-semibold underline ml-1"
                              onClick={() => toggleExpand(event.id)}
                            >
                              Show more
                            </button>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-2 break-words whitespace-normal text-xs sm:text-sm">
                      {new Date(event.date_time).toLocaleString()}
                    </td>
                    <td className="p-2 break-words whitespace-normal text-xs sm:text-sm">{event.location}</td>

                    {/* Event status with color coding */}
                    <td className="p-2 break-words whitespace-normal text-xs sm:text-sm">

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          event.status === "upcoming"
                            ? "bg-bead-green/15 text-bead-green"
                            : event.status === "past"
                            ? "bg-earth/10 text-earth"
                            : "bg-bead-red/10 text-bead-red"
                        }`}
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>

                    {/* Event Cost */}
                    <td className="p-2 text-xs sm:text-sm">
                      {event.cost || "Free"}
                    </td>

                    {/* Registration Status */}
                    <td className="p-2 text-xs sm:text-sm">
                      {event.registration_required
                        ? "Required"
                        : "Not Required"}
                    </td>

                    <td className="p-2">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-2 flex flex-col md:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="k-btn-outline k-btn-sm"
                      >
                        <FaEdit /> <span className="hidden md:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="k-btn-ghost k-btn-sm hover:!text-bead-red"
                      >
                        <FaTrash /> <span className="hidden md:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-earth">
                {editMode ? "Edit Event" : "Create Event"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="k-icon-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Event Title"
                required
                className="k-input"
              />
              <input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="Event Theme"
                required
                className="k-input"
              />
              <div>
                <label className="k-label">Details</label>
                <div className="k-input">
                  <LexicalEditor
                    initialContent={formData.details}
                    onChange={handleDetailsChange}
                  />
                </div>
              </div>
              <input
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                required
                className="k-input"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event Location"
                required
                className="k-input"
              />

              {/* Event Status */}
              <div>
                <label className="k-label">
                  Event Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="k-input"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Event Cost */}
              <div>
                <label className="k-label">
                  Event Cost
                </label>

                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="Free, KES 500, Donation Based..."
                  className="k-input"
                />
              </div>

              {/* Registration Required */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="registration_required"
                  checked={formData.registration_required}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      registration_required: e.target.checked,
                    }))
                  }
                />
                
                <label className="k-label !mb-0">
                    Registration Required
                </label>
              </div>

              {formData.registration_required && (
                <div>
                  <label className="k-label">
                    Registration Link
                  </label>
                  <input
                    type="text"
                    name="registration_link"
                    value={formData.registration_link}
                    onChange={handleChange}
                    placeholder="https://example.com/registration"
                    className="k-input"
                  />
                </div>
              )}

              {/* Map Link */}
              <div>
                <label className="k-label">
                  Map Link (Google Maps URL)
                </label>

                <input
                  type="text"
                  name="map_link"
                  value={formData.map_link}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=location"
                  className="k-input"
                />
              </div>

              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="k-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="k-btn-primary w-full"
              >
                {loading ? "Processing..." : editMode ? "Update Event" : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
