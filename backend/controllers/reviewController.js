import Review from '../models/reviewModel.js';
import Book from '../models/bookModel.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @route POST /api/reviews
// @desc Add a review to a book
// @access Private (Requires 'protect' middleware)
export const createReview = asyncHandler(async (req, res) => {
    const { bookId, rating, content } = req.body;

    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized: User data missing");
    }

    const userId = req.user._id;
    const authorName = req.user.username || req.user.email;

    // Validation
    if (!bookId || rating === undefined || !content) {
        res.status(400);
        throw new Error("Book ID, rating (1-5), and review content are required.");
    }

    if (rating < 1 || rating > 5) {
        res.status(400);
        throw new Error("Rating must be between 1 and 5.");
    }

    // Check if reviews are disabled for this book
    const book = await Book.findById(bookId);
    if (!book) {
        res.status(404);
        throw new Error("Book not found");
    }

    if (book.reviewsDisabled) {
        res.status(403);
        throw new Error("Reviews are disabled for this book");
    }

    // Create new review document
    const review = new Review({
        book: bookId,
        user: userId,
        author: authorName,
        rating: parseInt(rating),
        content: content.trim(),
    });

    const createdReview = await review.save();
    res.status(201).json({
        message: "Review posted successfully",
        review: createdReview
    });
});

// @route GET /api/reviews/:bookId
// @desc Get all reviews for a specific book
// @access Public (Anyone can view reviews)
export const getReviewsByBookId = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        res.status(400);
        throw new Error("Book ID is required to fetch reviews.");
    }

    const reviews = await Review.find({ book: bookId })
        .populate('user', 'username email')
        .sort({ createdAt: -1 });

    res.json(reviews);
});

// @route GET /api/reviews/book/:bookId/stats
// @desc Get review statistics for a book (average rating, count)
// @access Public
export const getReviewStats = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        res.status(400);
        throw new Error("Book ID is required.");
    }

    const stats = await Review.aggregate([
        { $match: { book: new mongoose.Types.ObjectId(bookId) } },
        {
            $group: {
                _id: '$book',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
                ratingDistribution: { $push: '$rating' }
            }
        }
    ]);

    if (stats.length === 0) {
        return res.json({ averageRating: 0, reviewCount: 0 });
    }

    res.json(stats[0]);
});

// @route DELETE /api/reviews/:reviewId
// @desc Delete a review (own review, manager, or admin)
// @access Private
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        res.status(404);
        throw new Error("Review not found");
    }

    // Check if user owns the review or is manager/admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'manager' && req.user.role !== 'admin') {
        res.status(403);
        throw new Error("Not authorized to delete this review");
    }

    await Review.findByIdAndDelete(reviewId);
    res.json({ message: "Review deleted successfully" });
});

// @route PUT /api/reviews/:reviewId/warning
// @desc Add or update warning on a review (manager or admin)
// @access Private (manager or admin only)
export const addReviewWarning = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { warning } = req.body;

    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    if (!warning || !warning.trim()) {
        res.status(400);
        throw new Error("Warning message is required");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        res.status(404);
        throw new Error("Review not found");
    }

    // Update warning
    review.warning = warning.trim();
    review.warningAddedBy = req.user._id;
    await review.save();

    res.json({ message: "Warning added to review", review });
});

// @route PUT /api/reviews/:bookId/toggle-disable
// @desc Toggle reviews disabled status for a book (manager or admin)
// @access Private (manager or admin only)
export const toggleReviewsDisabled = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const book = await Book.findById(bookId);
    if (!book) {
        res.status(404);
        throw new Error("Book not found");
    }

    // Toggle the disabled status
    book.reviewsDisabled = !book.reviewsDisabled;
    await book.save();

    res.json({
        message: `Reviews ${book.reviewsDisabled ? 'disabled' : 'enabled'} for book`,
        reviewsDisabled: book.reviewsDisabled
    });
});
