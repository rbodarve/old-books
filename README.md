# Old Books - Rare & Antique Books E-Commerce Platform

A full-stack e-commerce web application for buying and selling rare and antique books. Built with the MERN stack (MongoDB, Express.js, React, Node.js), this platform features user authentication, book catalog management, shopping cart functionality, reviews, and a blog system.

## Course Context

This application is the course project for **COM231 – CTINASSL (Information Assurance and Security)**, Term 2, AY 2025–2026. The course documentation calls the application **Old Store Collection**. It was submitted on February 13, 2026.

### Project brief

The course asked each team to build a small-to-medium business web application, for example an e-commerce site. The application had to follow secure coding practices and use web server hardening techniques.

### Deliverables

1. A documentation report with these chapters:
   1. Introduction
   2. Web application screen designs
   3. Threat model
   4. Secure coding practices implementation
   5. Server hardening techniques implementation
   6. Web vulnerability assessment report (OWASP ZAP, initial and post)
   7. Individual reflection
2. A video presentation with a walkthrough of the application, the threat model, the security fixes, and the ZAP reports.

### Security work done for the course

```
Build app ──► Initial OWASP ZAP scan ──► STRIDE threat model ──► Fix code and server ──► Post ZAP scan
```

- **Threat model:** STRIDE. It covers 4 user roles (visitor, customer, manager, admin) and the trust boundary between internet users and the backend API and database.
- **Initial ZAP scan:** 13 alerts. 5 were Medium, 4 were Low and 4 were Informational. Examples: no Content Security Policy, CORS misconfiguration, HTTP only, no anti-clickjacking header, and an `X-Powered-By` header leak.
- **Fixes:** `backend/server.js` disables `X-Powered-By` and sets these headers:
  - `Strict-Transport-Security` (HSTS)
  - `Content-Security-Policy` with all directives defined
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: no-store` for sensitive responses

  The backend also restricts CORS origins. For the course, it also ran over HTTPS. The current setup uses HTTP only (see [Run the application](#getting-started)).
- **Post ZAP scan:** The report marks all 12 mitigations as implemented.

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
- **express-async-handler** (v1.2.0) - Passes errors from async route handlers to Express
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

   Create a `.env` file in the `backend/` directory. `backend/.env.example` lists all variables:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/oldbooks
   
   # JWT Secret (use a strong random string)
   JWT_SECRET=your_jwt_secret_key_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Allowed frontend origins for CORS, comma-separated.
   # Without this variable, only https://localhost:3000 is allowed.
   CORS_ORIGINS=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # On Linux/Mac
   sudo service mongod start
   
   # Or if using MongoDB Atlas, use your connection string in .env
   ```

5. **Run the application**

   Run the backend and the frontend in two terminals:
   ```bash
   # Terminal 1 - Start backend server
   cd backend
   npm start
   
   # Terminal 2 - Start frontend development server
   cd frontend
   npm start
   ```

   The frontend calls the backend at `http://localhost:5000`, so run the backend over HTTP with `npm start`. The `start:https`, `start:http` and `dev:https` scripts in `backend/package.json` use Unix-style environment variables. They do not run in PowerShell or cmd.

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
- `GET /api/reviews/book/:bookId` - Get reviews for a book
- `GET /api/reviews/book/:bookId/stats` - Get rating statistics for a book
- `POST /api/reviews` - Create review (Authenticated users)
- `DELETE /api/reviews/:reviewId` - Delete review (Owner, Manager or Admin)
- `PUT /api/reviews/:reviewId/warning` - Add a warning to a review (Manager or Admin)
- `PUT /api/reviews/:bookId/toggle-disable` - Turn reviews for a book on or off (Manager or Admin)

### Users
- `GET /api/users` - Get all users (Admin only)

### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:id` - Get blog post by ID
- `POST /api/blog` - Create blog post (Manager or Admin)

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create article (Manager or Admin)
- `PUT /api/articles/:id` - Update article (Admin only)
- `DELETE /api/articles/:id` - Delete article (Admin only)

### Comments
- `GET /api/comments/:contentType/:contentId` - Get comments for an article or blog post
- `GET /api/comments/:postId` - Get comments by post ID (legacy)
- `GET /api/comments` - Get all comments (Admin only)
- `POST /api/comments` - Create comment (Authenticated users)
- `DELETE /api/comments/:commentId` - Delete comment (Owner, Manager or Admin)
- `PUT /api/comments/:commentId/warning` - Add a warning to a comment (Manager or Admin)
- `PUT /api/comments/:contentType/:contentId/toggle-disable` - Turn comments on or off (Manager or Admin)

## Features in Detail

### User Roles
- **Regular Users**: Browse books, add to cart, write reviews, read blog
- **Manager Users**: Create articles and blog posts, add warnings to reviews and comments, turn reviews and comments on or off, delete any review or comment
- **Admin Users**: Everything a manager can do, plus full CRUD on books, edit and delete articles, list users

### Security Features
- Password hashing with bcryptjs
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

## Simplification changes (2026-10-11)

These changes keep all URLs, API calls and visible pages the same. The backend models, routes and database collections are not changed.

### Fix: declare the missing `express-async-handler` dependency

- **What changed:** `express-async-handler` (`^1.2.0`) is now listed in `backend/package.json`.
- **Files:** `backend/package.json`, `backend/package-lock.json`, `README.md` (Tech Stack).
- **Why:** `backend/controllers/commentController.js`, `backend/controllers/reviewController.js` and `backend/routes/articleRoutes.js` import this package. It was not declared, so `npm start` in `backend/` failed with `ERR_MODULE_NOT_FOUND`.
- **How to undo:** In `backend/`, run `npm uninstall express-async-handler`. The backend then fails to start again.

### Cut 1: remove the unused `web-vitals` package

- **What changed:** `web-vitals` is removed from the frontend dependencies.
- **Files:** `frontend/package.json`, `frontend/package-lock.json`.
- **Why:** No file in `frontend/src` or `frontend/public` imports `web-vitals` or `reportWebVitals`. The package was installed but never used.
- **How to undo:** In `frontend/`, run `npm install web-vitals@^5.1.0`.

### Cut 2: merge the duplicated Article and Blog Post components

- **What changed:** The article pages and the blog post pages now use one shared list component and one shared detail component. Each content type passes its settings as a `type` prop: the API path, the comment type, the route prefixes, the labels, the Bootstrap colour, and whether it has a category. The duplicate `/blog-post/:id` route in `App.js` is removed. The first `/blog-post/:id` route was the one in use, so routing does not change. Each route gives its component a different `key`, so React remounts the component when you go from articles to blog posts.
- **Files:**
  - Added: `frontend/src/components/ContentList.js`, `frontend/src/components/ContentDetail.js`, `frontend/src/components/contentTypes.js`.
  - Changed: `frontend/src/App.js` (imports and the 4 article and blog post routes).
  - Deleted: `frontend/src/components/ArticlesList.js`, `BlogPostsList.js`, `ArticleDetail.js`, `BlogPostDetail.js`, and `BlogPost.js`. No file imported `BlogPost.js`.
- **Why:** The two list files and the two detail files differed only in names, API paths, labels, colours and the article `category` field. One copy of the code is easier to maintain than two.
- **How to undo:** In `frontend/src/`, run `git checkout 47527cd~1 -- App.js components/ArticlesList.js components/BlogPostsList.js components/ArticleDetail.js components/BlogPostDetail.js components/BlogPost.js`. Then delete `ContentList.js`, `ContentDetail.js` and `contentTypes.js`.

### Ignore the `.claude/` folder

- **What changed:** `.claude/` is added to `.gitignore`.
- **Files:** `.gitignore`.
- **Why:** `.claude/` holds local Claude Code settings. It is not part of the application.
- **How to undo:** Delete the `.claude/` line and its comment from `.gitignore`.

## Suggestions (2026-10-13)

These fixes are suggestions only. No code file in this repository is changed. Each fix was tried in a clean copy of commit `b0e8c14` on Windows 11 with Node v26.3.0, where npm runs scripts in `cmd.exe`. The output below comes from that copy.

### Fix: replace `nodemon` with `node --watch` in the `dev` script

- **What:** The `dev` script calls `nodemon`, but `nodemon` is not in `backend/package.json`.
- **Where:** `backend/package.json:18`, README "Prerequisites".
- **Why:** Node 18.11 and later restart on file changes with the built-in `--watch` flag. This fix needs no new dependency, but it raises the minimum Node version. Rejected option: add `nodemon` as a devDependency. That adds a package for a feature that Node already has.
- **Diff:**
  ```diff
  --- backend/package.json
  -    "dev": "nodemon server.js",
  +    "dev": "node --watch server.js",
  --- README.md (Prerequisites)
  -- **Node.js** (v14 or higher)
  +- **Node.js** (v18.11 or higher)
  ```
- **Before:** `npm run dev` → `'nodemon' is not recognized as an internal or external command`, exit 1.
- **After:** `npm run dev` → `> node --watch server.js` … `MongoDB connected successfully` … `Server running on http://localhost:5000`.

### Fix: use the article categories from the model in the route and the form

- **What:** The route and the form use the category `General`, and the form also offers `Events`. The enum in the model has neither value, so Mongoose rejects such an article.
- **Where:** `backend/models/articleModel.js:9` (enum, unchanged), `backend/routes/articleRoutes.js:33`, `frontend/src/components/contentTypes.js:15`, `frontend/src/components/ContentList.js:7`, `:131-135` and `:171`.
- **Why:** The model enum is the source of truth, and its default is already `Other`. The route leaves an empty category as `undefined`, so Mongoose applies that default. The form reads the values from `contentTypes.js`, like `BOOK_CATEGORIES` in `BookCatalog.js`. Rejected option: add `General` and `Events` to the enum. Then `General` and `Other` would both mean "no category".
- **Diff:**
  ```diff
  --- backend/routes/articleRoutes.js
  -        category: category || "General",
  +        category: category || undefined, // undefined lets the schema default apply
  --- frontend/src/components/contentTypes.js
  -    hasCategory: true
  +    hasCategory: true,
  +    // Same values as the enum in backend/models/articleModel.js
  +    categories: ['Tips', 'How-To', 'News', 'Reviews', 'Industry Insights', 'Other']
  --- frontend/src/components/ContentList.js
  -    const emptyForm = type.hasCategory ? { title: '', content: '', category: 'General' } : { title: '', content: '' };
  +    const emptyForm = type.hasCategory ? { title: '', content: '', category: 'Other' } : { title: '', content: '' };
  ...
  -                                        <option value="General">General</option>
  -                                        <option value="News">News</option>
  -                                        <option value="Tips">Tips</option>
  -                                        <option value="Reviews">Reviews</option>
  -                                        <option value="Events">Events</option>
  +                                        {type.categories.map(c => <option key={c} value={c}>{c}</option>)}
  ...
  -                                    {type.hasCategory && <span className="badge bg-primary mb-2">{item.category || 'General'}</span>}
  +                                    {type.hasCategory && <span className="badge bg-primary mb-2">{item.category}</span>}
  ```
- **Before:** A script ran `new Article({...}).validateSync()` for every category that the form and the route can send. No database is needed. `General` → ``category: `General` is not a valid enum value``. `Events` → same error. `News`, `Tips`, `Reviews` → valid.
- **After:** The same script reads `categories` from `contentTypes.js`. `Tips`, `How-To`, `News`, `Reviews`, `Industry Insights`, `Other` → all valid. An empty or missing category → `Other`, valid. `npm run build` in `frontend/` → `Compiled successfully.`

### Fix: remove the Unix-style environment variable scripts

- **What:** `start:https`, `start:http` and `dev:https` use `USE_HTTPS=true node ...`. `cmd.exe` does not support this syntax.
- **Where:** `backend/package.json:16`, `:17`, `:19`. `backend/server.js:134` reads `process.env.USE_HTTPS === 'true'`. README "Installation" step 5 (the note under the commands).
- **Why:** `start:http` does the same as `npm start`, because HTTP is the default. For HTTPS, set the variable in the shell. npm passes it on to `node`. This needs no new package. Rejected option: `cross-env`. It adds a dependency for 2 scripts.
- **Diff:**
  ```diff
  --- backend/package.json
  -    "start:https": "USE_HTTPS=true node server.js",
  -    "start:http": "USE_HTTPS=false node server.js",
  -    "dev:https": "USE_HTTPS=true nodemon server.js",
  --- README.md (note under step 5)
  -   ... The `start:https`, `start:http` and `dev:https` scripts in `backend/package.json` use Unix-style environment variables. They do not run in PowerShell or cmd.
  +   ... For HTTPS (needs `backend/ssl/server.key` and `server.cert`), set `USE_HTTPS` before `npm start` (or `npm run dev`):
  +   - PowerShell: `$env:USE_HTTPS='true'; npm start`
  +   - cmd: `set USE_HTTPS=true&& npm start` (no space before `&&`)
  +   The variable stays set until you close the terminal. Open a new terminal to go back to HTTP.
  ```
- **Before:** `npm run start:http` → `'USE_HTTPS' is not recognized as an internal or external command`, exit 1.
- **After:** In PowerShell, `$env:USE_HTTPS='true'; npm start` → `✓ HTTPS Server running on https://localhost:5000` and `✓ HTTP redirect server running on http://localhost:5080 -> HTTPS`. Without the variable, `npm run dev` → `Server running on http://localhost:5000`. In cmd, `set USE_HTTPS=true&& node -e "…"` gives node the value `"true"`. With a space before `&&`, node gets `"true "`, so `server.js` does not use HTTPS.

### Fix: remove the `seed` script and the seeding section

- **What:** `npm run seed` runs `node seeds.js`, but `backend/seeds.js` does not exist.
- **Where:** `backend/package.json:20`, README "Seeding the Database (Optional)".
- **Why:** `git log --all -- '*seed*'` returns no commits. The file never existed in this repository, so there is nothing to restore. Rejected option: write a new seed script. That is a new feature, not a fix.
- **Diff:**
  ```diff
  --- backend/package.json
  -    "seed": "node seeds.js"
  --- README.md
  -### Seeding the Database (Optional)
  -
  -If you have a seed script:
  -```bash
  -cd backend
  -npm run seed
  -```
  ```
  The script above `seed` is then the last entry, so delete its trailing comma.
- **Before:** `npm run seed` → `Error: Cannot find module '...\backend\seeds.js'`.
- **After:** The script is gone. `npm run seed` → `npm error Missing script: "seed"`.

### Other notes

- Rejected defects: none. All 4 suspected defects are confirmed above.
- `MongoDB connected successfully` is printed twice at start: `backend/config/db.js:13` prints it and so does `backend/server.js:147` or `:161`. The message is cosmetic, so this README suggests no change for it.

## Review notes (2026-10-14)

This is a post-course review. No code file in this repository is changed. The notes do not repeat the items in "Suggestions (2026-10-13)".

### Known issues

Each row names the defect, its place in the code and one fix idea.

**High**

| # | Where | Defect | Fix idea |
|---|---|---|---|
| E1 | `backend/server.js:117` | The error handler reads only `err.status` and `err.statusCode`. Controllers set `res.status(400/403/404)` and then throw, so these errors return 500. Mongoose `CastError` and `ValidationError` also return 500. | Use `res.statusCode` when it is 400 or higher. Map `CastError` and `ValidationError` to 400. |
| E2 | `backend/controllers/authController.js:12,27` | `register` takes `role` from the request body. Anyone can register as `admin`. | Ignore `role` in the body. Always create a `user`. |
| E3 | `backend/controllers/userController.js:7` | `GET /api/users` returns the password hash of every user. | Add `.select("-password")` to the query. |
| X1 | `backend/server.js` | No route has a rate limit. An attacker can try passwords on `/api/auth/login` at full speed. | Limit the requests per IP address on `/api/auth`. |

**Medium**

| # | Where | Defect | Fix idea |
|---|---|---|---|
| E4 | `backend/server.js:120-123` | With `NODE_ENV=development`, the error response contains the stack trace and absolute file paths. | Write the stack trace to the log only. |
| E5 | `backend/controllers/bookController.js:49-54` | The `search` value goes into `$regex` without escaping. `?search=(` returns 500. | Escape the regex special characters first. |
| E6 | `backend/controllers/bookController.js:16-41` | `?minPrice=abc` makes an empty price filter, and the query returns 500. | Check that the value is a number. Return 400 if it is not. |
| E7 | `backend/middleware/authMiddleware.js:4`, `backend/controllers/authController.js:5`, `backend/server.js:143` | The code has a fallback JWT secret and a fallback SSL passphrase. Without `JWT_SECRET`, anyone can sign an admin token. | Stop the server at start when `JWT_SECRET` is missing. |
| E8 | `backend/server.js:72-77` | A request from a disallowed origin returns 500. | Call `callback(null, false)` instead of passing an error. |
| F1 | `frontend/src/App.js:38-45` | The user is restored from `sessionStorage` only after the first render. A reload of a protected page goes to `/login`. | Read `sessionStorage` in the `useState` initializer. |
| F2 | `frontend/src/components/ReviewSection.js:229` | The owner check compares `currentUser._id`. The login response has `id`, so users never see Delete on their own review. | Compare `currentUser.id`. |
| F3 | `frontend/src/components/ContentDetail.js:261` | The same `_id` mismatch hides Delete on a user's own comment. | Compare `currentUser.id`. |
| X2 | `backend/controllers/authController.js:8` | A token is valid for 30 days and cannot be revoked. | Use a shorter expiry. |
| X3 | `backend/controllers/reviewController.js:64`, `backend/controllers/bookController.js:72` | Public routes return the email address of reviewers and book creators. | Populate `username` only. |

**Low**

| # | Where | Defect | Fix idea |
|---|---|---|---|
| E9 | `backend/controllers/bookController.js:11-13,44-46` | `?category[$ne]=x` passes a query operator to MongoDB and returns all books. | Accept string values only. |
| E10 | `backend/controllers/bookController.js:83-128,174` | An unknown category, a numeric ISBN or a duplicate ISBN returns 500. | Validate the body. Map the duplicate-key error to 409. |
| E11 | `backend/controllers/bookController.js:157,166`, `backend/controllers/reviewController.js:23,45` | `"12abc"` is stored as price 12, and rating 4.7 is stored as 4. | Reject values that are not valid numbers. |
| E12 | `backend/controllers/bookController.js:191` | Deleting a book keeps its reviews. | Delete the reviews of the book too. |
| E13 | `backend/controllers/commentController.js:34` | Whitespace-only content passes the check and then fails the schema with 500. The same happens in `createReview`. | Check `content.trim()`. |
| E14 | `backend/controllers/authController.js:21,53` | A password or email that is not a string returns 500. | Check the types. Return 400. |
| E15 | `backend/routes/articleRoutes.js:43-46` | A manager can create an article but cannot edit or delete it. The route comment says this is intended. | No change, or allow the owner. |
| E16 | `frontend/src/components/ReviewSection.js:23` | The stars use Font Awesome classes, but no Font Awesome CSS is loaded. The stars are empty. | Use a text star (★). |
| E17 | `frontend/src/config.js` | `REACT_APP_API_URL` has no effect. No file imports `config.js`, and 20 calls use `http://localhost:5000`. | Import `API_URL` from `config.js`. |
| F11 | `frontend/src/components/Dashboard.js:3`, `frontend/src/App.js:92` | `/user-dashboard` shows "Access Denied" to every non-admin user. | Remove the route (see simplification idea 10). |

### Simplification ideas

1. Merge `CreateBookPage.js` and `AdminBookEdit.js` in `frontend/src/pages/admin/` into one form component (about -200 lines).
2. Merge `PublicHome.js` and `BookCatalog.js` in `frontend/src/components/` into one catalog component (about -200 lines).
3. Move the book category and condition lists, copied in 4 files, into one module like `contentTypes.js`.
4. Import `API_URL` from `frontend/src/config.js` instead of 20 hardcoded URLs (see E17).
5. Remove `frontend/src/utils/coverImage.js`. No file imports it.
6. Remove the `bcrypt` dependency from `backend/package.json`. The code imports only `bcryptjs`.
7. Remove the three `@fortawesome` packages from `frontend/package.json`. No file imports them.
8. Remove the 7 `if (!req.user)` checks in the review and comment controllers. `protect` already returns 401.
9. Use the `protect, admin` middleware for article PUT and DELETE in `backend/routes/articleRoutes.js`, as in `bookRoutes.js`.
10. Remove the legacy `GET /api/comments/:postId` route and `getCommentsByPostId`. The frontend does not call it.
11. Remove the `/user-dashboard` route and `Dashboard.js`. No link points to them.
12. Use `asyncHandler` in the book and blog controllers instead of one `try`/`catch` per handler (after the E1 fix).
13. Remove `useNewUrlParser`, `useUnifiedTopology` and the second `dotenv.config()` from `backend/config/db.js`.
14. Remove the duplicate header removal and the unused `exposedHeaders` in `backend/server.js`.
15. Export the JWT secret lookup from one file instead of two (see E7).

### Tested

The API was tested with HTTP requests to the real `backend/server.js` (Node v26.3.0) and a throwaway local MongoDB database.

- 28 targeted requests: 5 gave the expected result.
- 300 random requests with valid and invalid input: 56 returned 500. Every 500 maps to E1, E5, E6 or E13.

E7, F1–F3, F11, E16, E17 and X1–X3 come from reading the code.

### Not tested

- The frontend in a browser.
- HTTPS mode.
- Token expiry.
- Concurrent writes.

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
