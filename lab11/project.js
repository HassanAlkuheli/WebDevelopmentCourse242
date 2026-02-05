const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'lab11-secret',
  resave: false,
  saveUninitialized: false
}));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'labpass',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  database: process.env.DB_NAME || 'lab11db'
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login.html');
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) return next();
    return res.status(403).send('Forbidden');
  };
}

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

// Protected pages
app.get('/buy.html', requireLogin, requireRole('customer'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'buy.html'));
});

app.get('/manage.html', requireLogin, requireRole('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manage.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Books API
app.get('/books', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

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

app.delete('/books/:id', async (req, res) => {
  try {
    await query('DELETE FROM books WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Buy endpoint
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

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({ error: 'Missing fields' });
    await query('INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)', [username, password, 'customer', email]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.user = { username: rows[0].username, role: rows[0].role };
    res.json({ ok: true, role: rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

waitForDb().then(ok => {
  if (!ok) {
    console.error('Database not ready. Server not started.');
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
