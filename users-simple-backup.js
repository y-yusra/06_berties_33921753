const express = require('express');
const router = express.Router();

console.log('✅ users.js loaded - SIMPLE WORKING VERSION');

// Simple middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    } else {
        next();
    }
};

// Registration
router.get('/register', (req, res) => {
    res.send(`
        <h1>Register</h1>
        <nav><a href="/">Home</a> | <a href="/users/login">Login</a></nav>
        <form action="/users/registered" method="POST">
            <input type="text" name="username"><br>
            <button>Register</button>
        </form>
    `);
});

router.post('/registered', (req, res) => {
    res.send('<h1>Registration simulated</h1><a href="/">Home</a>');
});

// Login
router.get('/login', (req, res) => {
    res.send(`
        <h1>Login</h1>
        <nav><a href="/">Home</a> | <a href="/users/register">Register</a></nav>
        <form action="/users/loggedin" method="POST">
            <input type="text" name="username"><br>
            <button>Login</button>
        </form>
    `);
});

router.post('/loggedin', (req, res) => {
    req.session.userId = 'demo';
    res.send('<h1>Login successful (demo)</h1><a href="/">Home</a>');
});

// Users list (protected)
router.get('/list', redirectLogin, (req, res) => {
    res.send(`
        <h1>Users List</h1>
        <nav><a href="/">Home</a></nav>
        <p>Demo users list (you are logged in)</p>
    `);
});

// Audit log (protected)
router.get('/audit', redirectLogin, (req, res) => {
    res.send(`
        <h1>Audit Log</h1>
        <nav><a href="/">Home</a></nav>
        <p>Demo audit log</p>
    `);
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
