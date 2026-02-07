import express from 'express';
import { createComment, getComments, deleteComment, getCommentsByPostId, getAllComments, addCommentWarning, toggleCommentsDisabled } from '../controllers/commentController.js';
import { protect, admin, managerOrAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

// Get all comments (admin only)
router.get('/', protect, admin, getAllComments);

// Create comment (requires authentication)
router.post('/', protect, createComment);

// Add warning to comment (manager or admin)
router.put('/:commentId/warning', protect, managerOrAdmin, addCommentWarning);

// Toggle comments disabled (manager or admin)
router.put('/:contentType/:contentId/toggle-disable', protect, managerOrAdmin, toggleCommentsDisabled);

// Delete comment (requires authentication)
// Must come before GET routes to avoid parameter confusion
router.delete('/:commentId', protect, deleteComment);

// Get comments - specific routes for articles and blogposts with explicit content type
// Format: /Article/:id or /BlogPost/:id
router.get('/:contentType/:contentId', (req, res, next) => {
    // Only match if contentType is Article or BlogPost
    if (['Article', 'BlogPost'].includes(req.params.contentType)) {
        getComments(req, res, next);
    } else {
        next();
    }
});

// Legacy route for backward compatibility (single parameter)
router.get('/:postId', getCommentsByPostId);

export default router;