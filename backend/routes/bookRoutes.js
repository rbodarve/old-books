import express from 'express';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all books (Public - supports filtering by category, price, condition, search)
router.get('/', getAllBooks);

// POST create book (Protected - Admin only)
router.post('/', protect, admin, createBook);

// GET single book by ID (Public)
router.get('/:id', getBookById);

// PUT update book (Protected - Admin only)
router.put('/:id', protect, admin, updateBook);

// DELETE book (Protected - Admin only)
router.delete('/:id', protect, admin, deleteBook);

export default router;
