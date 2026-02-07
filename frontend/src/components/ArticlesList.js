import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArticlesList({ currentUser }) {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5080/api/articles');
            if (!response.ok) throw new Error('Failed to fetch articles');
            const data = await response.json();
            setArticles(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Failed to load articles');
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
            const response = await fetch('http://localhost:5080/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create article');
            }

            const newArticle = await response.json();
            setArticles([newArticle, ...articles]);
            setFormData({ title: '', content: '', category: 'General' });
            setShowForm(false);
            setNotice({ type: 'success', message: 'Article created successfully!' });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error('Error creating article:', err);
            setNotice({ type: 'danger', message: err.message || 'Failed to create article' });
        } finally {
            setSubmitting(false);
        }
    };

    const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin');

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div><p>Loading articles...</p></div>;
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
                    <h1 className="mb-2">📰 Shop Articles</h1>
                    <p className="lead text-muted">Stay updated with the latest news, tips, and insights from our bookstore</p>
                </div>
                {isManager && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : '✍️ Write an Article'}
                    </button>
                )}
            </div>

            {showForm && isManager && (
                <div className="card mb-5">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Create New Article</h5>
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
                                <label htmlFor="category" className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="News">News</option>
                                    <option value="Tips">Tips</option>
                                    <option value="Reviews">Reviews</option>
                                    <option value="Events">Events</option>
                                </select>
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
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Publishing...' : 'Publish Article'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {articles.length === 0 ? (
                <div className="alert alert-info">No articles available yet.</div>
            ) : (
                <div className="row">
                    {articles.map(article => (
                        <div key={article._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <span className="badge bg-primary mb-2">{article.category || 'General'}</span>
                                    <h5 className="card-title">{article.title}</h5>
                                    <p className="card-text text-muted small mb-3">
                                        By {article.createdBy?.username || article.author} {article.createdBy?.role === 'manager' && '(Manager)'} • {new Date(article.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="card-text">
                                        {article.content.substring(0, 150)}...
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-top-0">
                                    <button 
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => navigate(`/article/${article._id}`)}
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
