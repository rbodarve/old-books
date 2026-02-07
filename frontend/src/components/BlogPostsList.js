import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlogPostsList({ currentUser }) {
    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5080/api/blog');
            if (!response.ok) throw new Error('Failed to fetch blog posts');
            const data = await response.json();
            setBlogPosts(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching blog posts:', err);
            setError('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Title and content are required');
            return;
        }

        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5080/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create blog post');
            }

            const newPost = await response.json();
            setBlogPosts([newPost, ...blogPosts]);
            setFormData({ title: '', content: '' });
            setShowForm(false);
            setNotice({ type: 'success', message: 'Blog post created successfully!' });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error creating blog post:', err);
            setNotice({ type: 'danger', message: err.message || 'Failed to create blog post' });
        } finally {
            setSubmitting(false);
        }
    };

    const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin');

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div><p>Loading blog posts...</p></div>;
    if (error) return <div className="alert alert-danger mt-5 container">{error}</div>;

    return (
        <div className="container mt-5">
            {notice && (
                <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
                    {notice.message}
                    <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
                </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-2">📚 Book Reviews & Stories</h1>
                    <p className="lead text-muted">Discover insights about our classic book collection and literary stories</p>
                </div>
                {isManager && (
                    <button 
                        className="btn btn-info text-white"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '✍️ Write a Blog Post'}
                    </button>
                )}
            </div>

            {showForm && isManager && (
                <div className="card mb-5">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Create New Blog Post</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="content" className="form-label">Content</label>
                                <textarea
                                    className="form-control"
                                    id="content"
                                    rows="8"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-info text-white" disabled={submitting}>
                                    {submitting ? 'Publishing...' : 'Publish Blog Post'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {blogPosts.length === 0 ? (
                <div className="alert alert-info">No blog posts available yet.</div>
            ) : (
                <div className="row">
                    {blogPosts.map(post => (
                        <div key={post._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title">{post.title}</h5>
                                    <p className="card-text text-muted small mb-3">
                                        By {post.createdBy?.username || post.author} {post.createdBy?.role === 'manager' && '(Manager)'} • {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="card-text">
                                        {post.content.substring(0, 150)}...
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-top-0">
                                    <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => navigate(`/blog-post/${post._id}`)}
                                    >
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
