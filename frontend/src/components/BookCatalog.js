import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCover from './BookCover.js';

const BOOK_CATEGORIES = [
    'Fiction',
    'Mystery',
    'Romance',
    'Science Fiction',
    'Fantasy',
    'History',
    'Biography',
    'Self-Help',
    'Poetry',
    'Children',
    'Young Adult',
    'Non-Fiction',
    'Classics',
    'Literary Fiction',
    'Horror',
    'Adventure',
    'Other'
];

const BOOK_CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

export default function BookCatalog({ currentUser }) {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);

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
            <h1 className="mb-5 text-center">Old Store Collection - Catalog</h1>
            
            {notice && (
                <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
                    {notice.message}
                    <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
                </div>
            )}

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
                                        className="card h-100 shadow-sm"
                                        style={{ transition: 'transform 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <BookCover
                                            book={book}
                                            alt={book.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                                            onClick={() => handleBookClick(book._id)}
                                        />
                                        <div className="card-body" style={{ cursor: 'pointer' }} onClick={() => handleBookClick(book._id)}>
                                            <h6 className="card-title">{book.title}</h6>
                                            <p className="card-text text-muted small">{book.author}</p>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-info">{book.category}</span>
                                                <span className="badge bg-secondary">{book.condition}</span>
                                            </div>
                                            {currentUser && (
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 className="mb-0 text-success">${book.price.toFixed(2)}</h5>
                                                    <small className={book.quantity > 0 ? 'text-success' : 'text-danger'}>
                                                        {book.quantity > 0 ? `${book.quantity} in stock` : 'Out of stock'}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                        {currentUser && currentUser.role === 'user' && (
                                            <div className="card-footer bg-white border-0 pt-0">
                                                <button 
                                                    className="btn btn-primary btn-sm w-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (book.quantity > 0) {
                                                            // Add to cart in localStorage
                                                            const cartKey = `cart_${currentUser.id}`;
                                                            const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
                                                            
                                                            // Check if book already in cart
                                                            const alreadyInCart = existingCart.some(item => item._id === book._id);
                                                            
                                                            if (!alreadyInCart) {
                                                                existingCart.push({ ...book, cartQuantity: 1 });
                                                                localStorage.setItem(cartKey, JSON.stringify(existingCart));
                                                                setNotice({ 
                                                                    type: 'success', 
                                                                    message: `"${book.title}" has been added to your cart!` 
                                                                });
                                                            } else {
                                                                setNotice({ 
                                                                    type: 'info', 
                                                                    message: `"${book.title}" is already in your cart!` 
                                                                });
                                                            }
                                                            setTimeout(() => setNotice(null), 3000);
                                                        }
                                                    }}
                                                    disabled={book.quantity === 0}
                                                >
                                                    <i className="bi bi-cart-plus me-2"></i>
                                                    {book.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
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
