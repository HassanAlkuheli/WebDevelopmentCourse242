CREATE DATABASE IF NOT EXISTS lab11db;
USE lab11db;

DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemname VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  cata INT DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  email VARCHAR(255) NOT NULL
);

DELETE FROM books;
DELETE FROM users;

INSERT INTO books (itemname, description, price, cata, image) VALUES
('book1','introduction to data science',100,1,'https://img.freepik.com/free-photo/beautiful-tree-middle-field-covered-with-grass-with-tree-line-background_181624-29267.jpg'),
('book2','computer science book',200,2,'https://img.freepik.com/free-photo/beautiful-tree-middle-field-covered-with-grass-with-tree-line-background_181624-29267.jpg');

INSERT INTO users (username, password, role, email) VALUES
('admin','admin123','admin','admin@example.com'),
('customer','customer123','customer','customer@example.com');
