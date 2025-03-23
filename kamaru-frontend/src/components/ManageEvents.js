import React, { useEffect, useState } from "react";
import { fetchEvents, createEvent, updateEvent, deleteEvent } from "../api";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    mission: "",
    categories: "",
  });
  const [editingEvent, setEditingEvent] = useState(null); // For editing an event
  const [loading, setLoading] = useState(true);

  // Fetch all events on component mount
  useEffect(() => {
    fetchEvents()
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, []);

  // Handle creating a new event
  const handleCreateEvent = (e) => {
    e.preventDefault();
    createEvent(newEvent)
      .then((response) => {
        alert("Event created successfully!");
        setEvents([...events, response.data.event]); // Add the new event to the list
        setNewEvent({ name: "", date: "", location: "", mission: "", categories: "" }); // Reset form
      })
      .catch((error) => console.error("Error creating event:", error));
  };

  // Handle updating an event
  const handleUpdateEvent = (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    updateEvent(editingEvent.id, editingEvent)
      .then((response) => {
        alert("Event updated successfully!");
        setEvents(
          events.map((event) =>
            event.id === editingEvent.id ? response.data.event : event
          )
        );
        setEditingEvent(null); // Exit edit mode
      })
      .catch((error) => console.error("Error updating event:", error));
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    deleteEvent(eventId)
      .then(() => {
        alert("Event deleted successfully!");
        setEvents(events.filter((event) => event.id !== eventId)); // Remove the deleted event
      })
      .catch((error) => console.error("Error deleting event:", error));
  };

  if (loading) {
    return <p>Loading events...</p>;
  }

  return (
    <div>
      <h2>Manage Events</h2>

      {/* Create Event Form */}
      <form onSubmit={handleCreateEvent}>
        <h3>Create Event</h3>
        <input
          type="text"
          placeholder="Event Name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          required
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          required
        />
        <textarea
          placeholder="Mission"
          value={newEvent.mission}
          onChange={(e) => setNewEvent({ ...newEvent, mission: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Categories (comma-separated)"
          value={newEvent.categories}
          onChange={(e) => setNewEvent({ ...newEvent, categories: e.target.value })}
          required
        />
        <button type="submit">Create Event</button>
      </form>

      {/* Edit Event Form */}
      {editingEvent && (
        <form onSubmit={handleUpdateEvent}>
          <h3>Edit Event</h3>
          <input
            type="text"
            placeholder="Event Name"
            value={editingEvent.name}
            onChange={(e) =>
              setEditingEvent({ ...editingEvent, name: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={editingEvent.date}
            onChange={(e) =>
              setEditingEvent({ ...editingEvent, date: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={editingEvent.location}
            onChange={(e) =>
              setEditingEvent({ ...editingEvent, location: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Mission"
            value={editingEvent.mission}
            onChange={(e) =>
              setEditingEvent({ ...editingEvent, mission: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Categories (comma-separated)"
            value={editingEvent.categories}
            onChange={(e) =>
              setEditingEvent({ ...editingEvent, categories: e.target.value })
            }
            required
          />
          <button type="submit">Update Event</button>
          <button type="button" onClick={() => setEditingEvent(null)}>
            Cancel
          </button>
        </form>
      )}

      {/* List of Events */}
      <h3>Existing Events</h3>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.name}</strong> - {event.date} - {event.location}
            <button onClick={() => setEditingEvent(event)}>Edit</button>
            <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageEvents;