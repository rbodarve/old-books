import React, { useState } from 'react'; // MUST import useState
import { Link, useNavigate } from 'react-router-dom'; // MUST import Link and useNavigate
import LogoutModal from './LogoutModal.js'; // <-- NEW: Import the modal component
export default function AppNavbar({ currentUser, setCurrentUser }) {
    // State to control the visibility of the confirmation modal
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate(); // Hook for redirection
    // This function runs ONLY when the user clicks "Logout" inside the MODAL.
    const handleLogout = () => {
        // 1. Clear session data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        // 2. Update global state (forces re-render of App.js and Navbar)
        setCurrentUser(null);
        // 3. Close modal and redirect to login page
        setShowLogout(false);
        navigate('/login');
    };
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">📚 Old Store Collection</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNavbar"
                    aria-controls="mainNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="mainNavbar">
                    <ul className="navbar-nav ms-auto">
                        {/* 1. GUEST Links */}
                        {!currentUser && (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            </>
                        )}
                        {/* 2. Logged-in User Links */}
                        {currentUser && (
                            <>
                                {/* Regular User Links */}
                                {currentUser.role === "user" && (
                                    <>
                                        <li className="nav-item"><Link className="nav-link" to="/home">Browse Books</Link></li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/cart">
                                                <i className="bi bi-cart"></i> Cart
                                                {(() => {
                                                    const cart = JSON.parse(localStorage.getItem(`cart_${currentUser.id}`) || '[]');
                                                    return cart.length > 0 ? (
                                                        <span className="badge bg-danger ms-1">{cart.length}</span>
                                                    ) : null;
                                                })()}
                                            </Link>
                                        </li>
                                        <li className="nav-item"><Link className="nav-link" to="/articles">Articles</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/blog-posts">Blog Posts</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
                                    </>
                                )}
                                {/* Manager Links */}
                                {currentUser.role === "manager" && (
                                    <>
                                        <li className="nav-item"><Link className="nav-link" to="/home">Browse Books</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/articles">Articles</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/blog-posts">Blog Posts</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
                                        <li className="nav-item"><span className="nav-link text-warning" style={{fontWeight: 'bold'}}>👔 Manager</span></li>
                                    </>
                                )}
                                {/* Admin Links */}
                                {currentUser.role === "admin" && (
                                    <>
                                        <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/admin/books/list">Manage Books</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/admin/books/create">Add Book</Link></li>
                                        <li className="nav-item"><span className="nav-link text-danger" style={{fontWeight: 'bold'}}>👤 Admin</span></li>
                                    </>
                                )}
                                {/* User Info Display */}
                                <li className="nav-item"><span className="nav-link">👋 {currentUser.username}</span></li>
                                {/* Logout Button (TRIGGERS MODAL) */}
                                <li className="nav-item">
                                    <button
                                        className="nav-link btn btn-link"
                                        onClick={() => setShowLogout(true)} // <-- Sets state to true to show the modal
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
            {/* 3. RENDER LOGOUT MODAL HERE */}
            <LogoutModal
                show={showLogout}
                onClose={() => setShowLogout(false)} // Closes modal without logging out
                onConfirm={handleLogout} // Executes handleLogout (clears state/redirects)
            />
        </nav>
    );
}