import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API_REVIEW_URL = 'http://localhost:5080/api/reviews';

const formatTimeElapsed = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const renderStars = (rating) => {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
                <i
                    key={star}
                    className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-secondary'}`}
                    style={{ fontSize: '0.9rem' }}
                />
            ))}
        </div>
    );
};

export default function ReviewSection({ 
    bookId, 
    book,
    reviews, 
    setReviews, 
    currentUser: propCurrentUser,
    onToggleDisabled,
    onDeleteReview,
    notice,
    setNotice
}) {
    const [currentUser, setCurrentUser] = useState(propCurrentUser || null);
    const [newReview, setNewReview] = useState({ rating: 5, content: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // If currentUser is passed as prop, use it
        if (propCurrentUser) {
            setCurrentUser(propCurrentUser);
        } else {
            // Otherwise, try to get from sessionStorage
            const user = sessionStorage.getItem('user');
            setCurrentUser(user ? JSON.parse(user) : null);
        }
    }, [propCurrentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.content.trim() || !bookId || submitting || !currentUser) return;

        setSubmitting(true);
        setError(null);

        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error("Authentication token missing. Please log in again.");

            const response = await fetch(API_REVIEW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookId,
                    rating: newReview.rating,
                    content: newReview.content.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post review.');
            }

            const createdReview = await response.json();
            setReviews(prev => [createdReview.review, ...prev]);
            setNewReview({ rating: 5, content: '' });
        } catch (err) {
            setError(err.message);
            console.error('Review submission error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_REVIEW_URL}/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete review.');

            setReviews(prev => prev.filter(r => r._id !== reviewId));
            if (setNotice) {
                setNotice({ type: 'success', message: 'Review deleted successfully' });
                setTimeout(() => setNotice(null), 3000);
            }
        } catch (err) {
            console.error('Delete error:', err);
            if (setNotice) {
                setNotice({ type: 'danger', message: 'Failed to delete review' });
            } else {
                alert('Failed to delete review');
            }
        }
    };

    return (
        <section className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Reviews</h3>
                {currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                    <button 
                        className={`btn btn-sm ${book?.reviewsDisabled ? 'btn-success' : 'btn-warning'}`}
                        onClick={onToggleDisabled}
                    >
                        {book?.reviewsDisabled ? '✓ Enable Reviews' : '✗ Disable Reviews'}
                    </button>
                )}
            </div>

            {book?.reviewsDisabled && (
                <div className="alert alert-warning mb-4">
                    <strong>⚠️ Reviews are disabled</strong> for this book.
                </div>
            )}

            {/* Review Form */}
            {currentUser && !book?.reviewsDisabled ? (
                <div className="card shadow-sm mb-5">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Rating</label>
                                <div className="d-flex align-items-center">
                                    <select
                                        className="form-select w-auto"
                                        value={newReview.rating}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                    >
                                        <option value="5">★★★★★ Excellent</option>
                                        <option value="4">★★★★ Good</option>
                                        <option value="3">★★★ Average</option>
                                        <option value="2">★★ Poor</option>
                                        <option value="1">★ Terrible</option>
                                    </select>
                                    <div className="ms-3">
                                        {renderStars(newReview.rating)}
                                    </div>
                                </div>
                            </div>

                            <textarea
                                className="form-control mb-3"
                                rows="3"
                                placeholder="Share your thoughts about this book..."
                                value={newReview.content}
                                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                                disabled={submitting}
                                required
                            ></textarea>
                            {error && <div className="text-danger mb-2">{error}</div>}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Posting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    {!book?.reviewsDisabled && (
                        <div className="alert alert-info mb-4">
                            <p>Please <Link to="/login">log in</Link> to write a review.</p>
                        </div>
                    )}
                    {book?.reviewsDisabled && currentUser && (
                        <div className="alert alert-warning mb-4">
                            <p>Reviews are currently disabled for this book.</p>
                        </div>
                    )}
                </>
            )}

            {/* Reviews List */}
            {loading ? (
                <p className="text-center">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <div className="alert alert-info">No reviews yet. Be the first to review this book!</div>
            ) : (
                <div className="space-y-3">
                    {reviews.map(review => (
                        <div key={review._id} className="card mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="card-title mb-1">{review.author}</h6>
                                        <div className="mb-2">
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="card-text">{review.content}</p>
                                        <small className="text-muted">
                                            {formatTimeElapsed(review.createdAt)} ago
                                        </small>
                                    </div>
                                    {currentUser && (currentUser._id === review.user || currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteReview(review._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
