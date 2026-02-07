import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// NOTE: This component assumes it will receive the setCurrentUser function
// via props (or context) to update the global user state in App.js.
// If you are passing it via props, you must adjust the component function signature
// to `export default function Login({ setCurrentUser }) { ... }`.
const API_LOGIN_URL = 'http://localhost:5080/api/auth/login'; // Adjust endpoint if needed
export default function Login({ setCurrentUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                // Handle non-200 responses (e.g., 401 Unauthorized, 404 Not Found)
                throw new Error(data.message || 'Login failed. Check credentials.');
            }
            // --- CRITICAL SUCCESS LOGIC ---
            // 1. Extract Token and User Data
            const { token, user } = data; // Assumes your backend returns { token, user: { _id, email, role, ... } }
            // 2. Save to Session Storage
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            // 3. Update State & Redirect
            setCurrentUser(user); // Update the state in App.js which triggers re-render
            if (user.role === 'admin') {
                navigate('/dashboard'); // Admin lands on the dashboard
            } else {
                navigate('/home'); // Standard user lands on the home page
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <h1 className="mb-4 text-center">Login</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="emailInput"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="passwordInput" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="passwordInput"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}