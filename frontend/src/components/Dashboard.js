import React from "react";
export default function Dashboard() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || user.role !== "admin") {
        return (
            <div className="container mt-4">
                <h2>Access Denied</h2>
                <p>This area is restricted to administrators.</p>
            </div>
        );
    }
    return (
        <div className="container mt-4">
            <h2>Admin Dashboard</h2>
            <p>Welcome back, <strong>{user.username}</strong>!</p>
            <p>Here you can manage posts and users (future feature).</p>
        </div>
    );
}