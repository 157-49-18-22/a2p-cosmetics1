const db = require('../db');

const loginDealer = async (req, res) => {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [dealers] = await db.query('SELECT * FROM dealers WHERE email = ? AND status = "Active"', [email]);
    if (dealers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const dealer = dealers[0];
    if (dealer.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const payload = {
      id: dealer.id, name: dealer.name, email: dealer.email,
      phone: dealer.phone, business_name: dealer.business_name,
      zone: dealer.zone, role: dealer.role,
      credit_limit: dealer.credit_limit, distributor_id: dealer.distributor_id,
      status: dealer.status, type: 'dealer'
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('a2p_token', token, { httpOnly: true, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json(payload);
  } catch (error) {
    console.error('Dealer login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get All Dealers
const getAllDealers = async (req, res) => {
  try {
    const [dealers] = await db.query('SELECT * FROM dealers');
    res.json(dealers);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
};

// Get Dealer By ID
const getDealerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [dealers] = await db.query('SELECT * FROM dealers WHERE id = ?', [id]);
    
    if (dealers.length === 0) {
      return res.status(404).json({ error: 'Dealer not found' });
    }
    
    const { password, ...dealerData } = dealers[0];
    res.json(dealerData);
  } catch (error) {
    console.error('Error fetching dealer:', error);
    res.status(500).json({ error: 'Failed to fetch dealer' });
  }
};

// Update Dealer
const updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, business_name, gst, zone, role, credit_limit } = req.body;
    
    const query = `UPDATE dealers SET name = ?, email = ?, phone = ?, business_name = ?, gst = ?, zone = ?, role = ?, credit_limit = ? WHERE id = ?`;
    await db.query(query, [name, email, phone, business_name, gst, zone, role, credit_limit, id]);
    
    res.json({ message: 'Dealer updated successfully' });
  } catch (error) {
    console.error('Error updating dealer:', error);
    res.status(500).json({ error: 'Failed to update dealer' });
  }
};

// Delete Dealer
const deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM dealers WHERE id = ?', [id]);
    res.json({ message: 'Dealer deleted successfully' });
  } catch (error) {
    console.error('Error deleting dealer:', error);
    res.status(500).json({ error: 'Failed to delete dealer' });
  }
};

// Create Dealer Order
const createOrder = async (req, res) => {
  try {
    let { dealer_id, distributor_id, items, total_amount, required_by } = req.body;
    
    dealer_id = dealer_id || 1;
    distributor_id = distributor_id || 1;
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Missing required order items' });
    }
    
    // Validate stock availability
    for (const item of items) {
      const prodId = item.id ? String(item.id).replace('PRD-', '') : null;
      const [prods] = await db.query('SELECT stock, name FROM products WHERE id = ? OR name = ?', [prodId, item.name]);
      if (prods.length > 0) {
        const availableStock = parseInt(prods[0].stock) || 0;
        const requestedQty = parseInt(item.quantity) || 1;
        if (requestedQty > availableStock) {
          return res.status(400).json({
            error: `Insufficient stock for "${prods[0].name}". Available: ${availableStock} units, Requested: ${requestedQty} units.`
          });
        }
      }
    }

    const order_number = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Insert into dealer_orders
    const [result] = await db.query(
      'INSERT INTO dealer_orders (dealer_id, distributor_id, order_number, total_amount, status) VALUES (?, ?, ?, ?, "Pending")',
      [dealer_id, distributor_id, order_number, total_amount]
    );
    
    const order_id = result.insertId;
    
    // Insert items
    for (const item of items) {
      const priceVal = parseFloat(String(item.price || '0').replace(/[^0-9.]/g, ''));
      const prodId = item.id ? String(item.id).replace('PRD-', '') : null;
      await db.query(
        'INSERT INTO dealer_order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [order_id, prodId, item.name, item.quantity, priceVal]
      );
    }
    
    // Attempt to log activity on distributor side
    try {
      await db.query(
        "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Alert')",
        [distributor_id, `New order ${order_number} received from Dealer #${dealer_id}`]
      );
    } catch (e) {
      console.error('Activity log error:', e);
    }
    
    res.json({ success: true, order_id, order_number, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
};

// Get Dealer's Own Orders
const getMyOrders = async (req, res) => {
  try {
    const dealerId = req.params.id;
    const [orders] = await db.query(
      `SELECT o.*, 
        (SELECT SUM(quantity) FROM dealer_order_items WHERE order_id = o.id) as total_items
       FROM dealer_orders o 
       WHERE o.dealer_id = ? 
       ORDER BY o.created_at DESC`,
      [dealerId]
    );
    res.json(orders);
  } catch (error) {
    console.error('Get dealer orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get Order Details
const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const [items] = await db.query(
      'SELECT product_name, quantity, price FROM dealer_order_items WHERE order_id = (SELECT id FROM dealer_orders WHERE order_number = ? LIMIT 1)',
      [orderId]
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// Get Dealer Allocations (Real dynamic products + dealer orders calculation)
const getDealerAllocations = async (req, res) => {
  try {
    const dealerId = req.params.id || 1;
    
    // 1. Fetch dealer details (credit limit, zone)
    const [dealers] = await db.query('SELECT credit_limit, zone FROM dealers WHERE id = ?', [dealerId]);
    const dealerInfo = dealers[0] || { credit_limit: 500000, zone: 'Zone A' };
    
    // 2. Fetch active products
    const [products] = await db.query('SELECT * FROM products WHERE status != "Inactive"');
    
    // 3. Fetch total used quantities per product for this dealer from dealer_order_items
    const [usageRows] = await db.query(`
      SELECT doi.product_id, doi.product_name, SUM(doi.quantity) as total_used, SUM(doi.quantity * doi.price) as total_spent
      FROM dealer_order_items doi
      JOIN dealer_orders do ON doi.order_id = do.id
      WHERE do.dealer_id = ? AND do.status != 'Cancelled'
      GROUP BY doi.product_id, doi.product_name
    `, [dealerId]);
    
    const usageMap = {};
    usageRows.forEach(row => {
      if (row.product_id) {
        usageMap[String(row.product_id)] = {
          used: Number(row.total_used || 0),
          spent: Number(row.total_spent || 0)
        };
      }
      if (row.product_name) {
        usageMap[row.product_name.toLowerCase()] = {
          used: Number(row.total_used || 0),
          spent: Number(row.total_spent || 0)
        };
      }
    });
    
    const allocations = products.map((prod, index) => {
      const prodKey = String(prod.id);
      const usage = usageMap[prodKey] || usageMap[prod.name.toLowerCase()] || { used: 0, spent: 0 };
      
      const priceVal = Number(prod.price || 0);
      const totalStock = Number(prod.stock || 500);
      const allocatedQty = totalStock > 0 ? totalStock : 500;
      const usedQty = usage.used;
      const remainingQty = Math.max(0, allocatedQty - usedQty);
      const limitVal = allocatedQty * priceVal;
      
      let status = 'Active';
      const remPercent = (remainingQty / allocatedQty) * 100;
      if (remPercent <= 10) status = 'Critical';
      else if (remPercent <= 30) status = 'Low Stock';

      return {
        id: `ALC-${String(prod.id || index + 1).padStart(3, '0')}`,
        productId: prod.id,
        product: prod.name,
        category: prod.category || 'General',
        zone: dealerInfo.zone || 'Zone A',
        allocated: allocatedQty,
        used: usedQty,
        remaining: remainingQty,
        price: priceVal,
        limit: `₹${limitVal.toLocaleString('en-IN')}`,
        limitVal: limitVal,
        status: status
      };
    });
    
    res.json({
      allocations,
      creditLimit: dealerInfo.credit_limit || 500000,
      zone: dealerInfo.zone || 'Zone A'
    });
  } catch (error) {
    console.error('Get dealer allocations error:', error);
    res.status(500).json({ error: 'Failed to fetch dealer allocations' });
  }
};

module.exports = {
  loginDealer,
  getAllDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
  createOrder,
  getMyOrders,
  getOrderDetails,
  getDealerAllocations
};
