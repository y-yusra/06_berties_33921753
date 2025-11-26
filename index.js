/**
 * Berties Books - Main Application File
 * Built with Node.js, Express, EJS, and MySQL
 */

require('dotenv').config();

const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const booksRouter = require("./routes/books");

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
        expires: 600000
    }
}));

app.use(expressSanitizer());

// --- DATABASE SETUP ---
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

app.locals.db = db;

const usersRouter = require("./users");
app.use("/", usersRouter);

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
app.use("/books", booksRouter);

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
    testUser: { username: "gold", password: "smiths" }
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
    message: "The page you are looking for does not exist."
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("🚨 Application Error:", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong.",
    error: err
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Berties Books running at http://localhost:${PORT}`);
});
