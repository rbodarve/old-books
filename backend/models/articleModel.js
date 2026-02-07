import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    category: {
        type: String,
        enum: ['Tips', 'How-To', 'News', 'Reviews', 'Industry Insights', 'Other'],
        default: 'Other'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

const Article = mongoose.model("Article", articleSchema);
export default Article;
