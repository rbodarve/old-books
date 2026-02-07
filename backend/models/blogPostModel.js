import mongoose from "mongoose";
const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    commentsDisabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;