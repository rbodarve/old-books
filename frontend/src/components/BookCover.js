import React, { useEffect, useMemo, useState } from 'react';

// Map ISBNs to local cover images
const LOCAL_COVERS = {
    '9780451524932': '/images/covers/1984_first_edition_cover.jpg',
    '9780547928228': '/images/covers/hobbit.jpg',
    '9780062073490': '/images/covers/Murder_on_the_Orient_Express_First_Edition_Cover_1934.jpg',
    '9780141439570': '/images/covers/wuthering-heights-124.jpg',
    '9780316769480': '/images/covers/960px-The_Catcher_in_the_Rye_(1951,_first_edition_cover).jpg',
    '9780441172663': '/images/covers/Dune-Frank_Herbert_(1965)_First_edition.jpg',
    '9780141440850': '/images/covers/jane-eyre-annotated.jpg'
};

const buildIsbnCoverUrl = (book, size = 'M') => {
    if (!book?.isbn) return null;
    // Remove all hyphens and non-digit characters except X
    const isbn = book.isbn.replace(/[^0-9Xx]/g, '');
    if (!isbn) return null;
    
    // Check if we have a local cover first
    if (LOCAL_COVERS[isbn]) {
        return LOCAL_COVERS[isbn];
    }
    
    // Use size L for better quality
    const displaySize = size === 'M' ? 'L' : size;
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${displaySize}.jpg`;
};

const extractIsbn = (book) => {
    if (!book?.isbn) return null;
    const isbn = book.isbn.replace(/[^0-9Xx]/g, '');
    return isbn || null;
};

export default function BookCover({ book, size = 'M', className, style, alt, onClick, fallback = null }) {
    const isbnUrl = useMemo(() => buildIsbnCoverUrl(book, size), [book, size]);
    const fallbackUrl = book?.coverImage || null;
    const isbn = useMemo(() => extractIsbn(book), [book]);

    // Always prefer ISBN URL first
    const [src, setSrc] = useState(isbnUrl);
    const [triedGoogle, setTriedGoogle] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setSrc(isbnUrl);
        setTriedGoogle(false);
        setImageError(false);
    }, [isbnUrl]);

    useEffect(() => {
        if (!src && isbn && !triedGoogle) {
            const controller = new AbortController();
            const fetchGoogleCover = async () => {
                try {
                    const response = await fetch(
                        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
                        { signal: controller.signal }
                    );
                    if (!response.ok) throw new Error('Google Books lookup failed');
                    const data = await response.json();
                    const image = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
                    if (image) {
                        const httpsImage = image.replace('http://', 'https://');
                        setSrc(httpsImage);
                    }
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        setSrc(null);
                    }
                } finally {
                    setTriedGoogle(true);
                }
            };
            fetchGoogleCover();
            return () => controller.abort();
        }
    }, [src, isbn, triedGoogle]);

    const handleError = () => {
        if (imageError) return; // Already tried fallbacks
        setImageError(true);
        
        // Try fallback URL if different from ISBN URL
        if (fallbackUrl && fallbackUrl !== isbnUrl && src === isbnUrl) {
            setSrc(fallbackUrl);
            return;
        }
        
        // If fallback also fails or doesn't exist, try Google Books
        if (!triedGoogle && isbn) {
            setSrc(null); // This will trigger Google Books fetch
        }
    };

    if (!src) return fallback;

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            onClick={onClick}
            onError={handleError}
            crossOrigin="anonymous"
        />
    );
}
