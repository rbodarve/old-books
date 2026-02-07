# Old Books - Rare & Antique Books E-Commerce Platform

A full-stack e-commerce web application for buying and selling rare and antique books. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this platform features user authentication, book catalog management, shopping cart functionality, reviews, and a blog system.

## Features

- **User Authentication & Authorization**
  - Secure registration and login with JWT
  - Password encryption using bcrypt
  - Role-based access control (Admin/User)

- **Book Catalog**
  - Browse extensive collection of rare and antique books
  - Detailed book information with cover images
  - Search and filter functionality
  - Book categorization

- **Shopping Experience**
  - Interactive shopping cart
  - Book reviews and ratings
  - Comment system for community engagement

- **Admin Dashboard**
  - Complete CRUD operations for books
  - User management
  - Order tracking
  - Inventory management

- **Blog System**
  - Articles about rare books
  - Reading recommendations
  - Literary history content

## Tech Stack

### Frontend
- **React** (v19.2.0) - UI library
- **React Router DOM** (v7.9.6) - Client-side routing
- **Bootstrap** (v5.3.8) - UI framework
- **FontAwesome** - Icons
- **React Scripts** - Build tooling

### Backend
- **Node.js** with **Express.js** (v4.22.1) - Server framework
- **MongoDB** with **Mongoose** (v7.8.8) - Database
- **JWT** (jsonwebtoken v9.0.3) - Authentication
- **Bcrypt** (v6.0.0) - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## Project Structure

```
old-books/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── ssl/             # SSL certificates (not committed)
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   │   └── images/      # Book cover images
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Helper functions
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rbodarve/old-books.git
   cd old-books
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `backend/` directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/oldbooks
   
   # JWT Secret (use a strong random string)
   JWT_SECRET=your_jwt_secret_key_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # On Linux/Mac
   sudo service mongod start
   
   # Or if using MongoDB Atlas, use your connection string in .env
   ```

5. **Run the application**

   **Option 1: Run both servers separately**
   ```bash
   # Terminal 1 - Start backend server
   cd backend
   npm start
   
   # Terminal 2 - Start frontend development server
   cd frontend
   npm start
   ```

   **Option 2: Using HTTPS (if SSL certificates are configured)**
   ```bash
   cd backend
   npm run start:https
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Seeding the Database (Optional)

If you have a seed script:
```bash
cd backend
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Reviews
- `GET /api/reviews/:bookId` - Get reviews for a book
- `POST /api/reviews` - Create review (Authenticated users)

### Users
- `GET /api/users/profile` - Get user profile (Authenticated)
- `PUT /api/users/profile` - Update profile (Authenticated)

### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get blog post by ID
- `POST /api/blog` - Create blog post (Admin only)

## Features in Detail

### User Roles
- **Regular Users**: Browse books, add to cart, write reviews, read blog
- **Admin Users**: Full CRUD on books, manage users, create blog posts

### Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Protected routes with authentication middleware
- CORS configuration
- Environment variable protection

## Build for Production

```bash
# Build frontend
cd frontend
npm run build

# The build folder will be created with optimized production files
# Serve these static files from your backend or hosting platform
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Authors

- **rbodarve** - [GitHub Profile](https://github.com/rbodarve)

## Acknowledgments

- README template inspired by [awesome-readme](https://github.com/matiassingers/awesome-readme) by [Matias Singers](https://github.com/matiassingers)
- Book cover images from public domain sources
- Built with Create React App
- Icons by [FontAwesome](https://fontawesome.com/)

## Support

For support, please open an issue in the GitHub repository.

---

**Note**: This is a project for educational and demonstration purposes. Make sure to configure proper security measures before deploying to production.
