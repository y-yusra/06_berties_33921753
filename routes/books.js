/**
 * routes/books.js
 * Book-related routes
 */
const express = require("express");
const router = express.Router();

// attach db from app.locals for every request
let db;
router.use((req, res, next) => {
  db = req.app.locals.db;
  next();
});

// LIST ALL
router.get("/list", (req, res, next) => {
  const sql = "SELECT * FROM books ORDER BY name ASC";
  db.query(sql, (err, rows) => {
    if (err) return next(err);
    res.render("list", {
      title: "All Books - Berties Books",
      availableBooks: rows,
      totalBooks: rows.length,
      added: req.query.added === "1",
      addedName: req.query.name ? String(req.query.name) : ""
    });
  });
});

// BARGAIN (< £20) — reuse list.ejs
router.get("/bargainbooks", (req, res, next) => {
  const sql = "SELECT * FROM books WHERE price < 20.00 ORDER BY price ASC";
  db.query(sql, (err, rows) => {
    if (err) return next(err);
    res.render("list", {
      title: "Bargain Books (Under £20) - Berties Books",
      availableBooks: rows,
      totalBooks: rows.length
    });
  });
});

// SEARCH FORM
router.get("/search", (req, res) => {
  res.render("search", { title: "Search Books - Berties Books" });
});

// SEARCH RESULT (GET form pattern)
router.get("/search-result", (req, res, next) => {
  const term = (req.query.keyword || "").trim();
  if (!term) {
    return res.render("searchresults", {
      title: "Search Results - Berties Books",
      books: [],
      searchTerm: "",
      totalResults: 0,
      message: "Please enter a search term."
    });
  }
  const sql = "SELECT * FROM books WHERE name LIKE ? ORDER BY name ASC";
  db.query(sql, [`%${term}%`], (err, rows) => {
    if (err) return next(err);
    res.render("searchresults", {
      title: "Search Results - Berties Books",
      books: rows,
      searchTerm: term,
      totalResults: rows.length
    });
  });
});

// SEARCH RESULT (POST form pattern)
router.post("/search", (req, res, next) => {
  const term = (req.body.keyword || "").trim();
  if (!term) {
    return res.render("searchresults", {
      title: "Search Results - Berties Books",
      books: [],
      searchTerm: "",
      totalResults: 0,
      message: "Please enter a search term."
    });
  }
  const sql = "SELECT * FROM books WHERE name LIKE ? ORDER BY name ASC";
  db.query(sql, [`%${term}%`], (err, rows) => {
    if (err) return next(err);
    res.render("searchresults", {
      title: "Search Results - Berties Books",
      books: rows,
      searchTerm: term,
      totalResults: rows.length
    });
  });
});

// ADD BOOK FORM
router.get("/addbook", (req, res) => {
  res.render("addbook", { title: "Add New Book - Berties Books" });
});

// ADD BOOK (POST)
router.post("/bookadded", (req, res, next) => {
  let { name, price } = req.body;
  name = (name || "").trim().replace(/\s+/g, " ");
  const priceNum = Number(price);

  if (!name || !Number.isFinite(priceNum) || priceNum < 0 || priceNum > 999.99) {
    return res.status(400).render("error", {
      title: "Validation Error",
      message: "Please provide a valid book name and a price between 0 and 999.99."
    });
  }
  if (name.length > 100) {
    return res.status(400).render("error", {
      title: "Validation Error",
      message: "Book name must be 100 characters or fewer."
    });
  }

  const sql = "INSERT INTO books (name, price) VALUES (?, ?)";
  db.query(sql, [name, priceNum], (err) => {
    if (err) return next(err);
    const safeName = encodeURIComponent(name);
    res.redirect(`/books/list?added=1&name=${safeName}`);
  });
});

module.exports = router;
