import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCover from './BookCover.js';

export default function Cart({ currentUser }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem(`cart_${currentUser?.id}`);
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, [currentUser]);

    const removeFromCart = (bookId) => {
        const updatedCart = cartItems.filter(item => item._id !== bookId);
        setCartItems(updatedCart);
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(updatedCart));
        setNotice({ type: 'info', message: 'Item removed from cart' });
        setTimeout(() => setNotice(null), 3000);
    };

    const clearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            setCartItems([]);
            localStorage.removeItem(`cart_${currentUser.id}`);
            setNotice({ type: 'info', message: 'Cart cleared' });
            setTimeout(() => setNotice(null), 3000);
        }
    };

    const handleCheckout = () => {
        setNotice({ 
            type: 'success', 
            message: 'Order placed successfully! (This is a demo - no actual purchase was made)' 
        });
        setTimeout(() => {
            setCartItems([]);
            localStorage.removeItem(`cart_${currentUser.id}`);
            setNotice(null);
        }, 3000);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.cartQuantity || 1);
            return total + (price * quantity);
        }, 0);
    };

    if (!currentUser) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning">
                    Please log in to view your cart.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <h1 className="mb-4">Shopping Cart</h1>

            {notice && (
                <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
                    {notice.message}
                    <button type="button" className="btn-close" onClick={() => setNotice(null)}></button>
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                        <h3 className="mt-3">Your cart is empty</h3>
                        <p className="text-muted">Browse our catalog and add some books!</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate('/home')}>
                            Browse Books
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {/* Cart Items */}
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Cart Items ({cartItems.length})</h5>
                            </div>
                            <div className="card-body">
                                {cartItems.map((item, index) => {
                                    return (
                                    <div key={item._id || index} className="row align-items-center mb-3 pb-3 border-bottom">
                                        <div className="col-md-2">
                                            <BookCover
                                                book={item}
                                                alt={item.title}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '100px', objectFit: 'cover' }}
                                                fallback={
                                                    <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                                                        style={{ height: '100px', color: '#999' }}>
                                                        No Image
                                                    </div>
                                                }
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <h6 className="mb-1">{item.title}</h6>
                                            <small className="text-muted">by {item.author}</small>
                                            <div className="mt-1">
                                                <span className="badge bg-info me-1">{item.category}</span>
                                                <span className="badge bg-secondary">{item.condition}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-2 text-center">
                                            <small className="text-muted d-block">Price</small>
                                            <strong className="text-success">${item.price.toFixed(2)}</strong>
                                        </div>
                                        <div className="col-md-2 text-center">
                                            <small className="text-muted d-block">Quantity</small>
                                            <strong>{item.cartQuantity || 1}</strong>
                                        </div>
                                        <div className="col-md-2 text-end">
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeFromCart(item._id)}
                                            >
                                                <i className="bi bi-trash"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                                })}
                            </div>
                        </div>

                        <button className="btn btn-outline-danger" onClick={clearCart}>
                            <i className="bi bi-trash"></i> Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="col-lg-4">
                        <div className="card sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Order Summary</h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Items ({cartItems.length})</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping</span>
                                    <span className="text-success">FREE</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <strong>Total</strong>
                                    <strong className="text-success">${calculateTotal().toFixed(2)}</strong>
                                </div>
                                <button 
                                    className="btn btn-primary w-100 mb-2"
                                    onClick={handleCheckout}
                                >
                                    <i className="bi bi-credit-card me-2"></i>
                                    Proceed to Checkout
                                </button>
                                <button 
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => navigate('/home')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
