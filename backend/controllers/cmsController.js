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
    const { limit, status } = req.query;
    let query = 'SELECT * FROM testimonials';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query += ' LIMIT ?';
        params.push(parsedLimit);
      }
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createTestimonial = async (req, res) => {
  const { name, rating, content, product_name, image_url, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO testimonials (name, rating, content, product_name, image_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, rating || 5, content, product_name || '', image_url || '', status || 'Active']
    );
    res.json({ message: 'Testimonial added', id: result.insertId });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateTestimonial = async (req, res) => {
  const { name, rating, content, product_name, image_url, status } = req.body;
  try {
    await db.query(
      'UPDATE testimonials SET name = ?, rating = ?, content = ?, product_name = ?, image_url = ?, status = ? WHERE id = ?',
      [name, rating || 5, content, product_name || '', image_url || '', status || 'Active', req.params.id]
    );
    res.json({ message: 'Testimonial updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Testimonial deleted' });
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

// ═══════════════════════════════════════════
//  ARTICLES & JOURNAL (WITH ADVANCED SEO)
// ═══════════════════════════════════════════

const generateSlug = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all articles (with optional query filters: status, category, search)
exports.getArticles = async (req, res) => {
  try {
    const { status, category, search, featured } = req.query;
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (category && category !== 'all' && category !== 'All Stories') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (featured !== undefined) {
      query += ' AND featured = ?';
      params.push(featured === 'true' || featured === '1' ? 1 : 0);
    }
    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR author LIKE ? OR category LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY featured DESC, created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single article by slug or ID
exports.getArticleBySlugOrId = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let query = 'SELECT * FROM articles WHERE slug = ?';
    let [rows] = await db.query(query, [slugOrId]);

    if (rows.length === 0 && !isNaN(slugOrId)) {
      [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [slugOrId]);
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new article with SEO metadata
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      read_time,
      image_url,
      featured,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      canonical_url,
      og_image
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Article title is required' });
    }

    let finalSlug = slug ? generateSlug(slug) : generateSlug(title);
    if (!finalSlug) finalSlug = `article-${Date.now()}`;

    // Ensure slug uniqueness
    const [existingSlug] = await db.query('SELECT id FROM articles WHERE slug = ?', [finalSlug]);
    if (existingSlug.length > 0) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const [result] = await db.query(
      `INSERT INTO articles (
        title, slug, excerpt, content, category, author, read_time,
        image_url, featured, status,
        meta_title, meta_description, meta_keywords, canonical_url, og_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        finalSlug,
        excerpt || '',
        content || '',
        category || 'Skincare 101',
        author || 'Dr. Ananya Sharma',
        read_time || '5 min read',
        image_url || '',
        featured ? 1 : 0,
        status || 'Published',
        meta_title || title,
        meta_description || excerpt || '',
        meta_keywords || '',
        canonical_url || '',
        og_image || image_url || ''
      ]
    );

    res.status(201).json({
      message: 'Article created successfully',
      id: result.insertId,
      slug: finalSlug
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing article with SEO metadata
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      read_time,
      image_url,
      featured,
      status,
      meta_title,
      meta_description,
      meta_keywords,
      canonical_url,
      og_image
    } = req.body;

    const [existing] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let finalSlug = slug ? generateSlug(slug) : existing[0].slug;
    // Check if slug changed and conflicts with another article
    if (finalSlug !== existing[0].slug) {
      const [conflict] = await db.query('SELECT id FROM articles WHERE slug = ? AND id != ?', [finalSlug, id]);
      if (conflict.length > 0) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    await db.query(
      `UPDATE articles SET
        title = ?,
        slug = ?,
        excerpt = ?,
        content = ?,
        category = ?,
        author = ?,
        read_time = ?,
        image_url = ?,
        featured = ?,
        status = ?,
        meta_title = ?,
        meta_description = ?,
        meta_keywords = ?,
        canonical_url = ?,
        og_image = ?
      WHERE id = ?`,
      [
        title || existing[0].title,
        finalSlug,
        excerpt !== undefined ? excerpt : existing[0].excerpt,
        content !== undefined ? content : existing[0].content,
        category || existing[0].category,
        author || existing[0].author,
        read_time || existing[0].read_time,
        image_url !== undefined ? image_url : existing[0].image_url,
        featured !== undefined ? (featured ? 1 : 0) : existing[0].featured,
        status || existing[0].status,
        meta_title !== undefined ? meta_title : existing[0].meta_title,
        meta_description !== undefined ? meta_description : existing[0].meta_description,
        meta_keywords !== undefined ? meta_keywords : existing[0].meta_keywords,
        canonical_url !== undefined ? canonical_url : existing[0].canonical_url,
        og_image !== undefined ? og_image : existing[0].og_image,
        id
      ]
    );

    res.json({ message: 'Article updated successfully', slug: finalSlug });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle article featured status
exports.toggleArticleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT featured FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const newFeatured = existing[0].featured ? 0 : 1;
    await db.query('UPDATE articles SET featured = ? WHERE id = ?', [newFeatured, id]);
    res.json({ message: 'Article featured status updated', featured: newFeatured });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM articles WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
