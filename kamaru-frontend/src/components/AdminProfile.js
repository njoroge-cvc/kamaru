import React, { useState } from "react";

const AdminProfile = () => {
    const [profile, setProfile] = useState({ name: "", email: "" });
  
    const handleUpdateProfile = () => {
      // Call API to update profile
    };
  
    return (
      <div className="p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-semibold text-[#8F3B1B] mb-4">Profile Settings</h2>
        <form onSubmit={handleUpdateProfile}>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
            className="border border-gray-300 rounded-md px-4 py-2 mb-4"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
            className="border border-gray-300 rounded-md px-4 py-2 mb-4"
          />
          <button type="submit" className="bg-[#D57500] text-white px-4 py-2 rounded-md">
            Update Profile
          </button>
        </form>
      </div>
    );
  };
  
  export default AdminProfile;