import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// --- Imports ---
import AppNavbar from "./components/AppNavbar.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import About from "./components/About.js";
import Services from "./components/Services.js";
import Contact from "./components/Contact.js";
import PublicHome from "./components/PublicHome.js";
import BookCatalog from "./components/BookCatalog.js";
import Cart from "./components/Cart.js";
import Dashboard from "./components/Dashboard.js";
import BookDetail from "./components/BookDetail.js";
import ArticlesList from "./components/ArticlesList.js";
import BlogPostsList from "./components/BlogPostsList.js";
import ArticleDetail from "./components/ArticleDetail.js";
import BlogPostDetail from "./components/BlogPostDetail.js";
// --- ADMIN COMPONENTS ---
import AdminDashboard from "./pages/admin/AdminDashboard.js";
import AdminBookList from "./pages/admin/AdminBookList.js";
import CreateBookPage from "./pages/admin/CreateBookPage.js";
import AdminBookEdit from "./pages/admin/AdminBookEdit.js";
// === User Access Control Wrapper ===
const UserWrapper = ({ currentUser, children }) => {
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    // Standard user can access content
    return children;
};
// === Admin Access Control Wrapper (Remains the same) ===
const AdminWrapper = ({ currentUser, children }) => {
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    if (currentUser.role !== 'admin') {
        return <h1 className="container mt-5 text-danger">403 Forbidden: Admin Access Required</h1>;
    }
    return children;
};
export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (user) {
            // If user data is found, parse it and set it as the current user state
            setCurrentUser(JSON.parse(user));
        }
    }, []);
    return (
        <Router>
            <AppNavbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
            <Routes>
                {/* 1. PUBLIC ROUTES - Available to anyone */}
                {/* ROOT PATH - Public Homepage */}
                <Route
                    path="/"
                    element={<PublicHome currentUser={currentUser} />}
                />

                {/* LOGIN and REGISTER */}
                <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
                <Route path="/register" element={<Register setCurrentUser={setCurrentUser} />} />

                {/* Book Detail View - Public but comments require login */}
                <Route
                    path="/book/:id"
                    element={<BookDetail currentUser={currentUser} />}
                />

                {/* 2. AUTHENTICATED USER ROUTES */}
                <Route
                    path="/home"
                    element={
                        <UserWrapper currentUser={currentUser}>
                            <BookCatalog currentUser={currentUser} />
                        </UserWrapper>
                    }
                />
                <Route
                    path="/cart"
                    element={
                        <UserWrapper currentUser={currentUser}>
                            <Cart currentUser={currentUser} />
                        </UserWrapper>
                    }
                />
                {/* Wrapping all other user routes in UserWrapper */}
                <Route path="/about" element={<UserWrapper currentUser={currentUser}><About /></UserWrapper>} />
                <Route path="/services" element={<UserWrapper currentUser={currentUser}><Services /></UserWrapper>} />
                <Route path="/contact" element={<UserWrapper currentUser={currentUser}><Contact /></UserWrapper>} />
                <Route path="/articles" element={<UserWrapper currentUser={currentUser}><ArticlesList currentUser={currentUser} /></UserWrapper>} />
                <Route path="/article/:id" element={<UserWrapper currentUser={currentUser}><ArticleDetail currentUser={currentUser} /></UserWrapper>} />
                <Route path="/blog-posts" element={<UserWrapper currentUser={currentUser}><BlogPostsList currentUser={currentUser} /></UserWrapper>} />
                <Route path="/blog-post/:id" element={<UserWrapper currentUser={currentUser}><BlogPostDetail currentUser={currentUser} /></UserWrapper>} />
                <Route path="/blog-post/:id" element={<UserWrapper currentUser={currentUser}><BlogPostDetail /></UserWrapper>} />
                <Route path="/user-dashboard" element={<UserWrapper currentUser={currentUser}><Dashboard /></UserWrapper>} />
                {/* 3. PROTECTED ADMIN ROUTES */}
                <Route
                    path="/dashboard"
                    element={
                        <AdminWrapper currentUser={currentUser}>
                            <AdminDashboard />
                        </AdminWrapper>
                    }
                />
                <Route
                    path="/admin/books/list"
                    element={
                        <AdminWrapper currentUser={currentUser}>
                            <AdminBookList />
                        </AdminWrapper>
                    }
                />
                <Route
                    path="/admin/books/create"
                    element={
                        <AdminWrapper currentUser={currentUser}>
                            <CreateBookPage />
                        </AdminWrapper>
                    }
                />
                <Route
                    path="/admin/books/edit/:id"
                    element={
                        <AdminWrapper currentUser={currentUser}>
                            <AdminBookEdit />
                        </AdminWrapper>
                    }
                />
                {/* 4. Catch-all Route */}
                <Route path="*" element={<h1 className="container mt-5">404 Page Not Found</h1>} />
            </Routes>
        </Router>
    );
}