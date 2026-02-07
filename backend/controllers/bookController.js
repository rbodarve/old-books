import Book from "../models/bookModel.js";
import mongoose from "mongoose";

// ===================================
// GET ALL BOOKS (Used by HomePage.js)
// ===================================
export const getAllBooks = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, condition, search } = req.query;
        let filter = {};

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Price range filter with validation
        if (minPrice || maxPrice) {
            filter.price = {};
            
            let parsedMin = minPrice ? parseFloat(minPrice) : null;
            let parsedMax = maxPrice ? parseFloat(maxPrice) : null;
            
            // Validate that prices are non-negative
            if (parsedMin !== null && !isNaN(parsedMin)) {
                if (parsedMin < 0) {
                    return res.status(400).json({ error: "Minimum price cannot be negative" });
                }
                filter.price.$gte = parsedMin;
            }
            
            if (parsedMax !== null && !isNaN(parsedMax)) {
                if (parsedMax < 0) {
                    return res.status(400).json({ error: "Maximum price cannot be negative" });
                }
                filter.price.$lte = parsedMax;
            }
            
            // Validate that max price is not less than min price
            if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
                return res.status(400).json({ error: "Maximum price must be greater than or equal to minimum price" });
            }
        }

        // Condition filter
        if (condition) {
            filter.condition = condition;
        }

        // Search filter (title, author, isbn)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });
        return res.status(200).json(books);
    } catch (err) {
        console.error("Error fetching all books:", err);
        return res.status(500).json({ error: "Failed to fetch books" });
    }
};

// ===================================
// GET BOOK BY ID (Used by SingleBookView.js)
// ===================================
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }
        const book = await Book.findById(id).populate('createdBy', 'username email');
        if (!book) return res.status(404).json({ message: "Book not found" });
        return res.status(200).json(book);
    } catch (err) {
        console.error("Error fetching single book:", err);
        return res.status(500).json({ error: "Failed to fetch book" });
    }
};

// ===================================
// CREATE BOOK (Used by CreateBookPage.js - Admin Only)
// ===================================
export const createBook = async (req, res) => {
    try {
        const { title, author, isbn, publicationDate, description, category, condition, price, quantity, coverImage } = req.body;

        // Validation
        if (!title || !author || !isbn || !publicationDate || !description || !category || !condition || price === undefined || quantity === undefined) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }
        
        // Validate price
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: "Price must be a non-negative number" });
        }
        
        // Validate quantity
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({ message: "Quantity must be a non-negative integer" });
        }

        // Check for duplicate ISBN
        const existingBook = await Book.findOne({ isbn: isbn.trim() });
        if (existingBook) {
            return res.status(400).json({ message: "Book with this ISBN already exists" });
        }

        const newBook = new Book({
            title: title.trim(),
            author: author.trim(),
            isbn: isbn.trim(),
            publicationDate,
            description: description.trim(),
            category,
            condition,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            coverImage: coverImage || null,
            createdBy: req.user._id,
        });

        await newBook.save();
        return res.status(201).json({ message: "Book created successfully", book: newBook });
    } catch (err) {
        console.error("Error creating book:", err);
        return res.status(500).json({ error: "Failed to create book" });
    }
};

// ===================================
// UPDATE BOOK (Admin Only)
// ===================================
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, isbn, publicationDate, description, category, condition, price, quantity, coverImage } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Update fields if provided
        if (title) book.title = title.trim();
        if (author) book.author = author.trim();
        if (isbn) book.isbn = isbn.trim();
        if (publicationDate) book.publicationDate = publicationDate;
        if (description) book.description = description.trim();
        if (category) book.category = category;
        if (condition) book.condition = condition;
        
        // Validate and update price
        if (price !== undefined) {
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({ message: "Price must be a non-negative number" });
            }
            book.price = parsedPrice;
        }
        
        // Validate and update quantity
        if (quantity !== undefined) {
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity < 0) {
                return res.status(400).json({ message: "Quantity must be a non-negative integer" });
            }
            book.quantity = parsedQuantity;
        }
        if (coverImage) book.coverImage = coverImage;

        await book.save();
        return res.status(200).json({ message: "Book updated successfully", book });
    } catch (err) {
        console.error("Error updating book:", err);
        return res.status(500).json({ error: "Failed to update book" });
    }
};

// ===================================
// DELETE BOOK (Admin Only)
// ===================================
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        const book = await Book.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({ message: "Book deleted successfully" });
    } catch (err) {
        console.error("Error deleting book:", err);
        return res.status(500).json({ error: "Failed to delete book" });
    }
};
