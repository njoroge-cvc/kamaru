import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchParticipants,
  adminRegisterParticipant,
  updateParticipant,
  deleteParticipant,
  fetchSeasons,
} from "../api";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const ManageParticipants = ({ isAdmin }) => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
  });
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Predefined categories for dropdown selection when adding/editing participants
  const categories = [
    "Poetry",
    "Folk Songs and Dances",
    "Original Songs",
  ];

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Unauthorized access.");
      navigate("/");
    } else {
      fetchParticipants()
        .then((response) => setParticipants(response.data))
        .catch((error) => 
          console.error("Error fetching participants:", error)
      );

      fetchSeasons()
        .then((response) => setSeasons(response.data))
        .catch((error) => 
          console.error("Error fetching seasons:", error)
      );
    }
  }, [isAdmin, navigate]);

  const handleSeasonFilter = (seasonId) => {

    setSelectedSeason(seasonId);

    fetchParticipants(seasonId)
      .then((response) => {
        setParticipants(response.data);
      })
      .catch((error) => {
        console.error("Error filtering participants:", error);
      });
  };

  const handleCreateParticipant = (e) => {
    e.preventDefault();
    adminRegisterParticipant(newParticipant)
      .then(() => {
        toast.success("Participant registered successfully!");
        setNewParticipant({ name: "", email: "", phone: "", category: "" });
        fetchParticipants().then((res) => setParticipants(res.data));
      })
      .catch((error) => {
        toast.error("Error registering participant.");
        console.error(error);
      });
  };

  const handleUpdateParticipant = (e) => {
    e.preventDefault();
    updateParticipant(editingParticipant.id, editingParticipant)
      .then(() => {
        toast.success("Participant updated successfully!");
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === editingParticipant.id ? editingParticipant : p
          )
        );
        setShowEditModal(false);
      })
      .catch((error) => {
        toast.error("Error updating participant.");
        console.error(error);
      });
  };

  const handleDeleteParticipant = (id) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      deleteParticipant(id)
        .then(() => {
          toast.success("Participant deleted successfully!");
          setParticipants((prev) => prev.filter((p) => p.id !== id));
        })
        .catch((error) => {
          toast.error("Error deleting participant.");
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

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.text("Participants List", 14, 10);
    const tableData = participants.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.category,
      p.season,
    ]);
    autoTable(doc, {
      head: [["Name", "Email", "Phone", "Category", "Season"]],
      body: tableData,
    });
    doc.save("Participants_List.pdf");
  };

  return (
    <div >
      <h2 className="k-h2 mb-6">
        Manage Participants
      </h2>

      {/* Season Filter */}
      <div className="mb-4">
        <select
          value={selectedSeason}
          onChange={(e) =>
            handleSeasonFilter(e.target.value)
          }
          className="k-input sm:w-72"
        >
          <option value="">
            All Seasons
          </option>

          {seasons.map((season) => (
            <option
              key={season.id}
              value={season.id}
            >
              {season.name}
            </option>
          ))}
        </select>
      </div>


      {/* Export Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={exportToPDF}
          className="k-btn-outline k-btn-sm"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={exportToExcel}
          className="k-btn-outline k-btn-sm"
        >
          <FaFileExcel /> Excel
        </button>
      </div>

      {/* Add Form */}
      <form onSubmit={handleCreateParticipant} className="mb-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newParticipant.name}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, name: e.target.value })
            }
            required
            className="k-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newParticipant.email}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, email: e.target.value })
            }
            required
            className="k-input"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Phone"
            value={newParticipant.phone}
            onChange={(e) =>
              setNewParticipant({ ...newParticipant, phone: e.target.value })
            }
            required
            className="k-input"
          />
          <select
            value={newParticipant.category}
            onChange={(e) =>
              setNewParticipant({
                ...newParticipant,
                category: e.target.value,
              })
            }
            required
            className="k-input"
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="k-btn-primary"
        >
          <FaPlus />
          <span>Add Participant</span>
        </button>
      </form>

      {/* Participants Table */}
      <div className="k-table-wrap bg-white">
        <table className="k-table">
          <thead >
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Category</th>
              <th className="p-3">Season</th>
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
                  <td className="p-3">{p.season}</td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingParticipant(p);
                        setShowEditModal(true);
                      }}
                      className="k-icon-btn"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="k-icon-btn hover:!text-bead-red"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-earth-600 italic"
                >
                  No participants registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingParticipant && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-cream p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold text-earth">Edit Participant</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="k-icon-btn"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdateParticipant} className="space-y-4">
              <input
                type="text"
                value={editingParticipant.name}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    name: e.target.value,
                  })
                }
                className="k-input"
                required
              />
              <input
                type="email"
                value={editingParticipant.email}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    email: e.target.value,
                  })
                }
                className="k-input"
                required
              />
              <input
                type="text"
                value={editingParticipant.phone}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    phone: e.target.value,
                  })
                }
                className="k-input"
                required
              />
              <select
                value={editingParticipant.category}
                onChange={(e) =>
                  setEditingParticipant({
                    ...editingParticipant,
                    category: e.target.value,
                  })
                }
                className="k-input"
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="k-btn-primary w-full"
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
