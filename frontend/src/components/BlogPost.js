import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// Helper to get logged-in user
function getSessionUser() {
    const user = sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}
export default function BlogPost() {
    const user = getSessionUser();
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Fetch post and comments concurrently
        Promise.all([
            fetch(`http://localhost:5080/api/blog/${id}`).then(res => res.json()),
            fetch(`http://localhost:5080/api/comments/${id}`).then(res => res.json()),
        ])
            .then(([postData, commentsData]) => {
                // Check if post fetch was successful
                if (postData.title) {
                    setPost(postData);
                } else {
                    setPost(null); // Explicitly set to null if not found
                }
                // Comments fetch might return an empty array or error object, use filter
                if (Array.isArray(commentsData)) {
                    setComments(commentsData);
                }
            })
            .catch((err) => {
                console.error("Error fetching blog post or comments:", err);
                setPost(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);
    const addComment = async () => {
        if (!text.trim()) return;
        const commentAuthor = user ? user.username : "Anonymous"; // Use logged-in user or "Anonymous"
        try {
            const res = await fetch("http://localhost:5080/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // UNSAFE: postId is not validated on frontend, user is assumed/user-provided.
                body: JSON.stringify({ postId: id, user: commentAuthor, text })
            });
            if (res.ok) {
                const data = await res.json();
                // data.comment contains the newly saved comment object from the backend
                setComments(prev => [...prev, data.comment]);
                setText("");
            } else {
                const errorData = await res.json();
                console.error("Error posting comment:", errorData.message);
            }
        } catch (err) {
            console.error("Server error posting comment:", err);
        }
    };
    if (loading) return <p className="container mt-4">Loading...</p>;
    if (!post) return <p className="container mt-4">Post not found.</p>;
    return (
        <div className="container mt-4">
            <h2>{post.title}</h2>
            <p>By: {post.createdBy?.username || post.author} {post.createdBy?.role === 'manager' && '(Manager)'} | Posted: {new Date(post.createdAt).toLocaleDateString()}</p>
            <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
            <hr />
            <h4>Comments</h4>
            <ul className="list-group mb-3">
                {/* Use the unique comment ID as the key */}
                {comments.map(c => (
                    <li key={c._id} className="list-group-item">
                        <strong>{c.user}</strong>: {c.text}
                        <small className="text-muted float-end">{new Date(c.createdAt).toLocaleTimeString()}</small>
                    </li>
                ))}
                {comments.length === 0 && <li className="list-group-item text-muted">No comments yet.</li>}
            </ul>
            <textarea
                className="form-control"
                placeholder={`Write a comment as ${user ? user.username : 'Anonymous'}...`}
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={addComment} disabled={!text.trim()}>
                Post Comment
            </button>
        </div>
    );
}