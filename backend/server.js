import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
import fs from "fs";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.disable('x-powered-by');

const securityHeaders = (req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', 
        "default-src 'none'; " +
        "script-src 'self'; " +
        "style-src 'self'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "manifest-src 'self'; " +
        "media-src 'none'; " +
        "object-src 'none'; " +
        "frame-src 'none'; " +
        "worker-src 'self'; " +
        "frame-ancestors 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "upgrade-insecure-requests"
    );
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );
    next();
};

const requireHTTPS = (req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.USE_HTTPS === 'true') {
        return res.redirect(301, 'https://' + req.get('host') + req.url);
    }
    next();
};

const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['https://localhost:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600,
    optionsSuccessStatus: 204
};

app.use(securityHeaders);
app.use(requireHTTPS);
app.use(cors(corsOptions));
app.use(express.json());

const disableCacheForSensitiveData = (req, res, next) => {
    const sensitivePaths = ['/api/auth', '/api/users'];
    const isSensitive = sensitivePaths.some(path => req.path.startsWith(path));
    if (isSensitive) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
};

app.use(disableCacheForSensitiveData);

app.get("/", (req, res) => res.send("API running"));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/comments", commentRoutes);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal server error';
    const errorResponse = {
        error: status >= 500 ? 'Internal server error' : message,
        status: status
    };
    if (!isProduction) {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }
    res.status(status).json(errorResponse);
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
const HTTP_PORT = process.env.HTTP_PORT || 5080;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

const startServer = async () => {
    try {
        await connectDB();
        if (USE_HTTPS) {
            const sslOptions = {
                key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
                cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert')),
                passphrase: process.env.SSL_PASSPHRASE || 'HelloASDASD12!'
            };
            const httpsServer = https.createServer(sslOptions, app);
            httpsServer.listen(PORT, () => {
                console.log(`✓ MongoDB connected successfully`);
                console.log(`✓ HTTPS Server running on https://localhost:${PORT}`);
                console.log(`✓ TLS/SSL encryption enabled`);
            });
            const httpApp = express();
            httpApp.use((req, res) => {
                res.redirect(301, `https://localhost:${PORT}${req.url}`);
            });
            const httpServer = http.createServer(httpApp);
            httpServer.listen(HTTP_PORT, () => {
                console.log(`✓ HTTP redirect server running on http://localhost:${HTTP_PORT} -> HTTPS`);
            });
        } else {
            app.listen(PORT, () => {
                console.log(`MongoDB connected successfully`);
                console.log(`Server running on http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};
startServer();