import express from "express";
import asyncHandler from "express-async-handler";
import Article from "../models/articleModel.js";
import { protect, managerOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all articles
router.get("/", asyncHandler(async (req, res) => {
    const articles = await Article.find().populate('createdBy', 'username role').sort({ createdAt: -1 });
    res.json(articles);
}));

// Get single article by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id).populate('createdBy', 'username role');
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
}));

// Create article (manager or admin)
router.post("/", protect, managerOrAdmin, asyncHandler(async (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content required" });
    }

    const article = new Article({
        title,
        content,
        category: category || "General",
        author: req.user.username,
        createdBy: req.user.id
    });

    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
}));

// Update article (admin only)
router.put("/:id", protect, asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    if (article.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this article" });
    }

    const { title, content, category } = req.body;
    article.title = title || article.title;
    article.content = content || article.content;
    article.category = category || article.category;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
}));

// Delete article (admin only)
router.delete("/:id", protect, asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
        return res.status(404).json({ message: "Article not found" });
    }

    if (article.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this article" });
    }

    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted" });
}));

export default router;
