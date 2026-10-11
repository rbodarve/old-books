import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Shared list page for articles and blog posts. `type` comes from contentTypes.js.
export default function ContentList({ currentUser, type }) {
    const navigate = useNavigate();
    const emptyForm = type.hasCategory ? { title: '', content: '', category: 'General' } : { title: '', content: '' };
    const Singular = type.singular.charAt(0).toUpperCase() + type.singular.slice(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/${type.apiPath}`);
            if (!response.ok) throw new Error(`Failed to fetch ${type.plural}`);
            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${type.plural}:`, err);
            setError(`Failed to load ${type.plural}`);
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
            const response = await fetch(`http://localhost:5000/api/${type.apiPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to create ${type.singular}`);
            }

            const newItem = await response.json();
            setItems([newItem, ...items]);
            setFormData(emptyForm);
            setShowForm(false);
            setNotice({ type: 'success', message: `${Singular} created successfully!` });
            setTimeout(() => setNotice(null), 3000);
        } catch (err) {
            console.error(`Error creating ${type.singular}:`, err);
            setNotice({ type: 'danger', message: err.message || `Failed to create ${type.singular}` });
        } finally {
            setSubmitting(false);
        }
    };

    const isManager = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin');

    if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div><p>Loading {type.plural}...</p></div>;
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
                    <h1 className="mb-2">{type.heading}</h1>
                    <p className="lead text-muted">{type.subtitle}</p>
                </div>
                {isManager && (
                    <button
                        className={`btn ${type.buttonClass}`}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : type.writeLabel}
                    </button>
                )}
            </div>

            {showForm && isManager && (
                <div className="card mb-5">
                    <div className={`card-header bg-${type.color} text-white`}>
                        <h5 className="mb-0">Create New {type.title}</h5>
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
                            {type.hasCategory && (
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
                            )}
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
                                <button type="submit" className={`btn ${type.buttonClass}`} disabled={submitting}>
                                    {submitting ? 'Publishing...' : `Publish ${type.title}`}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {items.length === 0 ? (
                <div className="alert alert-info">No {type.plural} available yet.</div>
            ) : (
                <div className="row">
                    {items.map(item => (
                        <div key={item._id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    {type.hasCategory && <span className="badge bg-primary mb-2">{item.category || 'General'}</span>}
                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-text text-muted small mb-3">
                                        By {item.createdBy?.username || item.author} {item.createdBy?.role === 'manager' && '(Manager)'} • {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="card-text">
                                        {item.content.substring(0, 150)}...
                                    </p>
                                </div>
                                <div className="card-footer bg-white border-top-0">
                                    <button
                                        className={`btn btn-sm btn-outline-${type.color}`}
                                        onClick={() => navigate(`${type.detailPath}/${item._id}`)}
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
