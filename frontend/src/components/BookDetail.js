import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ReviewSection from "./ReviewSection.js";
import BookCover from "./BookCover.js";

export default function BookDetail({ currentUser }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        // Fetch book, reviews, and stats
        Promise.all([
            fetch(`http://localhost:5080/api/books/${id}`).then(res => res.json()),
            fetch(`http://localhost:5080/api/reviews/book/${id}`).then(res => res.json()),
            fetch(`http://localhost:5080/api/reviews/book/${id}/stats`).then(res => res.json()),
        ])
            .then(([bookData, reviewsData, statsData]) => {
                if (bookData.title) {
                    setBook(bookData);
                } else {
                    setError("Book not found");
                }
                if (Array.isArray(reviewsData)) {
                    setReviews(reviewsData);
                }
                setStats(statsData);
            })
            .catch((err) => {
                console.error("Error fetching book details:", err);
                setError("Failed to load book");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleToggleReviewsDisabled = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5080/api/reviews/${id}/toggle-disable`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to toggle reviews');
            const data = await response.json();
            setBook({ ...book, reviewsDisabled: data.reviewsDisabled });
            setNotice({ 
                type: 'info', 
                message: `Reviews ${data.reviewsDisabled ? 'disabled' : 'enabled'}` 
            });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error toggling reviews:', err);
            setNotice({ type: 'danger', message: 'Failed to toggle reviews' });
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5080/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete review');
            setReviews(reviews.filter(r => r._id !== reviewId));
            setNotice({ type: 'success', message: 'Review deleted successfully' });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error deleting review:', err);
            setNotice({ type: 'danger', message: 'Failed to delete review' });
        }
    };

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div><p>Loading book...</p></div>;
    if (error) return <div className="alert alert-danger mt-5 container">{error}</div>;
    if (!book) return <div className="alert alert-warning mt-5 container">Book not found.</div>;

    return (
        <div className="container mt-5 mb-5">
            {notice && (
                <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
                    {notice.message}
                    <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
                </div>
            )}
            
            <button className="btn btn-secondary mb-4" onClick={() => navigate('/')}>← Back to Catalog</button>
            
            <div className="row">
                {/* Left Column: Cover Image */}
                <div className="col-lg-4 col-md-5 mb-4">
                    <div className="sticky-top" style={{ top: '20px' }}>
                        <BookCover
                            book={book}
                            size="L"
                            alt={book.title}
                            className="img-fluid rounded shadow-lg"
                            style={{ width: '100%', objectFit: 'cover' }}
                            fallback={
                                <div className="bg-light rounded shadow-lg d-flex align-items-center justify-content-center" style={{ height: '400px', color: '#999' }}>
                                    <p>No Cover Image</p>
                                </div>
                            }
                        />
                        
                        {/* Quick Info Card - Only show for logged-in users */}
                        {currentUser && (
                            <div className="card mt-4 shadow-sm border-0">
                                <div className="card-body">
                                    <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem' }}>Price & Availability</h6>
                                    <div className="mb-3">
                                        <p className="mb-1"><strong className="h4 text-success">${book.price.toFixed(2)}</strong></p>
                                        <small className="text-muted">Per Copy</small>
                                    </div>
                                    <div className="mb-3">
                                        {book.quantity > 0 ? (
                                            <>
                                                <span className="badge bg-success me-2">In Stock</span>
                                                <small className="text-muted">{book.quantity} available</small>
                                            </>
                                        ) : (
                                            <span className="badge bg-danger">Out of Stock</span>
                                        )}
                                    </div>
                                    
                                    {/* Buy Book Button - Only for regular users */}
                                    {currentUser.role === 'user' && (
                                        <button 
                                            className="btn btn-primary w-100 mb-3"
                                            onClick={() => {
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
                                                } else {
                                                    setNotice({ 
                                                        type: 'warning', 
                                                        message: 'This book is currently out of stock.' 
                                                    });
                                                    setTimeout(() => setNotice(null), 3000);
                                                }
                                            }}
                                            disabled={book.quantity === 0}
                                        >
                                            <i className="bi bi-cart-plus me-2"></i>
                                            {book.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    )}
                                    
                                    <hr />
                                    <div>
                                        <small className="text-muted d-block mb-2"><strong>Condition:</strong> {book.condition}</small>
                                        <small className="text-muted d-block"><strong>Category:</strong> {book.category}</small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Book Info */}
                <div className="col-lg-8 col-md-7">
                    {/* Title & Author */}
                    <h1 className="fw-bold mb-2">{book.title}</h1>
                    <p className="text-muted fs-5 mb-4">
                        by <strong>{book.author}</strong>
                    </p>

                    {/* Rating Section */}
                    {stats && (
                        <div className="card mb-4 border-0 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <div className="display-6 text-warning me-3">
                                            {stats.averageRating?.toFixed(1) || 'N/A'}
                                            <span style={{ fontSize: '0.5em' }}>★</span>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <p className="mb-0"><strong>{stats.reviewCount || 0}</strong> customer reviews</p>
                                        <small className="text-muted">Rate this book and share your thoughts</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Book Details Grid */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: '0.85rem' }}>Book Information</h6>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <p className="mb-1"><small className="text-muted">ISBN</small></p>
                                    <p className="fw-semibold mb-3">{book.isbn || 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1"><small className="text-muted">Publication Date</small></p>
                                    <p className="fw-semibold mb-3">{book.publicationDate ? new Date(book.publicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1"><small className="text-muted">Category</small></p>
                                    <p className="fw-semibold mb-3">{book.category || 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1"><small className="text-muted">Condition</small></p>
                                    <p className="fw-semibold mb-3"><span className="badge bg-info">{book.condition}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="card mb-4 border-0 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title mb-3">About This Book</h5>
                            <p style={{ lineHeight: '1.8', color: '#555' }}>
                                {book.description || 'No description available for this book.'}
                            </p>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <hr className="my-5" />
                    <ReviewSection 
                        bookId={book._id} 
                        book={book}
                        reviews={reviews} 
                        setReviews={setReviews} 
                        currentUser={currentUser}
                        onToggleDisabled={handleToggleReviewsDisabled}
                        onDeleteReview={handleDeleteReview}
                        notice={notice}
                        setNotice={setNotice}
                    />
                </div>
            </div>
        </div>
    );
}
