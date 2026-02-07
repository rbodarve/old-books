import BlogPost from "../models/blogPostModel.js";
import mongoose from "mongoose";
// ===================================
// GET ALL POSTS (Used by HomePage.js)
// ===================================
export const getAllPosts = async (req, res) => {
try {
const posts = await BlogPost.find({}).populate('createdBy', 'username role').sort({ createdAt: -1 });
return res.status(200).json(posts);
} catch (err) {
console.error("Error fetching all posts:", err);
return res.status(500).json({ error: "Failed to fetch posts" });
}
};
// ===================================
// GET POST BY ID (Used by SinglePostView.js)
// ===================================
export const getPostById = async (req, res) => {
try {
const { id } = req.params;
if (!mongoose.Types.ObjectId.isValid(id)) {
return res.status(400).json({ message: "Invalid post ID" });
}
const post = await BlogPost.findById(id).populate('createdBy', 'username role');
if (!post) return res.status(404).json({ message: "Post not found" });
return res.status(200).json(post);
} catch (err) {
console.error("Error fetching single post:", err);
return res.status(500).json({ error: "Failed to fetch post" });
}
};
// ===================================
// CREATE POST (Used by CreatePostPage.js)
// ===================================
export const createPost = async (req, res) => {
try {
let { title, content } = req.body;
if (!title || !content) {
return res.status(400).json({ message: "Title and content are required" });
}
title = title.trim();
content = content.trim();
// Set author from authenticated user (manager or admin)
const newPost = new BlogPost({ 
title, 
content, 
author: req.user.username,
createdBy: req.user.id
});
await newPost.save();
return res.status(201).json({ message: "Post created successfully", post: newPost });
} catch (err) {
console.error("Error creating post:", err);
return res.status(500).json({ error: "Failed to create post" });
}
};
// Placeholder for other functions (Update/Delete)
// export const updatePost = async (req, res) => { /* ... */ };
// export const deletePost = async (req, res) => { /* ... */ };