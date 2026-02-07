import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    warning: {
        type: String,
        default: null,
        trim: true
    },
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