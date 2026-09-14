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
  const { name, email, phone, location, status, tier, role } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, location, status, tier, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, location, status || 'Active', tier || 'Bronze', role || 'Customer']
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
    const [rows] = await db.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addAddress = async (req, res) => {
  const { name, email, phone, type, address_line, city, state, zip_code, is_default } = req.body;
  try {
    if (is_default) {
      await db.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.user.id]);
    }
    const [result] = await db.query(
      'INSERT INTO customer_addresses (customer_id, name, email, phone, type, address_line, city, state, zip_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, name, email, phone, type, address_line, city, state, zip_code, is_default ? 1 : 0]
    );
    res.json({ id: result.insertId, message: 'Address added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteAddress = async (req, res) => {
  try {
    await db.query('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateAddress = async (req, res) => {
  const { name, email, phone, type, address_line, city, state, zip_code, is_default } = req.body;
  try {
    if (is_default) {
      await db.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [req.user.id]);
    }
    await db.query(
      'UPDATE customer_addresses SET name=?, email=?, phone=?, type=?, address_line=?, city=?, state=?, zip_code=?, is_default=? WHERE id=? AND customer_id=?',
      [name, email, phone, type, address_line, city, state, zip_code, is_default ? 1 : 0, req.params.id, req.user.id]
    );
    res.json({ message: 'Address updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};


const { sendSignupOtp, verifySignupOtp } = require('../utils/emailService');

// Send OTP for Signup
exports.sendSignupOtp = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const result = await sendSignupOtp(email);
    res.json({ 
      success: true, 
      message: 'OTP has been sent to your email address.',
      devOtp: result.otp
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};

// Verify OTP & Complete Signup
exports.verifyOtpAndSignup = async (req, res) => {
  const { name, email, phone, password, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  if (!name || !password) {
    return res.status(400).json({ error: 'Full name and password are required.' });
  }

  try {
    // 1. Verify OTP
    const verification = await verifySignupOtp(email, otp);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    // 2. Check if user already exists
    const [existing] = await db.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // 3. Create customer
    const [result] = await db.query(
      'INSERT INTO customers (name, email, password, phone, status, tier, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, phone || '', 'Active', 'Bronze', 'Customer']
    );

    const userPayload = {
      id: result.insertId,
      name,
      email,
      tier: 'Bronze',
      role: 'Customer',
      type: 'customer'
    };

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('a2p_token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully!',
      user: userPayload
    });
  } catch (error) {
    console.error('Error during OTP signup:', error);
    res.status(500).json({ error: error.message || 'Failed to complete registration.' });
  }
};

// Legacy Direct Signup (kept as fallback)
exports.signupCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }
    const [result] = await db.query(
      'INSERT INTO customers (name, email, password, phone, status, tier, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, phone || '', 'Active', 'Bronze', 'Customer']
    );
    res.status(201).json({ id: result.insertId, name, email, role: 'Customer', message: 'Account created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';
  try {
    const [users] = await db.query('SELECT * FROM customers WHERE email = ? AND password = ?', [email, password]);
    if (users.length > 0) {
      const user = users[0];
      const payload = { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        tier: user.tier, 
        role: user.role || 'Customer', 
        type: 'customer' 
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('a2p_token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json(payload);
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.trackActivity = async (req, res) => {
  const { customer_id, type, product_name } = req.body;
  let resolvedCustomerId = customer_id;
  if (!resolvedCustomerId && req.user) {
    resolvedCustomerId = req.user.id;
  }
  try {
    await db.query(
      'INSERT INTO customer_activity (customer_id, type, product_name) VALUES (?, ?, ?)',
      [resolvedCustomerId || null, type || 'View', product_name || '']
    );
    res.json({ success: true, message: 'Activity tracked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

