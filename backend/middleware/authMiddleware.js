import jwt from "jsonwebtoken";
// 1. CONFIRMATION: The path must be correct:
import User from "../models/userModel.js";
// Fallback secret for dev/test
const JWT_FALLBACK_SECRET = "insecure-test-secret";
// Protect routes
export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const secret = process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
        const decoded = jwt.verify(token, secret);
        // 2. FETCH FULL USER OBJECT FROM DB
        // Await the Mongoose call and use decoded.id
        req.user = await User.findById(decoded.id).select("-password");
        // 3. CHECK FOR DATABASE FAILURE
        if (!req.user) {
            // If findById returns null, it means the token is valid, but the user ID is not in the database.
            console.error(`ERROR: Valid token points to missing user ID: ${decoded.id}`);
            return res.status(401).json({ message: "Unauthorized: User ID not found in database." });
        }
        // 4. DEBUG LOG: CONFIRM USER DATA IS ATTACHED
        console.log(`User ID ${req.user._id} successfully attached to request.`);
        next();
    } catch (error) {
        // This catches token verification errors (expired, wrong secret, malformed)
        console.error("TOKEN VERIFICATION FAILURE:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};
// Admin only
export const admin = (req, res, next) => {
    // Check if req.user is null (shouldn't happen if protect passes) OR if the role is not 'admin'
    if (!req.user || req.user.role !== "admin") {
        // FIX: Change the error message to explicitly state 'Admin access required'
        return res.status(403).json({
            message: "Forbidden: Admin access required to perform this action."
        });
    }
    next();
};

// Manager or Admin
export const managerOrAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== "manager" && req.user.role !== "admin")) {
        return res.status(403).json({
            message: "Forbidden: Manager or Admin access required to perform this action."
        });
    }
    next();
};