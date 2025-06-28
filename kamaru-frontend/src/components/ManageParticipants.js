import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchParticipants,
  adminRegisterParticipant,
  updateParticipant,
  deleteParticipant,
} from "../api";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaFilePdf, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ManageParticipants = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const categories = [
    "Poetry",
    "Folk Songs",
    "Original Songs",
    "Rendition",
  ];

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

  const handleCreateParticipant = (e) => {
    e.preventDefault();
    adminRegisterParticipant(newParticipant)
      .then(() => {
        alert("Participant registered successfully!");
        setNewParticipant({ name: "", email: "", phone: "", category: "" });
        fetchParticipants().then((response) => setParticipants(response.data));
      })
      .catch((error) => {
        alert("Error registering participant.");
        console.error(error);
      });
  };

  const handleUpdateParticipant = (e) => {
    e.preventDefault();
    updateParticipant(editingParticipant.id, editingParticipant)
      .then(() => {
        alert("Participant updated successfully!");
        setParticipants(participants.map((p) =>
          p.id === editingParticipant.id ? editingParticipant : p
        ));
        setShowEditModal(false);
      })
      .catch((error) => {
        alert("Error updating participant.");
        console.error(error);
      });
  };

  const handleDeleteParticipant = (id) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      deleteParticipant(id)
        .then(() => {
          alert("Participant deleted successfully!");
          setParticipants(participants.filter((p) => p.id !== id));
        })
        .catch((error) => {
          alert("Error deleting participant.");
          console.error(error);
        });
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(participants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    XLSX.writeFile(workbook, "Participants_List.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Participants List", 14, 10);
    const tableData = participants.map(p => [p.name, p.email, p.phone, p.category]);
    doc.autoTable({
      head: [["Name", "Email", "Phone", "Category"]],
      body: tableData,
    });
    doc.save("Participants_List.pdf");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold text-[#333] mb-4">Manage Participants</h2>

      {/* Export Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={exportToPDF} className="bg-[#D57500] text-white px-3 py-2 rounded-md flex items-center gap-2">
          <FaFilePdf /> PDF
        </button>
        <button onClick={exportToExcel} className="bg-[#333] text-white px-3 py-2 rounded-md flex items-center gap-2">
          <FaFileExcel /> Excel
        </button>
      </div>

      {/* Add Participant Form */}
      <form onSubmit={handleCreateParticipant} className="mb-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Name" value={newParticipant.name}
            onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
            required className="border border-gray-300 p-2 rounded-md w-full" />
          <input type="email" placeholder="Email" value={newParticipant.email}
            onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
            required className="border border-gray-300 p-2 rounded-md w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Phone" value={newParticipant.phone}
            onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
            required className="border border-gray-300 p-2 rounded-md w-full" />
          <select value={newParticipant.category}
            onChange={(e) => setNewParticipant({ ...newParticipant, category: e.target.value })}
            required className="border border-gray-300 p-2 rounded-md w-full">
            <option value="" disabled>Select Category</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-[#D57500] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#b65e00]">
          <FaPlus />
          <span>Add Participant</span>
        </button>
      </form>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-100 shadow-md rounded-lg">
          <thead className="bg-[#333] text-white">
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
              participants.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3 flex space-x-2">
                    <button onClick={() => { setEditingParticipant(p); setShowEditModal(true); }}
                      className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                    <button onClick={() => handleDeleteParticipant(p.id)}
                      className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-600">No participants registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Participant</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateParticipant} className="space-y-4">
              <input type="text" value={editingParticipant.name}
                onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                className="w-full p-2 border rounded-md" required />
              <input type="email" value={editingParticipant.email}
                onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                className="w-full p-2 border rounded-md" required />
              <input type="text" value={editingParticipant.phone}
                onChange={(e) => setEditingParticipant({ ...editingParticipant, phone: e.target.value })}
                className="w-full p-2 border rounded-md" required />
              <select value={editingParticipant.category}
                onChange={(e) => setEditingParticipant({ ...editingParticipant, category: e.target.value })}
                className="w-full p-2 border rounded-md" required>
                <option value="" disabled>Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-[#D57500] text-white py-2 rounded-md">Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParticipants;
