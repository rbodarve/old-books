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

## Simplification changes (2026-10-11)

These changes keep all URLs, API calls and visible pages the same. The backend models, routes and database collections are not changed. Backups of every changed or deleted file are in `C:\Users\rboda\backups\old-books-cuts-2026-10-11\`.

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
- **How to undo:** Copy the 5 deleted files and `App.js` back from the backup folder. Then delete `ContentList.js`, `ContentDetail.js` and `contentTypes.js`.

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
