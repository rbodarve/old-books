import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Shared detail page for articles and blog posts. `type` comes from contentTypes.js.
export default function ContentDetail({ currentUser, type }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const Singular = type.singular.charAt(0).toUpperCase() + type.singular.slice(1);
    const [item, setItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        fetchItem();
        fetchComments();
    }, [id]);

    const fetchItem = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/${type.apiPath}/${id}`);
            if (!response.ok) throw new Error(`${Singular} not found`);
            const data = await response.json();
            setItem(data);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${type.singular}:`, err);
            setError(`Failed to load ${type.singular}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${type.commentType}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            const data = await response.json();
            setComments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('You must be logged in to comment');
            return;
        }
        if (!commentText.trim()) {
            alert('Comment cannot be empty');
            return;
        }

        setSubmittingComment(true);
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                alert('Authentication token missing. Please log in again.');
                setSubmittingComment(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contentType: type.commentType,
                    contentId: id,
                    content: commentText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to post comment');
            }
            const newComment = await response.json();
            setComments([newComment, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to post comment: ' + (err.message || 'Unknown error'));
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete comment');
            setComments(comments.filter(c => c._id !== commentId));
            setNotice({ type: 'success', message: 'Comment deleted successfully' });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error deleting comment:', err);
            setNotice({ type: 'danger', message: 'Failed to delete comment' });
        }
    };

    const handleToggleCommentsDisabled = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${type.commentType}/${id}/toggle-disable`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to toggle comments');
            const data = await response.json();
            setItem({ ...item, commentsDisabled: data.commentsDisabled });
            setNotice({
                type: 'info',
                message: `Comments ${data.commentsDisabled ? 'disabled' : 'enabled'}`
            });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error toggling comments:', err);
            setNotice({ type: 'danger', message: 'Failed to toggle comments' });
        }
    };

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div><p>Loading {type.singular}...</p></div>;
    if (error) return <div className="alert alert-danger mt-5 container">{error}</div>;
    if (!item) return <div className="alert alert-warning mt-5 container">{Singular} not found</div>;

    return (
        <div className="container mt-5 mb-5">
            {notice && (
                <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
                    {notice.message}
                    <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
                </div>
            )}

            <button className="btn btn-secondary mb-4" onClick={() => navigate(type.listPath)}>← Back to {type.title}s</button>

            <article>
                <h1 className="mb-3">{item.title}</h1>
                <div className="text-muted mb-4">
                    <small>
                        By <strong>{item.createdBy?.username || item.author}</strong> {item.createdBy?.role === 'manager' && '(Manager)'} •
                        {type.hasCategory
                            ? <>{item.category && <> <span className="badge bg-primary">{item.category}</span></>} •</>
                            : item.bookTitle && <> About <strong>{item.bookTitle}</strong> •</>}
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </small>
                </div>

                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <p className="card-text" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {item.content}
                        </p>
                    </div>
                </div>
            </article>

            {/* Comments Section */}
            <hr className="my-5" />
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">💬 Comments ({comments.length})</h3>
                    {currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin') && (
                        <button
                            className={`btn btn-sm ${item?.commentsDisabled ? 'btn-success' : 'btn-warning'}`}
                            onClick={handleToggleCommentsDisabled}
                        >
                            {item?.commentsDisabled ? '✓ Enable Comments' : '✗ Disable Comments'}
                        </button>
                    )}
                </div>

                {item?.commentsDisabled && (
                    <div className="alert alert-warning mb-4">
                        <strong>⚠️ Comments are disabled</strong> for this {type.singular}.
                    </div>
                )}

                {/* Comment Form */}
                {currentUser && !item?.commentsDisabled && (
                    <div className="card mb-4 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title mb-3">Leave a Comment</h6>
                            <form onSubmit={handleCommentSubmit}>
                                <textarea
                                    className="form-control mb-3"
                                    rows="3"
                                    placeholder="Share your thoughts..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    disabled={submittingComment}
                                ></textarea>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    {submittingComment ? 'Posting...' : 'Post Comment'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {!currentUser && !item?.commentsDisabled && (
                    <div className="alert alert-info mb-4">
                        <p>Please <a href="/login">log in</a> to leave a comment.</p>
                    </div>
                )}
                {item?.commentsDisabled && currentUser && (
                    <div className="alert alert-warning mb-4">
                        <p>Comments are currently disabled for this {type.singular}.</p>
                    </div>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                    <div className="alert alert-info">No comments yet. Be the first to comment!</div>
                ) : (
                    <div>
                        {comments.map(comment => (
                            <div key={comment._id} className="card mb-3 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="card-subtitle mb-1"><strong>{comment.author}</strong></h6>
                                            <small className="text-muted">
                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </div>
                                        {currentUser && (currentUser._id === comment.user || currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteComment(comment._id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <p className="card-text mt-3">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
