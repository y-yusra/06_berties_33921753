# 📚 Berties Books - Online Bookshop

A comprehensive, full-stack web application for managing an online bookshop, built with modern web technologies including Node.js, Express, EJS templates, and MySQL database.

## 🚀 Features

- **📖 Browse Collection**: View all books in a beautiful, responsive table
- **💰 Bargain Books**: Discover books priced under £20
- **🔍 Smart Search**: Find books with exact and partial matching
- **➕ Add Books**: Simple form to add new books to the collection
- **🎨 Modern UI**: Clean, responsive design with professional styling
- **⚡ Performance**: Database connection pooling and optimized queries
- **🔒 Security**: Input validation and error handling

## 🛠 Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL with mysql2 driver
- **Templating**: EJS (Embedded JavaScript)
- **Styling**: Pure CSS with modern design
- **Deployment**: Compatible with Ubuntu VM deployment

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- Git for version control

## 🏗 Installation & Setup

### 1. Clone the Repository

git clone https://github.com/y-yusra/06_berties_33921753.git
cd berties-books

### 2. Install Dependencies

npm install

### 3. Database Setup

Local MySQL Setup:

# Login to MySQL as root
mysql -u root -p

# Run the database creation script
source create_db.sql

# Populate with sample data
source insert_test_data.sql

Alternative one-liner:

npm run setup-db

## dotenv

Database credentials are secured using the dotenv module. Sensitive information like database passwords are stored in a `.env` file which is excluded from version control via `.gitignore`. The application loads these environment variables at startup.

## audit

Login attempts are logged to an `audit_log` table in the database. The system records:
- Username attempted
- Login timestamp  
- Success/failure status
- IP address
All login attempts (both successful and failed) are recorded and can be viewed at `/users/audit`. This provides security monitoring and tracking of user access patterns.