-- Berties Books Sample Data
-- This script populates the database with initial book data

USE berties_books;

-- Clear existing data
-- DELETE FROM books;

-- Insert sample books data
INSERT INTO books (name, price) VALUES
('Brighton Rock', 20.25),
('Brave New World', 25.00),
('Animal Farm', 12.99),
('To Kill a Mockingbird', 18.50),
('1984', 15.75),
('The Great Gatsby', 22.00),
('Pride and Prejudice', 16.80),
('The Catcher in the Rye', 14.95),
('Lord of the Flies', 13.25),
('The Hobbit', 19.99);

-- Display inserted data
SELECT '✅ Sample data inserted successfully!' AS message;
SELECT COUNT(*) AS 'Total Books' FROM books;

-- Required gold user for marking
INSERT IGNORE INTO users (username, first_name, last_name, email, hashedPassword) 
VALUES ('gold', 'Default', 'User', 'gold@example.com', '$2b$10$O.Y0S0yMt7APius9fv52/OYqX//yX/i2.SKURteqA.otCi7drQWCq');
