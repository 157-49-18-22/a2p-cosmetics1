const express = require('express');
const router = express.Router();
const db = require('../db');
const productController = require('../controllers/productController');

// Cart
router.get('/cart', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cart');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/cart', async (req, res) => {
  const { name, price, image_url, quantity } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM cart WHERE name = ?', [name]);
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ? WHERE name = ?', [quantity || 1, name]);
      res.json({ message: 'Cart updated' });
    } else {
      await db.query('INSERT INTO cart (name, price, image_url, quantity) VALUES (?, ?, ?, ?)', [name, price, image_url, quantity || 1]);
      res.json({ message: 'Added to cart' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/cart/clear/all', async (req, res) => {
  try {
    await db.query('DELETE FROM cart');
    res.json({ message: 'Cart cleared' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/cart/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/cart/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ message: 'Cart item updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});



// Wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM wishlist');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Inventory (Direct access from /api)
router.get('/inventory', productController.getInventory);
router.put('/inventory/:id', productController.updateInventory);

// Admin Global Stats
router.get('/admin/stats', async (req, res) => {
  try {
    const [[{ total_products }]] = await db.query('SELECT COUNT(*) as total_products FROM products');
    const [[{ total_categories }]] = await db.query('SELECT COUNT(*) as total_categories FROM categories');
    const [[{ low_stock }]] = await db.query('SELECT COUNT(*) as low_stock FROM products WHERE stock < 50 AND stock > 0');
    
    // User counts
    const [[{ total_customers }]] = await db.query('SELECT COUNT(*) as total_customers FROM customers');
    const [[{ total_agents }]] = await db.query('SELECT COUNT(*) as total_agents FROM agents');
    const [[{ total_distributors }]] = await db.query('SELECT COUNT(*) as total_distributors FROM distributors');
    
    // Order stats
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders');
    const [recent_orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    // Recent Users
    const [latest_cust] = await db.query('SELECT name, email, joined_at as created_at, "Customer" as type FROM customers ORDER BY joined_at DESC LIMIT 5');
    const [latest_ag] = await db.query('SELECT name, email, created_at, "Agent" as type FROM agents ORDER BY created_at DESC LIMIT 5');
    const [latest_dist] = await db.query('SELECT name, email, created_at, "Distributor" as type FROM distributors ORDER BY created_at DESC LIMIT 5');
    
    const recent_users = [...latest_cust, ...latest_ag, ...latest_dist]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    res.json({ 
      total_products, 
      total_categories, 
      low_stock,
      total_customers,
      total_agents,
      total_distributors,
      total_orders,
      recent_orders,
      recent_users
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Unified User Management
router.get('/users/all', async (req, res) => {
  try {
    const [cust] = await db.query('SELECT id, name, email, phone, "Customer" as role, joined_at as created_at, status FROM customers');
    const [ag] = await db.query('SELECT id, name, email, phone, "Agent" as role, created_at, status FROM agents');
    const [dist] = await db.query('SELECT id, name, email, phone, "Distributor" as role, created_at, status FROM distributors');
    
    const allUsers = [...cust, ...ag, ...dist].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(allUsers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/users/add', async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  try {
    const pwd = password || 'a2p123';
    if (role === 'Customer') {
      await db.query('INSERT INTO customers (name, email, phone, password, status) VALUES (?, ?, ?, ?, "Active")', [name, email, phone, pwd]);
    } else if (role === 'Agent') {
      await db.query('INSERT INTO agents (name, email, phone, password, status) VALUES (?, ?, ?, ?, "Active")', [name, email, phone, pwd]);
    } else if (role === 'Distributor') {
      await db.query('INSERT INTO distributors (name, email, phone, password, status) VALUES (?, ?, ?, ?, "Active")', [name, email, phone, pwd]);
    }
    res.json({ message: 'User added successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
