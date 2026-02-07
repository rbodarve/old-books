export const getCoverImageUrl = (book, size = 'M') => {
    if (!book) return null;

    const isbn = book.isbn ? book.isbn.replace(/[^0-9Xx]/g, '') : null;
    const isbnUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg` : null;

    if (!book.coverImage) return isbnUrl;

    const isOpenLibraryId = book.coverImage.includes('openlibrary.org/b/id/');
    return isOpenLibraryId ? (isbnUrl || book.coverImage) : book.coverImage;
};
