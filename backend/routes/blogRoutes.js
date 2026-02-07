import express from 'express';
import { getAllPosts, getPostById, createPost } from '../controllers/blogPostController.js';
import { protect, managerOrAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();
// GET all posts (Public)
router.get('/', getAllPosts);
// POST create post (Protected - manager or admin)
router.post('/', protect, managerOrAdmin, createPost);
// GET single post by ID (Public)
router.get('/:id', getPostById);
export default router;