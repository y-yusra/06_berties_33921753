/**
 * Berties Books - Main Application File
 * Built with Node.js, Express, EJS, and MySQL
 */

require('dotenv').config();

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const booksRouter = require("./routes/books");
const usersRouter = require("./users");
const weatherRouter = require("./routes/weather");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 8000;

const expressSanitizer = require('express-sanitizer');

// --- VIEW ENGINE SETUP ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- SESSION MIDDLEWARE ---
const session = require('express-session');
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        path: '/',
        sameSite: 'lax'
    }
}));

app.use(expressSanitizer());

// --- DATABASE SETUP ---
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'berties_books_app',
  password: process.env.DB_PASSWORD || 'qwertyuiop',
  database: process.env.DB_NAME || 'berties_books',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

app.locals.db = db;

// Make db available to all routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// TEST DATABASE CONNECTION
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully");
    conn.release();
  }
});

// --- ROUTES ---
console.log("🔄 Loading routes...");
app.use("/books", booksRouter);
app.use("/users", usersRouter);
app.use("/", weatherRouter);
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.render("index", {
    title: "Berties Books - Welcome",
    message: "Your premier online bookshop",
    lab7Features: [
      { name: "User Registration", path: "/users/register", icon: "👤" },
      { name: "User Login", path: "/users/login", icon: "🔐" },
      { name: "View Users", path: "/users/list", icon: "👥" },
      { name: "Audit Log", path: "/users/audit", icon: "📊" },
      { name: "Logout", path: "/users/logout", icon: "🚪" }
    ],
    testUser: { username: "gold", password: "smiths" },
    userId: req.session.userId
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    time: new Date().toISOString(),
    database: "Connected"
  });
});

// --- 404 HANDLER ---
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist.",
    error: {} 
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("🚨 Application Error:", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong.",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Berties Books running at http://localhost:${PORT}`);
});
