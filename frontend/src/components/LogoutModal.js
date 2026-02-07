import React from "react";
export default function LogoutModal({ show, onClose, onConfirm }) {
    if (!show) return null;
    return (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm Logout</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to logout?</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-danger" onClick={onConfirm}>Logout</button>
                    </div>
                </div>
            </div>
        </div>
    );
}