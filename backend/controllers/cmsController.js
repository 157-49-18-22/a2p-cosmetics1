const db = require('../db');

// Banners
exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateBanner = async (req, res) => {
  const { title, subtitle, cta_label, cta_color, image_url, is_active } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM banners WHERE section_key = ?', [req.params.key]);
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO banners (section_key, title, subtitle, cta_label, cta_color, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.params.key, title, subtitle, cta_label, cta_color, image_url, is_active ?? 1]
      );
    } else {
      await db.query(
        'UPDATE banners SET title=?, subtitle=?, cta_label=?, cta_color=?, image_url=?, is_active=? WHERE section_key=?',
        [title, subtitle, cta_label, cta_color, image_url, is_active ?? 1, req.params.key]
      );
    }
    res.json({ message: 'Banner saved' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createTestimonial = async (req, res) => {
  const { name, rating, content, product_name, image_url, status } = req.body;
  try {
    await db.query(
      'INSERT INTO testimonials (name, rating, content, product_name, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, rating || 5, content, product_name || '', image_url || '', status || 'Active']
    );
    res.json({ message: 'Testimonial added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createAnnouncement = async (req, res) => {
  const { title, message, type, status } = req.body;
  try {
    await db.query(
      'INSERT INTO announcements (title, message, type, status) VALUES (?, ?, ?, ?)',
      [title, message, type || 'Info', status || 'Active']
    );
    res.json({ message: 'Broadcast created' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Broadcast deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
