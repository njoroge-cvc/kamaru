import React, { useEffect, useState } from "react";
import { getAdminDashboard } from "../api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from local storage:", token); // Debugging
    
    if (!token) {
      alert("You must be logged in as an admin to access this page.");
      return;
    }

    getAdminDashboard()
      .then((response) => setData(response.data))
      .catch((error) => {
        console.error("Error fetching admin dashboard:", error);
        if (error.response && error.response.status === 401){
            alert("Unauthorized access. Please log in as an admin.");
        } else {
            alert("An error occurred. Please try again later.")
        }
      
      });
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminDashboard;