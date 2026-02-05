-- Database: create schema and books table for Lab 9-10
-- Update user/password/database to match your local MySQL setup

CREATE DATABASE IF NOT EXISTS labdb;
USE labdb;

DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemname VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  cata INT DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL
);

-- Remove any old data (safety)
DELETE FROM books;

-- Optional sample data
INSERT INTO books (itemname, description, price, cata, image) VALUES
('book1','introduction to data science',100,1,'https://img.freepik.com/free-photo/beautiful-tree-middle-field-covered-with-grass-with-tree-line-background_181624-29267.jpg'),
('book2','computer science book',200,2,'https://img.freepik.com/free-photo/beautiful-tree-middle-field-covered-with-grass-with-tree-line-background_181624-29267.jpg');
