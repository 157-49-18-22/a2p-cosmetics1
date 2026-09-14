const db = require('../db');

exports.getAllPromos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPromo = async (req, res) => {
  const { code, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date, applicable_to, applicable_product_ids } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO promo_codes 
       (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date, applicable_to, applicable_product_ids) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), discount_type, discount_value, min_order_value || 0, max_discount || null, usage_limit || null, start_date || null, end_date || null, applicable_to || 'all', JSON.stringify(applicable_product_ids || [])]
    );
    res.json({ id: result.insertId, message: 'Promo code created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Promo code already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.updatePromoStatus = async (req, res) => {
  const { is_active } = req.body;
  try {
    await db.query('UPDATE promo_codes SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    res.json({ message: 'Promo status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    await db.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Validates and Calculates the Discount
exports.validatePromo = async (req, res) => {
  const { code, cart_subtotal, cart_items } = req.body;
  try {
    const [promos] = await db.query('SELECT * FROM promo_codes WHERE code = ?', [code.toUpperCase()]);
    if (promos.length === 0) return res.status(400).json({ error: 'Invalid Promo Code' });
    
    const promo = promos[0];

    // Status check
    if (!promo.is_active) return res.status(400).json({ error: 'Promo code is inactive' });
    
    // Usage limit check
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    // Date check
    const now = new Date();
    if (promo.start_date && new Date(promo.start_date) > now) return res.status(400).json({ error: 'Promo code not active yet' });
    if (promo.end_date && new Date(promo.end_date) < now) return res.status(400).json({ error: 'Promo code has expired' });

    // Min Order Value
    if (cart_subtotal < promo.min_order_value) {
      return res.status(400).json({ error: `Minimum order value of Rs.${promo.min_order_value} required` });
    }

    let discountAmount = 0;
    
    // Calculate based on applicability
    if (promo.applicable_to === 'all') {
      if (promo.discount_type === 'fixed') {
        discountAmount = parseFloat(promo.discount_value);
      } else {
        discountAmount = (cart_subtotal * parseFloat(promo.discount_value)) / 100;
      }
    } else {
      // Product specific discount
      const allowedIds = promo.applicable_product_ids || [];
      let applicableSubtotal = 0;
      cart_items.forEach(item => {
        if (allowedIds.includes(item.product_id || item.id)) {
          applicableSubtotal += (item.price * item.quantity);
        }
      });

      if (applicableSubtotal === 0) {
        return res.status(400).json({ error: 'Promo code not applicable to items in your cart' });
      }

      if (promo.discount_type === 'fixed') {
        discountAmount = parseFloat(promo.discount_value); // fixed amount off the applicable items
      } else {
        discountAmount = (applicableSubtotal * parseFloat(promo.discount_value)) / 100;
      }
    }

    // Apply max discount cap
    if (promo.max_discount && discountAmount > promo.max_discount) {
      discountAmount = parseFloat(promo.max_discount);
    }

    // Don't discount more than the cart value
    if (discountAmount > cart_subtotal) {
      discountAmount = cart_subtotal;
    }

    res.json({
      success: true,
      code: promo.code,
      discount_amount: parseFloat(discountAmount).toFixed(2),
      message: 'Promo code applied successfully!'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
