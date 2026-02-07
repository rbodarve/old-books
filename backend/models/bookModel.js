import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    publicationDate: { type: Date, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: [
            'Fiction',
            'Mystery',
            'Romance',
            'Science Fiction',
            'Fantasy',
            'History',
            'Biography',
            'Self-Help',
            'Poetry',
            'Children',
            'Young Adult',
            'Non-Fiction',
            'Classics',
            'Literary Fiction',
            'Horror',
            'Adventure',
            'Other'
        ],
        required: true,
    },
    condition: {
        type: String,
        enum: ['Like New', 'Good', 'Fair', 'Poor'],
        required: true,
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    coverImage: { type: String, default: null },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviewsDisabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);
export default Book;
