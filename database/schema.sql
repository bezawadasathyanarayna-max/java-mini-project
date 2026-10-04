CREATE DATABASE IF NOT EXISTS campus_lost_found;
USE campus_lost_found;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  item_type ENUM('LOST', 'FOUND') NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NULL,
  location VARCHAR(255) NOT NULL,
  color VARCHAR(100) NULL,
  brand VARCHAR(150) NULL,
  unique_details TEXT NULL,
  image_url VARCHAR(500) NULL,
  contact_info VARCHAR(255) NULL,
  status ENUM('ACTIVE', 'CLAIMED', 'RETURNED', 'RESOLVED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  claimant_id INT NOT NULL,
  claimant_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  proof_details TEXT NOT NULL,
  message TEXT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Example admin creation after hashing password.
-- Use Node.js or SQL insert after generating a bcrypt hash:
-- node -e "const bcrypt=require('bcrypt'); console.log(bcrypt.hashSync('Admin123', 10));"
-- Then create admin:
-- INSERT INTO users (full_name, student_id, email, phone, password, role)
-- VALUES ('Admin User', 'ADMIN001', 'admin@campus.edu', '9999999999', '$2b$10$HASH_HERE', 'admin');
