const express = require('express');
const router = express.Router();

console.log('✅ api.js loaded');

// GET /api/books - with all extension features
router.get('/books', (req, res) => {
    const db = req.app.locals.db;
    
    // Get query parameters with defaults
    const searchTerm = req.query.search || req.query.q || '';
    const minPrice = parseFloat(req.query.minprice) || 0;
    const maxPrice = parseFloat(req.query.maxprice) || 9999.99;
    const sortBy = req.query.sort || 'id';
    
    // Validate sort parameter
    const allowedSorts = ['id', 'name', 'price'];
    const sortColumn = allowedSorts.includes(sortBy) ? sortBy : 'id';
    
    // Build SQL query dynamically
    let sql = "SELECT * FROM books WHERE price BETWEEN ? AND ?";
    const params = [minPrice, maxPrice];
    
    if (searchTerm) {
        sql += " AND name LIKE ?";
        params.push(`%${searchTerm}%`);
    }
    
    // Add sorting
    sql += ` ORDER BY ${sortColumn} ASC`;
    
    console.log(`📊 API Query: ${sql}`);
    console.log(`📊 Parameters:`, params);
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('❌ API Error:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log(`✅ API returned ${results.length} books`);
            // Return with metadata (Lab 9 extension requirement)
            res.json({
                data: results,
                metadata: {
                    count: results.length,
                    search: searchTerm,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    sort: sortColumn
                }
            });
        }
    });
});

// GET /api/books/:id - Get single book
router.get('/books/:id', (req, res) => {
    const db = req.app.locals.db;
    const bookId = parseInt(req.params.id);
    
    const sql = "SELECT * FROM books WHERE id = ?";
    
    db.query(sql, [bookId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.length === 0) {
            res.status(404).json({ error: "Book not found" });
        } else {
            res.json(results[0]);
        }
    });
});

module.exports = router;
