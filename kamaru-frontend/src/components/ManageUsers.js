import React, { useEffect, useState } from "react";
import { fetchUsers, updateUser, deleteUser } from "../api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all users on component mount
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

  // Handle toggling admin role
  const handleToggleAdmin = (userId, isAdmin) => {
    updateUser(userId, { is_admin: isAdmin })
      .then((response) => {
        alert("User role updated successfully!");
        setUsers(
          users.map((user) =>
            user.id === userId ? response.data.user : user
          )
        );
      })
      .catch((error) => console.error("Error updating user role:", error));
  };

  // Handle updating a user
  const handleUpdateUser = (e) => {
    e.preventDefault();

    updateUser(editingUser.id, editingUser)
      .then((response) => {
        alert("User updated successfully!");
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? response.data.user : user
          )
        );
        setEditingUser(null); // Exit edit mode
      })
      .catch((error) => console.error("Error updating user:", error));
  };

  // Handle deleting a user
  const handleDeleteUser = (userId) => {
    deleteUser(userId)
      .then(() => {
        alert("User deleted successfully!");
        setUsers(users.filter((user) => user.id !== userId));
      })
      .catch((error) => console.error("Error deleting user:", error));
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div>
      <h2>Manage Users</h2>

      {/* List of Users */}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.username}</strong> - {user.email} -{" "}
            {user.is_admin ? "Admin" : "User"}
            <button onClick={() => handleToggleAdmin(user.id, !user.is_admin)}>
              {user.is_admin ? "Revoke Admin" : "Make Admin"}
            </button>
            <button onClick={() => setEditingUser(user)}>Edit</button>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Edit User Form */}
      {editingUser && (
        <form onSubmit={handleUpdateUser}>
          <h3>Edit User</h3>
          <input
            type="text"
            placeholder="Username"
            value={editingUser.username}
            onChange={(e) =>
              setEditingUser({ ...editingUser, username: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={editingUser.email}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            required
          />
          <label>
            <input
              type="checkbox"
              checked={editingUser.is_admin}
              onChange={(e) =>
                setEditingUser({ ...editingUser, is_admin: e.target.checked })
              }
            />
            Admin
          </label>
          <button type="submit">Update User</button>
          <button type="button" onClick={() => setEditingUser(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default ManageUsers;