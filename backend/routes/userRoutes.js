import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();
// Protected route to get all users
router.get("/", protect, admin, getAllUsers);
export default router;