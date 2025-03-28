import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchParticipants,
  adminRegisterParticipant,
  updateParticipant,
  deleteParticipant,
} from "../api";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const ManageParticipants = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]); // State to store participants
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  }); // State for new participant form
  const [editingParticipant, setEditingParticipant] = useState(null); // State for participant being edited
  const [showEditModal, setShowEditModal] = useState(false); // State to toggle edit modal visibility

  // Categories for participants
  const categories = [
    "Poetry",
    "Folk Songs",
    "Original Songs",
    "Rendition",
    "Use of African Proverbs in Spoken Word",
  ];

  // Fetch participants when the component loads
  useEffect(() => {
    if (!isAdmin) {
      alert("Unauthorized access.");
      navigate("/");
    } else {
      fetchParticipants()
        .then((response) => setParticipants(response.data))
        .catch((error) => console.error("Error fetching participants:", error));
    }
  }, [isAdmin, navigate]);

  // Handle form submission for creating a new participant
  const handleCreateParticipant = (e) => {
    e.preventDefault();
    adminRegisterParticipant(newParticipant)
      .then(() => {
        alert("Participant registered successfully!");
        setNewParticipant({ name: "", email: "", phone: "", category: "" }); // Reset form
        fetchParticipants().then((response) => setParticipants(response.data)); // Refresh participants list
      })
      .catch((error) => {
        alert("Error registering participant.");
        console.error(error);
      });
  };

  // Handle form submission for updating an existing participant
  const handleUpdateParticipant = (e) => {
    e.preventDefault();
    updateParticipant(editingParticipant.id, editingParticipant)
      .then(() => {
        alert("Participant updated successfully!");
        setParticipants(
          participants.map((p) =>
            p.id === editingParticipant.id ? editingParticipant : p
          )
        ); // Update participant in the list
        setShowEditModal(false); // Close modal
      })
      .catch((error) => {
        alert("Error updating participant.");
        console.error(error);
      });
  };

  // Handle deleting a participant
  const handleDeleteParticipant = (participantId) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      deleteParticipant(participantId)
        .then(() => {
          alert("Participant deleted successfully!");
          setParticipants(participants.filter((p) => p.id !== participantId)); // Remove participant from the list
        })
        .catch((error) => {
          alert("Error deleting participant.");
          console.error(error);
        });
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      {/* Page Title */}
      <h2 className="text-2xl font-semibold text-[#8F3B1B] mb-4">
        Manage Participants
      </h2>

      {/* Add Participant Form */}
      <form onSubmit={handleCreateParticipant} className="mb-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Name"
            value={newParticipant.name}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, name: e.target.value })
            }
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          />
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={newParticipant.email}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, email: e.target.value })
            }
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Phone Input */}
          <input
            type="text"
            placeholder="Phone"
            value={newParticipant.phone}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, phone: e.target.value })
            }
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          />
          {/* Category Dropdown */}
          <select
            value={newParticipant.category}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, category: e.target.value })
            }
            required
            className="border border-gray-300 p-2 rounded-md w-full"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#D57500] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#b65e00]"
        >
          <FaPlus />
          <span>Add Participant</span>
        </button>
      </form>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-100 shadow-md rounded-lg">
          <thead className="bg-[#8F3B1B] text-white">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Category</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length > 0 ? (
              participants.map((participant) => (
                <tr key={participant.id} className="border-t">
                  <td className="p-3">{participant.name}</td>
                  <td className="p-3">{participant.email}</td>
                  <td className="p-3">{participant.phone}</td>
                  <td className="p-3">{participant.category}</td>
                  <td className="p-3 flex space-x-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditingParticipant(participant);
                        setShowEditModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteParticipant(participant.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-600">
                  No participants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Participant Modal */}
      {showEditModal && editingParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Participant</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateParticipant} className="space-y-4">
              {/* Name Input */}
              <input
                type="text"
                value={editingParticipant.name}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    name: e.target.value,
                  })
                }
                placeholder="Name"
                className="w-full p-2 border rounded-md"
                required
              />
              {/* Email Input */}
              <input
                type="email"
                value={editingParticipant.email}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    email: e.target.value,
                  })
                }
                placeholder="Email"
                className="w-full p-2 border rounded-md"
                required
              />
              {/* Phone Input */}
              <input
                type="text"
                value={editingParticipant.phone}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone"
                className="w-full p-2 border rounded-md"
                required
              />
              {/* Category Dropdown */}
              <select
                value={editingParticipant.category}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    category: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#D57500] text-white py-2 rounded-md"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParticipants;