const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const saltRounds = 10;

const { check, validationResult } = require('express-validator');

// Authentication middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/usr/300/users/login');
    } else {
        next();
    }
};

// Audit logging function
function logLoginAttempt(username, success, req) {
    const ip = req.ip || req.connection.remoteAddress;
    const insertQuery = "INSERT INTO audit_log (username, success, ip_address) VALUES (?, ?, ?)";
    
    req.app.locals.db.query(insertQuery, [username, success, ip], (error) => {
        if (error) {
            console.error("Failed to log login attempt:", error);
        }
    });
}

// Registration form - GET /users/register
router.get('/register', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Register - Bertie's Books</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
                input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
                button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                nav { margin: 20px 0; }
                a { color: #007bff; text-decoration: none; }
            </style>
        </head>
        <body>
            <nav>
                <a href="/">Home</a> | 
                <a href="/users/login">Login</a> |
                <a href="/users/list">View Users</a>
            </nav>
            <h1>User Registration</h1>
            <form action="/users/registered" method="POST">
                <input type="text" name="username" placeholder="Username" required><br>
                <input type="text" name="first" placeholder="First Name" required><br>
                <input type="text" name="last" placeholder="Last Name" required><br>
                <input type="email" name="email" placeholder="Email" required><br>
                <input type="password" name="password" placeholder="Password" required><br>
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="/users/login">Login here</a></p>
        </body>
        </html>
    `);
});

// Process registration - POST /users/registered
router.post('/registered', [
    check('email').isEmail(),
    check('username').isLength({ min: 4, max: 20 }),
    check('password').isLength({ min: 6 })
], (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => {
            if (error.path === 'email') return '<li>Please enter a valid email address</li>';
            if (error.path === 'username') return '<li>Username must be between 4-20 characters</li>';
            if (error.path === 'password') return '<li>Password must be at least 6 characters</li>';
            return `<li>${error.msg}</li>`;
        }).join('');
        
        return res.send(`
            <h1>Validation Failed</h1>
            <p>Please fix the following errors:</p>
            <ul>
                ${errorMessages}
            </ul>
            <a href="/users/register">Go Back</a>
        `);
    }

    const { username, first, last, email, password } = req.body;

    bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
        if (err) {
            res.send("Error hashing password");
            return;
        }
        
        const insertQuery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
        req.app.locals.db.query(insertQuery, [username, first, last, email, hashedPassword], 
            (error, results) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        res.send("Username already exists. Please choose a different username.");
                    } else {
                        res.send("Error registering user: " + error.sqlMessage);
                    }
                    return;
                }
                
                // Debug output
                const sanitizedFirst = req.sanitize(first);
                const sanitizedLast = req.sanitize(last);
                let resultMessage = `
                    <!DOCTYPE html>
                    <html>
                    <head><title>Registration Successful</title></head>
                    <body>
                        <nav><a href="/">Home</a> | <a href="/users/login">Login</a></nav>
                        <h1>Registration Successful!</h1>
                        <p>Hello ${sanitizedFirst} ${sanitizedLast}, you are now registered!</p>
                        <p>We will send an email to you at ${email}</p>
                        <p><strong>Debug Info (for lab):</strong><br>
                        Your password is: ${password}<br>
                        Your hashed password is: ${hashedPassword}</p>
                        <a href="/users/login">Login Now</a>
                    </body>
                    </html>
                `;
                res.send(resultMessage);
            });
    });
});

// List users - GET /users/list
router.get('/list', redirectLogin, (req, res) => {
    const selectQuery = "SELECT id, username, first_name, last_name, email, created_at FROM users ORDER BY created_at DESC";
    req.app.locals.db.query(selectQuery, (error, results) => {
        if (error) {
            res.send("Error retrieving users: " + error.sqlMessage);
            return;
        }
        
        let userList = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Users List - Bertie's Books</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    nav { margin: 20px 0; }
                </style>
            </head>
            <body>
                <nav>
                    <a href="/">Home</a> | 
                    <a href="/users/register">Register</a> |
                    <a href="/users/login">Login</a>
                </nav>
                <h1>Registered Users</h1>
        `;
        
        if (results.length === 0) {
            userList += '<p>No users registered yet</p>';
        } else {
            userList += `
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Registered</th>
                    </tr>
            `;
            
            results.forEach(user => {
                userList += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${req.sanitize(user.username)}</td>
                        <td>${req.sanitize(user.first_name)}</td>
                        <td>${req.sanitize(user.last_name)}</td>
                        <td>${req.sanitize(user.email)}</td>
                        <td>${new Date(user.created_at).toLocaleString()}</td>
                    </tr>
                `;
            });
            
            userList += '</table>';
        }
        
        userList += '</body></html>';
        res.send(userList);
    });
});

// Login form - GET /users/login
router.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login - Bertie's Books</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
                input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
                button { background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                nav { margin: 20px 0; }
            </style>
        </head>
        <body>
            <nav>
                <a href="/">Home</a> | 
                <a href="/users/register">Register</a> |
                <a href="/users/list">View Users</a>
            </nav>
            <h1>Login</h1>
            <form action="/users/loggedin" method="POST">
                <input type="text" name="username" placeholder="Username" required><br>
                <input type="password" name="password" placeholder="Password" required><br>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/users/register">Register here</a></p>
        </body>
        </html>
    `);
});

// Process login - POST /users/loggedin
router.post('/loggedin', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        res.send("Username and password are required");
        return;
    }
    
    const selectQuery = "SELECT username, hashedPassword FROM users WHERE username = ?";
    req.app.locals.db.query(selectQuery, [username], (error, results) => {
        if (error) {
            res.send("Error during login: " + error.sqlMessage);
            return;
        }
        
        if (results.length === 0) {
            res.send(`
                <h1>Login Failed</h1>
                <p>User not found</p>
                <a href="/users/login">Try Again</a>
            `);
            return;
        }
        
        const hashedPassword = results[0].hashedPassword;

        bcrypt.compare(password, hashedPassword, function(err, result) {
            if (err) {
                logLoginAttempt(username, false, req);
                res.send("Error comparing passwords");
            } else if (result === true) {
                req.session.userId = username;
                logLoginAttempt(username, true, req);
                res.send(`
                    <h1>Login Successful!</h1>
                    <p>Welcome back, ${username}!</p>
                    <a href="/">Go to Home</a>
                `);
            } else {
                logLoginAttempt(username, false, req);
                res.send(`
                    <h1>Login Failed</h1>
                    <p>Invalid password</p>
                    <a href="/users/login">Try Again</a>
                `);
            }
        });
    });    
});

// View audit log - GET /users/audit
router.get('/audit', redirectLogin, (req, res) => {
    const selectQuery = "SELECT * FROM audit_log ORDER BY login_time DESC";
    req.app.locals.db.query(selectQuery, (error, results) => {
        if (error) {
            res.send("Error retrieving audit log: " + error.sqlMessage);
            return;
        }
        
        let auditLog = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Log - Bertie's Books</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 20px auto; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .success { color: green; }
                    .failed { color: red; }
                    nav { margin: 20px 0; }
                </style>
            </head>
            <body>
                <nav>
                    <a href="/">Home</a> | 
                    <a href="/users/register">Register</a> |
                    <a href="/users/login">Login</a> |
                    <a href="/users/list">View Users</a>
                </nav>
                <h1>Login Audit Log</h1>
        `;
        
        if (results.length === 0) {
            auditLog += '<p>No login attempts recorded yet.</p>';
        } else {
            auditLog += `
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Login Time</th>
                        <th>Status</th>
                        <th>IP Address</th>
                    </tr>
            `;
            
            results.forEach(log => {
                const status = log.success ? '<span class="success">Success</span>' : '<span class="failed">Failed</span>';
                auditLog += `
                    <tr>
                        <td>${log.id}</td>
                        <td>${log.username || 'N/A'}</td>
                        <td>${new Date(log.login_time).toLocaleString()}</td>
                        <td>${status}</td>
                        <td>${log.ip_address || 'N/A'}</td>
                    </tr>
                `;
            });
            
            auditLog += '</table>';
        }
        
        auditLog += '</body></html>';
        res.send(auditLog);
    });
});

// Logout route - GET /users/logout
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.send('You are now logged out. <a href="/">Home</a>');
    });
});

module.exports = router;
