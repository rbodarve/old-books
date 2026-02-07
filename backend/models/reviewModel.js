import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Link back to the book
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    // Link back to the user who posted the review
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // The display name of the review author
    author: {
        type: String,
        required: true,
    },
    // Review rating (1-5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    // The actual review text
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

const Review = mongoose.model("Review", reviewSchema);
export default Review;
