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
      const response = await fetchEvents();
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
      data.append(key, value);
    });

    try {
      if (editMode) {
        await updateEvent(editEventId, data);
        toast.success("Event updated successfully!");
      } else {
        await createEvent(data);
        toast.success("Event created successfully!");
      }
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

  const handleEdit = (event) => {
    setEditMode(true);
    setEditEventId(event.id);
    setFormData({
      title: event.title,
      theme: event.theme,
      details: event.details,
      date_time: event.date_time,
      location: event.location,
      image: null,
    });
    setShowForm(true);
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-0 md:p-6 bg-white rounded-md shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="text-xl md:text-2xl font-semibold text-[#333]">Manage Events</h2>
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({
              title: "",
              theme: "",
              details: "",
              date_time: "",
              location: "",
              image: null,
            });
            setShowForm(true);
          }}
          className="bg-[#D57500] text-white px-3 py-2 rounded hover:bg-[#333] flex items-center gap-2 w-full sm:w-auto"
        >
          <FaPlus /> <span>Create Event</span>
        </button>
      </div>

      <div className="relative w-full mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border border-gray-200 rounded-md">
            <thead className="bg-[#D57500] text-white">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Theme</th>
                <th className="p-2 text-left">Details</th>
                <th className="p-2 text-left">Date & Time</th>
                <th className="p-2 text-left">Location</th>
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
                          <div dangerouslySetInnerHTML={{ __html: event.details }} />
                          <button
                            className="text-[#D57500] text-xs underline mt-1"
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
                              className="text-[#D57500] text-xs underline ml-1"
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
                        className="bg-[#D57500] text-white px-3 py-1 rounded hover:bg-[#c26a00] flex items-center gap-1 justify-center"
                      >
                        <FaEdit /> <span className="hidden md:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-[#333] text-white px-3 py-1 rounded hover:bg-[#222] flex items-center gap-1 justify-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[500px] p-6 rounded-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#8F3B1B]">
                {editMode ? "Edit Event" : "Create Event"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#333] hover:text-[#D57500]"
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
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#D57500]"
              />
              <input
                type="text"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="Event Theme"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#D57500]"
              />
              <div>
                <label className="block text-sm mb-1 font-medium">Details</label>
                <div className="w-full border rounded p-2">
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
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#D57500]"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event Location"
                required
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#D57500]"
              />
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#D57500]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D57500] text-white py-2 rounded hover:bg-[#333] transition"
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
