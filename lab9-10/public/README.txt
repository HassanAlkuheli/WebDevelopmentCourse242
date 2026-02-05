Lab 9-10 - Node.js + MySQL

Setup:
1. Ensure MySQL is running and you have a database user.
2. Edit `project.js` MySQL connection credentials (host/user/password/database) if needed.
3. Run the SQL script to create DB/table and sample data:
   - mysql -u root -p < db.sql

Install node dependencies:
   npm init -y
   npm install express mysql cors

Run server:
   node project.js

Server runs on http://localhost:5000

Frontend pages (static in public/):
 - /insert.html  (insert book with image URL)
 - /index.html   (view all books, delete/edit)
 - /delete.html  (delete by id)
 - /search_update.html (search by name and update)
 - /buy.html     (buy and calculate total)

Notes:
 - Image is handled as a URL field for simplicity. If you need file uploads, we can add multer and file storage.
 - There is a POST /books/clear endpoint to delete all records if required.
