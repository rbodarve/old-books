import Comment from '../models/commentModel.js';
import Article from '../models/articleModel.js';
import BlogPost from '../models/blogPostModel.js';
import asyncHandler from 'express-async-handler';

// Get comments for an article or blogpost
export const getComments = asyncHandler(async (req, res) => {
    const { contentType, contentId } = req.params;

    if (!['Article', 'BlogPost'].includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type" });
    }

    const comments = await Comment.find({
        contentType: contentType,
        contentId: contentId
    }).sort({ createdAt: -1 });

    res.json(comments);
});

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
    const { contentType, contentId, content } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User data missing" });
    }

    if (!['Article', 'BlogPost'].includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type" });
    }

    if (!content || !contentId) {
        return res.status(400).json({ message: "Content and contentId are required" });
    }

    // Verify the content exists
    let content_obj;
    if (contentType === 'Article') {
        content_obj = await Article.findById(contentId);
    } else {
        content_obj = await BlogPost.findById(contentId);
    }

    if (!content_obj) {
        return res.status(404).json({ message: `${contentType} not found` });
    }

    // Check if comments are disabled
    if (content_obj.commentsDisabled) {
        return res.status(403).json({ message: "Comments are disabled for this content" });
    }

    const comment = new Comment({
        contentType,
        contentId,
        user: req.user._id,
        author: req.user.username || req.user.email,
        content
    });

    const savedComment = await comment.save();

    // Add comment to the article/blogpost
    if (contentType === 'Article') {
        await Article.findByIdAndUpdate(contentId, { $push: { comments: savedComment._id } });
    } else {
        await BlogPost.findByIdAndUpdate(contentId, { $push: { comments: savedComment._id } });
    }

    res.status(201).json(savedComment);
});

// Delete a comment
export const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user owns the comment or is manager/admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "manager" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove comment from article/blogpost
    if (comment.contentType === 'Article') {
        await Article.findByIdAndUpdate(comment.contentId, { $pull: { comments: comment._id } });
    } else {
        await BlogPost.findByIdAndUpdate(comment.contentId, { $pull: { comments: comment._id } });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: "Comment deleted" });
});

// Legacy functions for backward compatibility
export const getCommentsByPostId = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ message: "Post ID is required" });
    }
    const comments = await Comment.find({ contentId: postId }).sort({ createdAt: -1 });
    res.json(comments);
});

// Get all comments (admin only)
export const getAllComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find()
        .populate('user', 'username email')
        .sort({ createdAt: -1 });
    res.json(comments);
});

// Add or update warning on a comment (manager or admin)
export const addCommentWarning = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { warning } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!warning || !warning.trim()) {
        return res.status(400).json({ message: "Warning message is required" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    // Update warning
    comment.warning = warning.trim();
    comment.warningAddedBy = req.user._id;
    await comment.save();

    res.json({ message: "Warning added to comment", comment });
});

// Toggle comments disabled status for an article or blogpost (manager or admin)
export const toggleCommentsDisabled = asyncHandler(async (req, res) => {
    const { contentType, contentId } = req.params;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!['Article', 'BlogPost'].includes(contentType)) {
        return res.status(400).json({ message: "Invalid content type" });
    }

    // Find and update the content
    let content_obj;
    if (contentType === 'Article') {
        content_obj = await Article.findById(contentId);
    } else {
        content_obj = await BlogPost.findById(contentId);
    }

    if (!content_obj) {
        return res.status(404).json({ message: `${contentType} not found` });
    }

    // Toggle the disabled status
    content_obj.commentsDisabled = !content_obj.commentsDisabled;
    await content_obj.save();

    res.json({
        message: `Comments ${content_obj.commentsDisabled ? 'disabled' : 'enabled'} for ${contentType}`,
        commentsDisabled: content_obj.commentsDisabled
    });
});
