const db = require('../db');

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createCategory = async (req, res) => {
  const { name, slug, image_url, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO categories (name, slug, image_url, status) VALUES (?, ?, ?, ?)',
      [name, slug, image_url || '', status || 'Active']
    );
    res.json({ id: result.insertId, name, slug, image_url, status: status || 'Active' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateCategory = async (req, res) => {
  const { name, slug, image_url, status } = req.body;
  try {
    await db.query('UPDATE categories SET name=?, slug=?, image_url=?, status=? WHERE id=?', [name, slug, image_url, status, req.params.id]);
    res.json({ message: 'Category updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteCategory = async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
