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
    
    // Ensure images, images_360, and delivery_pincodes are properly parsed
    const parsedRows = rows.map(row => {
      if (typeof row.images === 'string') {
        try { row.images = JSON.parse(row.images); } catch(e) { row.images = []; }
      }
      if (typeof row.images_360 === 'string') {
        try { row.images_360 = JSON.parse(row.images_360); } catch(e) { row.images_360 = []; }
      } else if (!row.images_360) {
        row.images_360 = [];
      }
      if (typeof row.delivery_pincodes === 'string') {
        try { row.delivery_pincodes = JSON.parse(row.delivery_pincodes); } catch(e) { row.delivery_pincodes = []; }
      } else if (!row.delivery_pincodes) {
        row.delivery_pincodes = [];
      }
      return row;
    });

    res.json(parsedRows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createProduct = async (req, res) => {
  const { name, category, price, old_price, stock, image_url, hover_image_url, description, status, images, images_360, meta_title, meta_description, meta_keywords, sirv_spin_url, delivery_pincodes, all_india_delivery } = req.body;
  const imagesJson = images ? JSON.stringify(images) : '[]';
  const images360Json = images_360 ? JSON.stringify(images_360) : '[]';
  const pincodesJson = delivery_pincodes ? JSON.stringify(delivery_pincodes) : '[]';
  const allIndia = all_india_delivery ? 1 : 0;
  const masterStock = parseInt(stock) || 0;
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, old_price, stock, image_url, hover_image_url, description, status, images, images_360, meta_title, meta_description, meta_keywords, sirv_spin_url, delivery_pincodes, all_india_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category || '', price, old_price || null, masterStock, image_url || '', hover_image_url || '', description || '', status || 'Active', imagesJson, images360Json, meta_title || '', meta_description || '', meta_keywords || '', sirv_spin_url || '', pincodesJson, allIndia]
    );
    res.json({ id: result.insertId, name, category, price, old_price, stock: masterStock, image_url, status: status || 'Active', images, images_360, meta_title, meta_description, meta_keywords, sirv_spin_url, delivery_pincodes, all_india_delivery });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateProduct = async (req, res) => {
  const { name, category, price, old_price, stock, image_url, hover_image_url, description, status, images, images_360, meta_title, meta_description, meta_keywords, sirv_spin_url, delivery_pincodes, all_india_delivery } = req.body;
  const imagesJson = images ? JSON.stringify(images) : '[]';
  const images360Json = images_360 ? JSON.stringify(images_360) : '[]';
  const pincodesJson = delivery_pincodes ? JSON.stringify(delivery_pincodes) : '[]';
  const allIndia = all_india_delivery ? 1 : 0;
  try {
    await db.query(
      'UPDATE products SET name=?, category=?, price=?, old_price=?, stock=?, image_url=?, hover_image_url=?, description=?, status=?, images=?, images_360=?, meta_title=?, meta_description=?, meta_keywords=?, sirv_spin_url=?, delivery_pincodes=?, all_india_delivery=? WHERE id=?',
      [name, category, price, old_price || null, stock, image_url, hover_image_url, description, status, imagesJson, images360Json, meta_title, meta_description, meta_keywords, sirv_spin_url, pincodesJson, allIndia, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.checkPincodeAvailability = async (req, res) => {
  const { id } = req.params;
  const { pincode } = req.query;

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ available: false, message: 'Invalid pincode. Please enter a 6-digit pincode.' });
  }

  try {
    const [[product]] = await db.query('SELECT all_india_delivery, delivery_pincodes FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ available: false, message: 'Product not found.' });

    // All over India — always available
    if (product.all_india_delivery === 1 || product.all_india_delivery === true) {
      return res.json({ available: true, message: '✅ Deliverable across India! Estimated delivery in 3-5 days.' });
    }

    // Parse pincode list
    let pincodes = [];
    if (typeof product.delivery_pincodes === 'string') {
      try { pincodes = JSON.parse(product.delivery_pincodes); } catch(e) { pincodes = []; }
    } else if (Array.isArray(product.delivery_pincodes)) {
      pincodes = product.delivery_pincodes;
    }

    // No pincodes configured — treat as not available
    if (pincodes.length === 0) {
      return res.json({ available: false, message: '❌ Delivery not available at this pincode currently.' });
    }

    const isAvailable = pincodes.map(p => String(p).trim()).includes(String(pincode).trim());
    if (isAvailable) {
      return res.json({ available: true, message: '✅ Available! Estimated delivery in 3-5 days.' });
    } else {
      return res.json({ available: false, message: '❌ Sorry, delivery not available at this pincode.' });
    }
  } catch (error) {
    res.status(500).json({ available: false, message: 'Error checking pincode.', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.likeProduct = async (req, res) => {
  try {
    const [result] = await db.query('UPDATE products SET likes = COALESCE(likes, 0) + 1 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    
    const [[product]] = await db.query('SELECT likes FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product liked', likes: product.likes });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Inventory Specific
exports.getInventory = async (req, res) => {
  const distributorId = req.query.distributor_id;
  try {
    if (distributorId) {
      const [rows] = await db.query(`
        SELECT 
          p.id, 
          p.name, 
          p.category, 
          p.price, 
          p.old_price, 
          p.image_url, 
          p.status as catalog_status,
          COALESCE(MAX(di.stock_quantity), MAX(di.stock), 0) as stock,
          50 as min_stock
        FROM products p
        LEFT JOIN distributor_inventory di 
          ON di.product_id = p.id AND di.distributor_id = ?
        GROUP BY p.id, p.name, p.category, p.price, p.old_price, p.image_url, p.status
        ORDER BY p.id ASC
      `, [distributorId]);
      return res.json({ products: rows });
    }
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

exports.searchProducts = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const queryStr = `%${q}%`;
    const [rows] = await db.query(
      `SELECT *, 
       (CASE 
          WHEN name LIKE ? THEN 10
          WHEN category LIKE ? THEN 5
          WHEN description LIKE ? THEN 2
          ELSE 1
        END) as relevance 
       FROM products 
       WHERE name LIKE ? OR category LIKE ? OR description LIKE ? OR meta_keywords LIKE ?
       ORDER BY relevance DESC, created_at DESC`,
      [queryStr, queryStr, queryStr, queryStr, queryStr, queryStr, queryStr]
    );

    const parsedRows = rows.map(row => {
      if (typeof row.images === 'string') {
        try { row.images = JSON.parse(row.images); } catch(e) { row.images = []; }
      }
      if (typeof row.images_360 === 'string') {
        try { row.images_360 = JSON.parse(row.images_360); } catch(e) { row.images_360 = []; }
      }
      return row;
    });

    res.json(parsedRows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getRecommendations = async (req, res) => {
  const { customerId, productId } = req.query;
  try {
    let productsToReturn = [];

    // Case 1: Based on current product (Category matching)
    if (productId && productId !== 'undefined') {
      const [[currentProduct]] = await db.query('SELECT category FROM products WHERE id = ?', [productId]);
      if (currentProduct) {
        const [rows] = await db.query(
          'SELECT * FROM products WHERE category = ? AND id != ? AND status = "Active" LIMIT 4',
          [currentProduct.category, productId]
        );
        productsToReturn = rows;
      }
    }

    // Case 2: Based on Customer Intent & Interest scoring (from activities)
    if (productsToReturn.length === 0 && customerId && customerId !== 'undefined') {
      const [activities] = await db.query(
        'SELECT product_name, type FROM customer_activity WHERE customer_id = ? ORDER BY timestamp DESC LIMIT 50',
        [customerId]
      );
      
      if (activities.length > 0) {
        const interestMap = {};
        for (const act of activities) {
          if (!act.product_name) continue;
          let points = 1;
          if (act.type?.toLowerCase() === 'cart') points = 5;
          if (act.type?.toLowerCase() === 'wishlist') points = 3;
          interestMap[act.product_name] = (interestMap[act.product_name] || 0) + points;
        }

        const sortedProducts = Object.keys(interestMap).sort((a, b) => interestMap[b] - interestMap[a]);
        
        if (sortedProducts.length > 0) {
          const placeholders = sortedProducts.map(() => '?').join(',');
          const [rows] = await db.query(
            `SELECT * FROM products WHERE name IN (${placeholders}) AND status = "Active" LIMIT 4`,
            sortedProducts
          );
          productsToReturn = rows;
        }
      }
    }

    // Case 3: Fallback (Best Sellers / Highly Engaged / Random Products)
    if (productsToReturn.length < 4) {
      const needed = 4 - productsToReturn.length;
      const excludeIds = productsToReturn.map(p => p.id);
      let query = 'SELECT * FROM products WHERE status = "Active"';
      let params = [];
      if (excludeIds.length > 0) {
        query += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        params = [...excludeIds];
      }
      if (productId && productId !== 'undefined') {
        query += ' AND id != ?';
        params.push(productId);
      }
      query += ' ORDER BY likes DESC, created_at DESC LIMIT ?';
      params.push(needed);
      
      const [fallbackRows] = await db.query(query, params);
      productsToReturn = [...productsToReturn, ...fallbackRows];
    }

    // Parse JSON lists
    const parsed = productsToReturn.map(row => {
      if (typeof row.images === 'string') {
        try { row.images = JSON.parse(row.images); } catch(e) { row.images = []; }
      }
      if (typeof row.images_360 === 'string') {
        try { row.images_360 = JSON.parse(row.images_360); } catch(e) { row.images_360 = []; }
      }
      return row;
    });

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Review System Functions
exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const { customerId } = req.query;
  
  try {
    // Get all reviews for this product
    const [rows] = await db.query(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );

    const reviews = rows.map(r => ({
      id: r.id,
      product_id: r.product_id,
      user: r.user_name,
      user_name: r.user_name,
      rating: Number(r.rating) || 5,
      text: r.review_text,
      review_text: r.review_text,
      helpful: Number(r.helpful_count) || 0,
      helpful_count: Number(r.helpful_count) || 0,
      date: r.created_at,
      created_at: r.created_at
    }));

    // Check if current customer has already reviewed
    let hasReviewed = false;
    if (customerId && customerId !== 'undefined') {
      const [existingReview] = await db.query(
        'SELECT id FROM product_reviews WHERE product_id = ? AND customer_id = ?',
        [productId, customerId]
      );
      hasReviewed = existingReview.length > 0;
    }

    res.json({
      reviews: reviews,
      hasReviewed: hasReviewed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProductReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, text, user, customerId } = req.body;
  
  try {
    const reviewUser = (user || 'Verified Customer').trim();
    const reviewText = (text || '').trim();
    const reviewRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    // Insert the review with automatic current timestamp
    const [result] = await db.query(
      'INSERT INTO product_reviews (product_id, customer_id, user_name, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [productId, customerId || null, reviewUser, reviewRating, reviewText]
    );

    // Fetch product name for testimonials
    let productName = '';
    try {
      const [[product]] = await db.query('SELECT name FROM products WHERE id = ?', [productId]);
      if (product) productName = product.name;
    } catch (e) {}

    // Also sync to testimonials table for "WHAT OUR CUSTOMERS SAY"
    try {
      await db.query(
        'INSERT INTO testimonials (name, rating, content, product_name, status, created_at) VALUES (?, ?, ?, ?, "Active", NOW())',
        [reviewUser, reviewRating, reviewText, productName]
      );
    } catch (e) {
      console.error('Failed to sync to testimonials table:', e.message);
    }

    // Calculate new average rating & count
    const [ratingData] = await db.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews FROM product_reviews WHERE product_id = ?',
      [productId]
    );

    const newAverage = ratingData[0].average_rating ? parseFloat(ratingData[0].average_rating).toFixed(1) : reviewRating;
    const totalReviews = ratingData[0].total_reviews || 1;

    // Update product with new rating
    await db.query(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [newAverage, totalReviews, productId]
    );

    res.json({
      success: true,
      reviewId: result.insertId,
      newAverage: parseFloat(newAverage),
      totalReviews: totalReviews,
      review: {
        id: result.insertId,
        product_id: parseInt(productId),
        user: reviewUser,
        user_name: reviewUser,
        rating: reviewRating,
        text: reviewText,
        review_text: reviewText,
        helpful: 0,
        helpful_count: 0,
        date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markReviewHelpful = async (req, res) => {
  const { productId, reviewId } = req.params;
  
  try {
    await db.query(
      'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = ? AND product_id = ?',
      [reviewId, productId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

