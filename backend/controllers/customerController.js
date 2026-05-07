const db = require('../db');

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY joined_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCustomerActivity = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer_activity ORDER BY timestamp DESC LIMIT 50');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addCustomer = async (req, res) => {
  const { name, email, phone, location, status, tier } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, location, status, tier) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, location, status || 'Active', tier || 'Bronze']
    );
    res.json({ id: result.insertId, message: 'Customer added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateNotes = async (req, res) => {
  const { notes } = req.body;
  try {
    await db.query('UPDATE customers SET admin_notes = ? WHERE id = ?', [notes, req.params.id]);
    res.json({ message: 'Notes updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Address Management
exports.getAddresses = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customer_addresses ORDER BY is_default DESC, created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addAddress = async (req, res) => {
  const { name, email, phone, type, address_line, city, state, zip_code, is_default } = req.body;
  try {
    if (is_default) {
      await db.query('UPDATE customer_addresses SET is_default = 0');
    }
    const [result] = await db.query(
      'INSERT INTO customer_addresses (name, email, phone, type, address_line, city, state, zip_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, type, address_line, city, state, zip_code, is_default ? 1 : 0]
    );
    res.json({ id: result.insertId, message: 'Address added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteAddress = async (req, res) => {
  try {
    await db.query('DELETE FROM customer_addresses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Address deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateAddress = async (req, res) => {
  const { name, email, phone, type, address_line, city, state, zip_code, is_default } = req.body;
  try {
    if (is_default) {
      await db.query('UPDATE customer_addresses SET is_default = 0');
    }
    await db.query(
      'UPDATE customer_addresses SET name=?, email=?, phone=?, type=?, address_line=?, city=?, state=?, zip_code=?, is_default=? WHERE id=?',
      [name, email, phone, type, address_line, city, state, zip_code, is_default ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Address updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};


// Customer Authentication
exports.signupCustomer = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Insert new user (plain text password for now, as requested/mocked. In production use bcrypt)
    const [result] = await db.query(
      'INSERT INTO customers (name, email, password, status, tier) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, 'Active', 'Bronze']
    );
    res.status(201).json({ id: result.insertId, name, email, message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM customers WHERE email = ? AND password = ?', [email, password]);
    if (users.length > 0) {
      const user = users[0];
      res.json({ id: user.id, name: user.name, email: user.email, tier: user.tier });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
