import React, { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser } from "../api";
import {
  FaUserEdit,
  FaTrash,
  FaUserShield,
  FaUser,
  FaTimes,
  FaFilePdf,
  FaFileExcel,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState(null);

  useEffect(() => {
    fetchUsers()
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  const handleToggleAdmin = (userId, isAdmin) => {
    if (!window.confirm(`Are you sure you want to ${isAdmin ? "grant" : "revoke"} admin rights?`)) return;

    setProcessingUser(userId);
    updateUser(userId, { is_admin: isAdmin })
      .then((response) => {
        alert("User role updated successfully!");
        setUsers(users.map((user) => (user.id === userId ? response.data.user : user)));
      })
      .catch((error) => console.error("Error updating user role:", error))
      .finally(() => setProcessingUser(null));
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setProcessingUser(editingUser.id);

    updateUser(editingUser.id, editingUser)
      .then((response) => {
        alert("User updated successfully!");
        setUsers(users.map((user) => (user.id === editingUser.id ? response.data.user : user)));
        setEditingUser(null);
      })
      .catch((error) => console.error("Error updating user:", error))
      .finally(() => setProcessingUser(null));
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setProcessingUser(userId);
    deleteUser(userId)
      .then(() => {
        alert("User deleted successfully!");
        setUsers(users.filter((user) => user.id !== userId));
      })
      .catch((error) => console.error("Error deleting user:", error))
      .finally(() => setProcessingUser(null));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(u => ({
      Username: u.username,
      Email: u.email,
      Role: u.is_admin ? "Admin" : "User",
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "kamaru_users.xlsx");
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Username", "Email", "Role"]],
      body: users.map((u) => [u.username, u.email, u.is_admin ? "Admin" : "User"]),
    });
    doc.save("kamaru_users.pdf");
  };

  if (loading) {
    return <p className="text-center text-lg font-semibold text-[#333]">Loading users...</p>;
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#D57500]">Manage Users</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            className="bg-[#D57500] text-white px-3 py-2 rounded flex items-center gap-2 text-sm hover:bg-[#b65e00]"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-[#333] text-white px-3 py-2 rounded flex items-center gap-2 text-sm hover:bg-[#1a1a1a]"
          >
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-md">
          <thead className="bg-[#333] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="px-4 py-2 text-[#333]">{user.username}</td>
                <td className="px-4 py-2 text-[#333]">{user.email}</td>
                <td className="px-4 py-2">
                  {user.is_admin ? (
                    <span className="text-green-600 font-semibold flex items-center">
                      <FaUserShield className="mr-1" /> Admin
                    </span>
                  ) : (
                    <span className="text-[#333] flex items-center">
                      <FaUser className="mr-1" /> User
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 flex space-x-3">
                  <button
                    className="text-[#D57500] hover:text-[#b65e00] flex items-center space-x-1"
                    onClick={() => setEditingUser(user)}
                  >
                    <FaUserEdit /> <span className="hidden md:inline">Edit</span>
                  </button>
                  <button
                    className={`${
                      user.is_admin ? "text-red-600" : "text-green-600"
                    } hover:opacity-80 flex items-center space-x-1`}
                    onClick={() => handleToggleAdmin(user.id, !user.is_admin)}
                    disabled={processingUser === user.id}
                  >
                    {user.is_admin ? <FaUser /> : <FaUserShield />}
                    <span className="hidden md:inline">{user.is_admin ? "Revoke" : "Make Admin"}</span>
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={processingUser === user.id}
                  >
                    <FaTrash /> <span className="hidden md:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-96 transform transition-transform scale-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[#D57500]">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <label className="block mb-2">
                Username:
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  required
                />
              </label>
              <label className="block mb-2">
                Email:
                <input
                  type="email"
                  className="w-full border border-gray-300 p-2 rounded-md mt-1"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </label>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  className="bg-[#333] text-white px-4 py-2 rounded-md hover:bg-[#1a1a1a]"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D57500] text-white px-4 py-2 rounded-md hover:bg-[#b65e00]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
