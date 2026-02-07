import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5080/api/books';

function getToken() {
    return sessionStorage.getItem("token");
}

export default function AdminBookList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        const token = getToken();
        if (!token) {
            setError("Authentication token missing. Please log in.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_BASE, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch books.');
            }

            const data = await response.json();
            setBooks(data);
        } catch (err) {
            setError(`Error fetching data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = async (bookId) => {
        if (!window.confirm(`Are you sure you want to delete this book?`)) {
            return;
        }

        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                alert("Book deleted successfully");
                fetchBooks();
            } else {
                const errorData = await response.json();
                alert(`Deletion failed: ${errorData.message}`);
            }
        } catch (err) {
            alert(`Network error during deletion: ${err.message}`);
        }
    };

    if (loading) return <div className="container mt-5 text-center">Loading books...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">Error: {error}</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Manage Books</h1>
                <Link to="/admin/books/create" className="btn btn-success">
                    + Add New Book
                </Link>
            </div>

            {books.length === 0 ? (
                <div className="alert alert-info">No books found. <Link to="/admin/books/create">Create one now</Link></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>ISBN</th>
                                <th>Category</th>
                                <th>Condition</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book._id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td><code>{book.isbn}</code></td>
                                    <td>{book.category}</td>
                                    <td><span className="badge bg-secondary">{book.condition}</span></td>
                                    <td>${book.price.toFixed(2)}</td>
                                    <td>
                                        <span className={book.quantity > 0 ? 'badge bg-success' : 'badge bg-danger'}>
                                            {book.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/admin/books/edit/${book._id}`}
                                            className="btn btn-sm btn-primary me-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(book._id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
