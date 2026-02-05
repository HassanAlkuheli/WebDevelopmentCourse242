const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure MySQL connection pool - uses environment variables (Docker-friendly)
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'labpass',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  database: process.env.DB_NAME || 'labdb'
});

async function waitForDb(retries = 15, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await query('SELECT 1');
      return true;
    } catch (err) {
      console.log(`DB not ready (${i + 1}/${retries})...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return false;
}

// Utility to run queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Get all books (optional ?name= to filter)
app.get('/books', async (req, res) => {
  try {
    const name = req.query.name;
    let sql = 'SELECT * FROM books';
    const params = [];
    if (name) {
      sql += ' WHERE itemname = ?';
      params.push(name);
    }
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Get one book by id
app.get('/books/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Insert book
app.post('/books', async (req, res) => {
  try {
    const { itemname, description, price, cata, image } = req.body;
    const result = await query('INSERT INTO books (itemname, description, price, cata, image) VALUES (?,?,?,?,?)', [itemname, description, price, cata, image]);
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update book
app.put('/books/:id', async (req, res) => {
  try {
    const { itemname, description, price, cata, image } = req.body;
    await query('UPDATE books SET itemname=?, description=?, price=?, cata=?, image=? WHERE id=?', [itemname, description, price, cata, image, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete book
app.delete('/books/:id', async (req, res) => {
  try {
    await query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Clear table (dangerous) - used to delete all previous data as requested
app.post('/books/clear', async (req, res) => {
  try {
    await query('DELETE FROM books');
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Buy endpoint: expects { id, quantity }
app.post('/buy', async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const rows = await query('SELECT * FROM books WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    const total = parseFloat(rows[0].price) * parseInt(quantity);
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

waitForDb().then((ok) => {
  if (!ok) {
    console.error('Database not ready. Server not started.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
