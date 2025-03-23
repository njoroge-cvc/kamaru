import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchParticipants,
  registerParticipant,
  updateParticipant,
  deleteParticipant,
} from "../api";

const ManageParticipants = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [editingParticipant, setEditingParticipant] = useState(null); // For editing a participant
  const [loading, setLoading] = useState(true);

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  // Fetch all participants on component mount (admin-only)
  useEffect(() => {
    if (isAdmin) {
      fetchParticipants()
        .then((response) => {
          console.log("Participants fetched successfully:", response.data);
          setParticipants(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching participants:", error);
          setLoading(false);
        });
    }
  }, [isAdmin]);

  // Handle creating a new participant
  const handleCreateParticipant = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
  
    registerParticipant(newParticipant) // Call the API to register the participant
      .then(() => {
        alert("Participant registered successfully!"); // Notify the admin
        setNewParticipant({ name: "", email: "", phone: "", category: "" }); // Reset the form
      })
      .catch((error) => console.error("Error creating participant:", error)); // Log any errors
  };


  // Handle updating a participant
  const handleUpdateParticipant = (e) => {
    e.preventDefault();

    updateParticipant(editingParticipant.id, editingParticipant)
      .then((response) => {
        alert("Participant updated successfully!");
        setParticipants(
          participants.map((participant) =>
            participant.id === editingParticipant.id
              ? response.data.participant
              : participant
          )
        );
        setEditingParticipant(null); // Exit edit mode
      })
      .catch((error) => console.error("Error updating participant:", error));
  };

  // Handle deleting a participant (admin-only)
  const handleDeleteParticipant = (participantId) => {
    deleteParticipant(participantId)
      .then(() => {
        alert("Participant deleted successfully!");
        setParticipants(
          participants.filter((participant) => participant.id !== participantId)
        );
      })
      .catch((error) => console.error("Error deleting participant:", error));
  };

  if (loading && isAdmin) {
    return <p>Loading participants...</p>;
  }

  return (
    <div>
      <h2>{isAdmin ? "Manage Participants" : "Register Participant on Behalf"}</h2>

      {/* Create Participant Form */}
{isAdmin && (
  <form onSubmit={handleCreateParticipant}>
    <h3>Register Participant on Behalf</h3>
    <input
      type="text"
      placeholder="Name"
      value={newParticipant.name}
      onChange={(e) =>
        setNewParticipant({ ...newParticipant, name: e.target.value })
      }
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={newParticipant.email}
      onChange={(e) =>
        setNewParticipant({ ...newParticipant, email: e.target.value })
      }
      required
    />
    <input
      type="text"
      placeholder="Phone"
      value={newParticipant.phone}
      onChange={(e) =>
        setNewParticipant({ ...newParticipant, phone: e.target.value })
      }
      required
    />
    <input
      type="text"
      placeholder="Category"
      value={newParticipant.category}
      onChange={(e) =>
        setNewParticipant({ ...newParticipant, category: e.target.value })
      }
      required
    />
    <button type="submit">Register</button>
  </form>
)}
      
      {/* Admin-only: List of Participants */}
      {isAdmin && (
        <>
          <h3>Existing Participants</h3>
          <ul>
            {participants.map((participant) => (
              <li key={participant.id}>
                <strong>{participant.name}</strong> - {participant.email} -{" "}
                {participant.phone} - {participant.category}
                <button onClick={() => setEditingParticipant(participant)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteParticipant(participant.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Edit Participant Form */}
      {editingParticipant && (
        <form onSubmit={handleUpdateParticipant}>
          <h3>Edit Participant</h3>
          <input
            type="text"
            placeholder="Name"
            value={editingParticipant.name}
            onChange={(e) =>
              setEditingParticipant({
                ...editingParticipant,
                name: e.target.value,
              })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={editingParticipant.email}
            onChange={(e) =>
              setEditingParticipant({
                ...editingParticipant,
                email: e.target.value,
              })
            }
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={editingParticipant.phone}
            onChange={(e) =>
              setEditingParticipant({
                ...editingParticipant,
                phone: e.target.value,
              })
            }
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={editingParticipant.category}
            onChange={(e) =>
              setEditingParticipant({
                ...editingParticipant,
                category: e.target.value,
              })
            }
            required
          />
          <button type="submit">Update Participant</button>
          <button type="button" onClick={() => setEditingParticipant(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default ManageParticipants;