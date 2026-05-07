const db = require('../db');

exports.getProducts = async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT * FROM products';
    let params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createProduct = async (req, res) => {
  const { name, category, price, stock, image_url, hover_image_url, description, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, stock, image_url, hover_image_url, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category || '', price, stock || 0, image_url || '', hover_image_url || '', description || '', status || 'Active']
    );
    res.json({ id: result.insertId, name, category, price, stock, image_url, status: status || 'Active' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateProduct = async (req, res) => {
  const { name, category, price, stock, image_url, hover_image_url, description, status } = req.body;
  try {
    await db.query(
      'UPDATE products SET name=?, category=?, price=?, stock=?, image_url=?, hover_image_url=?, description=?, status=? WHERE id=?',
      [name, category, price, stock, image_url, hover_image_url, description, status, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Inventory Specific
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY stock ASC');
    res.json({ products: rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateInventory = async (req, res) => {
  const { quantity_change, change_type, agent } = req.body;
  const productId = req.params.id;
  try {
    // Get current product info
    const [[product]] = await db.query('SELECT name, stock FROM products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newStock = Math.max(0, product.stock + quantity_change);
    
    // Update stock
    await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
    
    // Log activity
    await db.query(
      'INSERT INTO inventory_logs (product_id, product_name, change_type, quantity_change, agent) VALUES (?, ?, ?, ?, ?)',
      [productId, product.name, change_type || 'Manual Update', quantity_change, agent || 'System']
    );

    res.json({ message: 'Inventory updated', newStock });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
