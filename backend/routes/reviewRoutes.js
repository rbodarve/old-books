import express from 'express';
import { createReview, getReviewsByBookId, getReviewStats, deleteReview, addReviewWarning, toggleReviewsDisabled } from '../controllers/reviewController.js';
import { protect, managerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST create review (Protected)
router.post('/', protect, createReview);

// GET all reviews for a book (Public)
router.get('/book/:bookId', getReviewsByBookId);

// GET review statistics (Public)
router.get('/book/:bookId/stats', getReviewStats);

// PUT add warning to review (Protected - manager or admin)
router.put('/:reviewId/warning', protect, managerOrAdmin, addReviewWarning);

// PUT toggle reviews disabled (Protected - manager or admin)
router.put('/:bookId/toggle-disable', protect, managerOrAdmin, toggleReviewsDisabled);

// DELETE review (Protected - own review, manager, or admin)
router.delete('/:reviewId', protect, deleteReview);

export default router;
