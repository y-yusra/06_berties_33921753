-- Berties Books Database Setup Script
-- This script creates the database, tables, and application user

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(6, 2) UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create application user with secure password
CREATE USER IF NOT EXISTS 'berties_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';

-- Grant necessary privileges to application user
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_books_app'@'localhost';

-- Apply privilege changes
FLUSH PRIVILEGES;

-- Display confirmation message
SELECT '✅ Berties Books database setup completed successfully!' AS message;