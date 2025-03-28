import React, { useState, useEffect } from "react";
import { fetchEvents, createEvent, deleteEvent, updateEvent } from "../api";
import { FaTrash, FaPlus, FaTimes, FaEdit } from "react-icons/fa";

const ManageEvent = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    fetchEvents()
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    if (editMode) {
      updateEvent(editEventId, data)
        .then(() => {
          alert("Event updated successfully!");
          setShowForm(false);
          fetchEvents().then((response) => setEvents(response.data));
        })
        .catch((error) => console.error("Error updating event:", error));
    } else {
      createEvent(data)
        .then(() => {
          alert("Event created successfully!");
          setShowForm(false);
          fetchEvents().then((response) => setEvents(response.data));
        })
        .catch((error) => console.error("Error creating event:", error));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent(id)
        .then(() => {
          alert("Event deleted successfully!");
          setEvents(events.filter((event) => event.id !== id));
        })
        .catch((error) => console.error("Error deleting event:", error));
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

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-[#8F3B1B] mb-4">Manage Events</h2>

      {/* Create Event Button */}
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
        className="bg-[#D57500] text-white px-4 py-2 rounded-md flex items-center space-x-2 mb-4 hover:bg-[#8F3B1B] transition"
      >
        <FaPlus />
        <span>Create Event</span>
      </button>

      {/* Event Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-md">
          <thead className="bg-[#D57500] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Theme</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Date & Time</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b">
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.theme}</td>
                <td className="px-4 py-2">{event.details}</td>
                <td className="px-4 py-2">{new Date(event.date_time).toLocaleString()}</td>
                <td className="px-4 py-2">{event.location}</td>
                <td className="px-4 py-2">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="bg-[#8F3B1B] hover:bg-[#D57500] text-white px-3 py-1 rounded-md transition-all flex items-center space-x-1"
                  >
                    <FaEdit />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-600 hover:bg-[#B22222] text-white px-3 py-1 rounded-md transition-all flex items-center space-x-1"
                  >
                    <FaTrash />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Event Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#8F3B1B]">
                {editMode ? "Edit Event" : "Create Event"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="theme"
                placeholder="Theme"
                value={formData.theme}
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={handleChange}
                required
              />
              <textarea
                name="details"
                placeholder="Details"
                value={formData.details}
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={handleChange}
                required
              />
              <input
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={handleChange}
                required
              />
              <input
                type="file"
                name="image"
                className="w-full border border-gray-300 p-2 rounded-md"
                onChange={handleChange}
              />
              <button type="submit" className="w-full bg-[#D57500] hover:bg-[#8F3B1B] text-white py-2 rounded-md">
                {editMode ? "Update Event" : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvent;
