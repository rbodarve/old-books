import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOK_CATEGORIES = [
    'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'History', 'Biography', 'Self-Help', 'Poetry', 'Children',
    'Young Adult', 'Non-Fiction', 'Classics', 'Literary Fiction', 'Horror', 'Adventure', 'Other'
];

const BOOK_CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

const API_URL = "http://localhost:5000/api/books";

export default function CreateBookPage() {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publicationDate: '',
        description: '',
        category: 'Fiction',
        condition: 'Good',
        price: '',
        quantity: '',
        coverImage: ''
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (submitting) return;

        // Validation
        if (!formData.title || !formData.author || !formData.isbn || !formData.publicationDate || 
            !formData.description || !formData.price || !formData.quantity) {
            setError("All required fields must be filled");
            return;
        }
        
        // Validate price
        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            setError("Price must be a non-negative number");
            return;
        }
        
        // Validate quantity
        const quantity = parseInt(formData.quantity);
        if (isNaN(quantity) || quantity < 0) {
            setError("Quantity must be a non-negative whole number");
            return;
        }

        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error("User token not found. Please log in.");
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create book on server.');
            }

            alert("Book created successfully!");
            navigate('/admin/books/list');
        } catch (err) {
            setError(err.message);
            console.error('Error creating book:', err);
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Add New Book</h2>
            {error && (
                <div className="alert alert-danger" role="alert">
                    Error: {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="title" className="form-label">Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="author" className="form-label">Author *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="author"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="isbn" className="form-label">ISBN *</label>
                        <input
                            type="text"
                            className="form-control"
                            id="isbn"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            placeholder="e.g., 978-0-123456-78-9"
                            required
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="publicationDate" className="form-label">Publication Date *</label>
                        <input
                            type="date"
                            className="form-control"
                            id="publicationDate"
                            name="publicationDate"
                            value={formData.publicationDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="category" className="form-label">Category *</label>
                        <select
                            className="form-select"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            {BOOK_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label htmlFor="condition" className="form-label">Condition *</label>
                        <select
                            className="form-select"
                            id="condition"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            required
                        >
                            {BOOK_CONDITIONS.map(cond => (
                                <option key={cond} value={cond}>{cond}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="price" className="form-label">Price ($) *</label>
                        <input
                            type="number"
                            className="form-control"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            title="Price must be a non-negative number"
                            required
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label htmlFor="quantity" className="form-label">Quantity in Stock *</label>
                        <input
                            type="number"
                            className="form-control"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            title="Quantity must be a non-negative whole number"
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description *</label>
                    <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Book summary, synopsis, or description..."
                        required
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="coverImage" className="form-label">Cover Image URL</label>
                    <input
                        type="url"
                        className="form-control"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? 'Adding Book...' : 'Add Book'}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => navigate('/admin/books/list')}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}
