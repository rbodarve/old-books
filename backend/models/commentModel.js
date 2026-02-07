import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    // Link to either BlogPost or Article
    contentType: {
        type: String,
        enum: ['BlogPost', 'Article'],
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'contentType'
    },
    // Link back to the user who posted the comment
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // The display name of the comment author (optional, but good for stability)
    author: {
        type: String,
        required: true,
    },
    // The actual comment text
    content: {
        type: String,
        required: true,
        trim: true,
    },
    // Warning added by manager or admin
    warning: {
        type: String,
        default: null,
        trim: true
    },
    // User who added the warning
    warningAddedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
}, {
    timestamps: true
});
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;