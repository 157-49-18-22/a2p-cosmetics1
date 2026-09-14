const db = require('../db');

// GET all wishlists with customer info (Admin view)
exports.getAllWishlists = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        uw.id,
        uw.customer_id,
        uw.product_id,
        uw.added_at,
        uw.notes,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.tier as customer_tier,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image,
        p.category as product_category,
        p.stock as product_stock,
        p.sku as product_sku,
        p.status as product_status
      FROM user_wishlists uw
      LEFT JOIN customers c ON uw.customer_id = c.id
      LEFT JOIN products p ON uw.product_id = p.id
      ORDER BY uw.added_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET wishlist stats for admin dashboard
exports.getWishlistStats = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM user_wishlists');
    const [topProducts] = await db.query(`
      SELECT p.name, p.image_url, p.price, p.sku, COUNT(uw.id) as wishlist_count
      FROM user_wishlists uw
      LEFT JOIN products p ON uw.product_id = p.id
      GROUP BY uw.product_id
      ORDER BY wishlist_count DESC
      LIMIT 5
    `);
    const [topCustomers] = await db.query(`
      SELECT c.name, c.email, c.phone, c.tier, COUNT(uw.id) as wishlist_count
      FROM user_wishlists uw
      LEFT JOIN customers c ON uw.customer_id = c.id
      GROUP BY uw.customer_id
      ORDER BY wishlist_count DESC
      LIMIT 5
    `);
    res.json({ total, topProducts, topCustomers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST - Customer adds to wishlist (user-facing, saves with customer_id)
exports.addToWishlist = async (req, res) => {
  const { customer_id, product_id } = req.body;
  if (!customer_id || !product_id) return res.status(400).json({ error: 'customer_id and product_id are required' });
  try {
    const [existing] = await db.query('SELECT id FROM user_wishlists WHERE customer_id=? AND product_id=?', [customer_id, product_id]);
    if (existing.length > 0) return res.json({ message: 'Already in wishlist' });
    await db.query('INSERT INTO user_wishlists (customer_id, product_id) VALUES (?, ?)', [customer_id, product_id]);
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE - Remove from wishlist by customer_id and product_id
exports.removeFromWishlist = async (req, res) => {
  const { customerId, productId } = req.query;
  try {
    if (customerId && productId) {
      await db.query('DELETE FROM user_wishlists WHERE customer_id = ? AND product_id = ?', [customerId, productId]);
      res.json({ message: 'Removed from wishlist' });
    } else if (req.params.id && req.params.id !== 'undefined') {
      // Fallback for direct ID deletion
      await db.query('DELETE FROM user_wishlists WHERE id = ?', [req.params.id]);
      res.json({ message: 'Removed from wishlist' });
    } else {
      res.status(400).json({ error: 'Missing parameters' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET - Customer's own wishlist
exports.getCustomerWishlist = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT uw.id, p.id as product_id, p.name, p.price, p.image_url, p.category, p.stock, p.sku, p.status, uw.added_at
      FROM user_wishlists uw
      LEFT JOIN products p ON uw.product_id = p.id
      WHERE uw.customer_id = ?
      ORDER BY uw.added_at DESC
    `, [req.params.customerId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
