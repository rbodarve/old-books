import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCover from './BookCover.js';

const BOOK_CATEGORIES = [
    'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'History', 'Biography', 'Self-Help', 'Poetry', 'Children',
    'Young Adult', 'Non-Fiction', 'Classics', 'Literary Fiction', 'Horror', 'Adventure', 'Other'
];

const BOOK_CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

export default function PublicHome({ currentUser }) {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        fetchBooks();
    }, [search, selectedCategory, selectedCondition, minPrice, maxPrice]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            
            // Validate price filters
            const minVal = minPrice ? parseFloat(minPrice) : null;
            const maxVal = maxPrice ? parseFloat(maxPrice) : null;
            
            if ((minVal !== null && minVal < 0) || (maxVal !== null && maxVal < 0)) {
                setError('Prices cannot be negative');
                setLoading(false);
                return;
            }
            
            if (minVal !== null && maxVal !== null && minVal > maxVal) {
                setError('Minimum price cannot be greater than maximum price');
                setLoading(false);
                return;
            }
            
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedCondition) params.append('condition', selectedCondition);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const response = await fetch(`http://localhost:5000/api/books?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch books');

            const data = await response.json();
            setBooks(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching books:', err);
            setError('Failed to load books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`);
    };

    return (
        <div className="container-fluid mt-5">
            <div className="mb-5">
                <h1 className="display-4 fw-bold text-center mb-3">Old Store Collection</h1>
                <p className="lead text-center text-muted">
                    Welcome to Odarve's Book Collection! Take a look around and sign up if you want to buy the books!
                </p>
            </div>

            <div className="row">
                {/* Sidebar Filters */}
                <div className="col-md-3 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Filters</h5>

                            {/* Search */}
                            <div className="mb-4">
                                <label className="form-label">Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Title, author, ISBN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {BOOK_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Condition */}
                            <div className="mb-4">
                                <label className="form-label">Condition</label>
                                <select
                                    className="form-select"
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    {BOOK_CONDITIONS.map(cond => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range - Only show for logged-in users */}
                            {currentUser && (
                                <div className="mb-4">
                                    <label className="form-label">Price Range</label>
                                    <div className="input-group mb-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            min="0"
                                            title="Minimum price must be non-negative"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            min="0"
                                            title="Maximum price must be non-negative"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn btn-secondary w-100"
                                onClick={() => {
                                    setSearch('');
                                    setSelectedCategory('');
                                    setSelectedCondition('');
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                <div className="col-md-9">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading books...</p>
                        </div>
                    ) : books.length === 0 ? (
                        <div className="alert alert-info">No books found matching your filters.</div>
                    ) : (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {books.map(book => {
                                return (
                                <div key={book._id} className="col">
                                    <div
                                        className="card h-100 cursor-pointer shadow-sm"
                                        onClick={() => handleBookClick(book._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <BookCover
                                            book={book}
                                            alt={book.title}
                                            className="card-img-top"
                                            style={{ height: '250px', objectFit: 'cover' }}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{book.title}</h5>
                                            <p className="card-text text-muted small">
                                                By {book.author}
                                            </p>
                                            <p className="card-text small text-secondary">
                                                {book.description?.substring(0, 80)}...
                                            </p>
                                            <div className="mt-auto">
                                                <span className="badge bg-info me-2">{book.category}</span>
                                                <span className="badge bg-secondary">{book.condition}</span>
                                            </div>
                                        </div>
                                        {currentUser && (
                                            <div className="card-footer bg-white">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="mb-0 text-success">${book.price.toFixed(2)}</h5>
                                                    <small className={book.quantity > 0 ? 'text-success' : 'text-danger'}>
                                                        {book.quantity > 0 ? `${book.quantity} in stock` : 'Out of stock'}
                                                    </small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
