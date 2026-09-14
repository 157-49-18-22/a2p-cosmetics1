const db = require('../db');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Stats for Admin View
exports.getAdminStats = async (req, res) => {
  try {
    const [[{ active_partners }]] = await db.query("SELECT COUNT(*) as active_partners FROM distributors WHERE status = 'Active'");
    const [[{ total_credit }]] = await db.query('SELECT SUM(credit_limit) as total_credit FROM distributors');
    const [[{ total_outstanding }]] = await db.query('SELECT SUM(balance) as total_outstanding FROM distributors');
    const [[{ platinum_partners }]] = await db.query("SELECT COUNT(*) as platinum_partners FROM distributors WHERE tier = 'Platinum'");
    res.json({ active_partners, total_credit: total_credit || 0, total_outstanding: total_outstanding || 0, platinum_partners });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Login
exports.loginDistributor = async (req, res) => {
  const { email, password } = req.body;
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';
  try {
    const [rows] = await db.query('SELECT * FROM distributors WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const distributor = rows[0];
    if (distributor.status !== 'Active') {
      return res.status(403).json({ error: 'Your account is not active' });
    }
    const payload = { id: distributor.id, name: distributor.name, email: distributor.email, role: distributor.role, type: 'distributor' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('a2p_token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json(payload);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// CRM List
exports.getAllDistributors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, 
             (SELECT COUNT(*) FROM stock_requests s WHERE s.distributor_id = d.id AND s.status = 'Pending') as pending_requests
      FROM distributors d
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create
exports.createDistributor = async (req, res) => {
  const { name, email, password, phone, role, tier, region, credit_limit, balance, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO distributors (name, email, password, phone, role, tier, region, credit_limit, balance, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password || 'a2p123', phone, role || 'Senior Distributor', tier || 'Bronze', region || 'Not Set', credit_limit || 0, balance || 0, status || 'Active']
    );
    res.json({ id: result.insertId, message: 'Distributor added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Update
exports.updateDistributor = async (req, res) => {
  const { name, email, phone, role, tier, region, credit_limit, balance, status } = req.body;
  try {
    await db.query(
      'UPDATE distributors SET name=?, email=?, phone=?, role=?, tier=?, region=?, credit_limit=?, balance=?, status=? WHERE id=?',
      [name, email, phone, role, tier, region, credit_limit, balance, status, req.params.id]
    );
    res.json({ message: 'Distributor updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Delete
exports.deleteDistributor = async (req, res) => {
  try {
    await db.query('DELETE FROM distributors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Distributor deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Distributor Portal Stats
exports.getDistributorStats = async (req, res) => {
  const distId = req.params.id;
  try {
    const [[{ total_dealers }]] = await db.query('SELECT COUNT(*) as total_dealers FROM dealers WHERE distributor_id = ?', [distId]);
    const [[{ active_orders }]] = await db.query("SELECT COUNT(*) as active_orders FROM distributor_orders WHERE distributor_id = ? AND status != 'Delivered' AND status != 'Cancelled'", [distId]);
    const [[{ monthly_revenue }]] = await db.query("SELECT SUM(amount) as monthly_revenue FROM distributor_orders WHERE distributor_id = ? AND status = 'Delivered' AND MONTH(created_at) = MONTH(CURRENT_DATE())", [distId]);
    res.json({ total_dealers, active_orders, monthly_revenue: monthly_revenue || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Dealers
exports.getDealers = async (req, res) => {
  try {
    console.log('Fetching dealers for distributor:', req.params.id);
    const [rows] = await db.query('SELECT * FROM dealers WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    console.log('Dealers found:', rows.length, 'dealers');
    res.json(rows);
  } catch (error) { 
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: error.message }); 
  }
};

exports.getSingleDealer = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dealers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Dealer not found' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Dealer (Onboarding)
exports.createDealer = async (req, res) => {
  const { distributor_id, name, contact_person, phone, email, password, confirm_password, zone, type, status, business_name, gst, role, credit_limit } = req.body;
  try {
    if (!distributor_id) {
      return res.status(400).json({ error: 'Distributor ID is required' });
    }
    const dealerName = (name || contact_person || business_name || '').trim();
    if (!dealerName) {
      return res.status(400).json({ error: 'Business name or contact name is required' });
    }

    // Password validation
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Ensure status ENUM supports Pending (older DBs)
    try {
      await db.query(
        "ALTER TABLE dealers MODIFY COLUMN status ENUM('Active','Inactive','Pending','Rejected') DEFAULT 'Pending'"
      );
    } catch (e) { /* already migrated */ }

    // Ensure password column exists
    try {
      await db.query("ALTER TABLE dealers ADD COLUMN password VARCHAR(255)");
    } catch (e) { /* column already exists */ }

    console.log('Creating dealer with data:', { distributor_id, dealerName, phone, email, zone, type, status, business_name, gst, role, credit_limit });
    
    const [result] = await db.query(
      'INSERT INTO dealers (distributor_id, name, contact_person, phone, email, password, zone, type, status, business_name, gst, role, credit_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [distributor_id, dealerName, contact_person || null, phone || null, email || null, password, zone || 'Zone A', type || 'Dealer', status || 'Pending', business_name || null, gst || null, role || null, credit_limit || null]
    );
    
    console.log('Dealer created successfully with ID:', result.insertId);

    try {
      await db.query(
        "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Success')",
        [distributor_id, `New application submitted for "${dealerName}" (${type || 'Dealer'})`]
      );
    } catch (logErr) {
      console.error('Activity log failed (dealer still created):', logErr.message);
    }

    res.json({ id: result.insertId, message: 'Application submitted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateDealerStatus = async (req, res) => {
  const { status } = req.body;
  try {
    if (!['Active', 'Inactive', 'Pending', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.query('UPDATE dealers SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Dealer status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteDealer = async (req, res) => {
  try {
    await db.query('DELETE FROM dealers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dealer deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Campaigns
exports.getCampaigns = async (req, res) => {
  try {
    console.log('Fetching campaigns for distributor:', req.params.id);
    const [rows] = await db.query('SELECT * FROM branding_campaigns WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    console.log('Campaigns found:', rows.length, 'campaigns');
    res.json(rows);
  } catch (error) { 
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: error.message }); 
  }
};

// Campaigns filtered by dealer's zone (for Dealer Portal)
exports.getCampaignsForDealer = async (req, res) => {
  try {
    const dealerId = req.params.dealerId;
    // Get dealer's distributor_id and zone
    const [[dealer]] = await db.query('SELECT distributor_id, zone FROM dealers WHERE id = ?', [dealerId]);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    const distributor_id = dealer.distributor_id;
    const zone = dealer.zone || 'Zone A';
    // Return campaigns where zone matches dealer's zone OR is "All Zones"
    const [rows] = await db.query(
      `SELECT * FROM branding_campaigns 
       WHERE distributor_id = ? 
         AND (zone = 'All Zones' OR zone = ? OR zone LIKE ? OR zone LIKE ?)
       ORDER BY created_at DESC`,
      [distributor_id, zone, `%${zone}%`, `${zone}%`]
    );
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Campaign
exports.createCampaign = async (req, res) => {
  const { distributor_id, title, type, zone, budget, start_date, end_date, description, status } = req.body;
  console.log('Creating campaign with status:', status);
  console.log('Full request body:', req.body);
  try {
    const finalStatus = status || 'Upcoming';
    console.log('Final status to save:', finalStatus);
    const [result] = await db.query(
      "INSERT INTO branding_campaigns (distributor_id, title, type, zone, budget, start_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [distributor_id, title, type, zone, budget || 0, start_date, end_date, description, finalStatus]
    );
    console.log('Campaign created with ID:', result.insertId, 'and status:', finalStatus);
    res.json({ id: result.insertId, message: 'Campaign created' });
  } catch (error) { 
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message }); 
  }
};

// Update Campaign
exports.updateCampaign = async (req, res) => {
  const { title, type, zone, budget, start_date, end_date, description, status } = req.body;
  try {
    await db.query(
      'UPDATE branding_campaigns SET title=?, type=?, zone=?, budget=?, start_date=?, end_date=?, description=?, status=? WHERE id=?',
      [title, type, zone, budget, start_date, end_date, description, status, req.params.id]
    );
    res.json({ message: 'Campaign updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Assets
exports.getAssets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, c.title as campaign_title 
      FROM branding_assets a 
      LEFT JOIN branding_campaigns c ON a.campaign_id = c.id 
      WHERE a.distributor_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createAsset = async (req, res) => {
  const { distributor_id, name, type, campaign_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO branding_assets (distributor_id, name, type, campaign_id, file_format, file_size) VALUES (?, ?, ?, ?, "PDF", "2.0 MB")',
      [distributor_id, name, type, campaign_id || null]
    );
    res.json({ id: result.insertId, message: 'Asset uploaded' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteCampaign = async (req, res) => {
  try {
    await db.query('DELETE FROM branding_campaigns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campaign deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteAsset = async (req, res) => {
  try {
    await db.query('DELETE FROM branding_assets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Asset deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Zones
exports.getZones = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM distributor_zones WHERE distributor_id = ? ORDER BY id DESC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createZone = async (req, res) => {
  const { distributor_id, zone_name, region, assigned_to, status } = req.body;
  try {
    if (!distributor_id || !zone_name) {
      return res.status(400).json({ error: 'Distributor and zone name are required' });
    }
    const [result] = await db.query(
      "INSERT INTO distributor_zones (distributor_id, zone_name, region, assigned_to, status) VALUES (?, ?, ?, ?, ?)",
      [distributor_id, zone_name, region || '', assigned_to || 'Unassigned', status || 'Allocated']
    );
    res.json({ id: result.insertId, message: 'Zone allocated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateZone = async (req, res) => {
  const { zone_name, region, assigned_to, status } = req.body;
  try {
    await db.query(
      "UPDATE distributor_zones SET zone_name=?, region=?, assigned_to=?, status=? WHERE id=?",
      [zone_name, region || '', assigned_to || 'Unassigned', status || 'Allocated', req.params.id]
    );
    res.json({ message: 'Zone updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteZone = async (req, res) => {
  try {
    await db.query('DELETE FROM distributor_zones WHERE id = ?', [req.params.id]);
    res.json({ message: 'Zone removed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Order
exports.createOrder = async (req, res) => {
  const { distributor_id, amount, items_count } = req.body;
  const order_number = 'ORD-' + Math.floor(Math.random() * 1000000);
  try {
    const [result] = await db.query(
      "INSERT INTO distributor_orders (distributor_id, order_number, amount, items_count, status) VALUES (?, ?, ?, ?, 'Pending')",
      [distributor_id, order_number, amount, items_count]
    );
    // Log Activity
    await db.query(
      "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Success')",
      [distributor_id, `New Order ${order_number} created for ₹${amount}`]
    );
    res.json({ id: result.insertId, order_number });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Invoice/Bill
exports.createInvoice = async (req, res) => {
  const { 
    distributor_id, 
    amount, 
    due_date, 
    bill_number, 
    status,
    buyer_name,
    buyer_company,
    buyer_address,
    buyer_city,
    buyer_state,
    buyer_pincode,
    buyer_contact,
    buyer_email,
    buyer_gstin,
    products,
    bank_account_holder,
    bank_account_number,
    bank_name,
    bank_ifsc,
    bank_branch
  } = req.body;
  const final_bill_number = bill_number || ('INV-' + Math.floor(100000 + Math.random() * 900000));
  const valid_due_date = due_date && String(due_date).trim() !== '' ? due_date : null;
  try {
    const [result] = await db.query(
      `INSERT INTO distributor_bills (
        distributor_id, bill_number, amount, due_date, status,
        buyer_name, buyer_company, buyer_address, buyer_city, buyer_state, buyer_pincode,
        buyer_contact, buyer_email, buyer_gstin, products,
        bank_account_holder, bank_account_number, bank_name, bank_ifsc, bank_branch
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        distributor_id || 1, final_bill_number, amount || 0, valid_due_date, status || 'Unpaid',
        buyer_name || null, buyer_company || null, buyer_address || null, buyer_city || null, 
        buyer_state || null, buyer_pincode || null, buyer_contact || null, buyer_email || null, 
        buyer_gstin || null, products ? JSON.stringify(products) : null,
        bank_account_holder || null, bank_account_number || null, bank_name || null, 
        bank_ifsc || null, bank_branch || null
      ]
    );
    // Log Activity
    try {
      await db.query(
        "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Invoice')",
        [distributor_id || 1, `Invoice ${final_bill_number} generated for ₹${amount}`]
      );
    } catch (actErr) {
      console.warn("Activity log skipped:", actErr.message);
    }
    res.json({ id: result.insertId, bill_number: final_bill_number });
  } catch (error) { 
    console.error("Create invoice error:", error);
    res.status(500).json({ error: error.message }); 
  }
};

exports.updateInvoice = async (req, res) => {
  const { 
    amount, 
    due_date, 
    bill_number, 
    status,
    buyer_name,
    buyer_company,
    buyer_address,
    buyer_city,
    buyer_state,
    buyer_pincode,
    buyer_contact,
    buyer_email,
    buyer_gstin,
    products,
    bank_account_holder,
    bank_account_number,
    bank_name,
    bank_ifsc,
    bank_branch
  } = req.body;
  const valid_due_date = due_date && String(due_date).trim() !== '' ? due_date : null;
  try {
    await db.query(
      `UPDATE distributor_bills SET 
        bill_number=?, amount=?, due_date=?, status=?,
        buyer_name=?, buyer_company=?, buyer_address=?, buyer_city=?, buyer_state=?, buyer_pincode=?,
        buyer_contact=?, buyer_email=?, buyer_gstin=?, products=?,
        bank_account_holder=?, bank_account_number=?, bank_name=?, bank_ifsc=?, bank_branch=?
       WHERE id=?`,
      [
        bill_number, amount || 0, valid_due_date, status || 'Unpaid',
        buyer_name || null, buyer_company || null, buyer_address || null, buyer_city || null, 
        buyer_state || null, buyer_pincode || null, buyer_contact || null, buyer_email || null, 
        buyer_gstin || null, products ? JSON.stringify(products) : null,
        bank_account_holder || null, bank_account_number || null, bank_name || null, 
        bank_ifsc || null, bank_branch || null,
        req.params.id
      ]
    );
    res.json({ message: 'Invoice updated' });
  } catch (error) { 
    console.error("Update invoice error:", error);
    res.status(500).json({ error: error.message }); 
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    await db.query('DELETE FROM distributor_bills WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getBills = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM distributor_bills WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    // Safely handle JSON fields for each bill
    const billsWithParsedData = rows.map(bill => {
      let parsedProducts = bill.products;
      if (typeof bill.products === 'string') {
        try {
          parsedProducts = JSON.parse(bill.products);
        } catch (e) {
          parsedProducts = [];
        }
      }
      return {
        ...bill,
        products: parsedProducts || []
      };
    });
    res.json(billsWithParsedData);
  } catch (error) { 
    console.error("Error in getBills:", error);
    res.status(500).json({ error: error.message }); 
  }
};

// Activity
exports.getActivity = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM distributor_activity WHERE distributor_id = ? ORDER BY created_at DESC LIMIT 50', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Top Performers
exports.getTopPerformers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name, d.zone, SUM(o.amount) as revenue 
      FROM dealers d
      JOIN distributor_orders o ON d.id = o.distributor_id
      WHERE d.distributor_id = ?
      GROUP BY d.id
      ORDER BY revenue DESC
      LIMIT 3
    `, [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Super Stockists
exports.getStockists = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM super_stockists WHERE distributor_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createStockist = async (req, res) => {
  const { distributor_id, name, zone, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO super_stockists (distributor_id, name, zone, status) VALUES (?, ?, ?, ?)',
      [distributor_id, name, zone, status || 'Active']
    );
    res.json({ id: result.insertId, message: 'Super Stockist added' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Stock Requests (Distributor to Admin)
exports.getStockRequests = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_requests WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getStockRequestItems = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stock_request_items WHERE request_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Get Distributor-specific allocated inventory
exports.getDistributorInventory = async (req, res) => {
  const distributorId = req.params.id;
  try {
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
    res.json({ products: rows });
  } catch (error) { 
    console.error('getDistributorInventory error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

exports.updateStockRequestStatus = async (req, res) => {
  const { status } = req.body;
  try {
    if (!['Pending', 'Approved', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.query('UPDATE stock_requests SET status = ? WHERE id = ?', [status, req.params.id]);
    
    // If Approved, add stock to distributor's inventory
    if (status === 'Approved') {
      const [[reqRow]] = await db.query('SELECT * FROM stock_requests WHERE id = ?', [req.params.id]);
      const [items] = await db.query('SELECT * FROM stock_request_items WHERE request_id = ?', [req.params.id]);
      const distId = reqRow ? reqRow.distributor_id : null;
      
      for (const item of items) {
        const qty = parseInt(item.quantity) || 0;
        let prodId = item.product_id;
        if (!prodId && item.product_name) {
          const [[prod]] = await db.query('SELECT id FROM products WHERE name = ?', [item.product_name]);
          if (prod) prodId = prod.id;
        }

        if (distId && prodId) {
          // Add to distributor's personal allocated inventory
          await db.query(`
            INSERT INTO distributor_inventory (distributor_id, product_id, stock_quantity, stock)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE stock_quantity = stock_quantity + ?, stock = stock + ?
          `, [distId, prodId, qty, qty, qty, qty]);
        }

        try {
          await db.query(
            'INSERT INTO inventory_logs (product_id, product_name, change_type, quantity_change, agent) VALUES (?, ?, ?, ?, ?)',
            [prodId || null, item.product_name || 'Product', 'Stock In', qty, `Admin Approved - ${reqRow?.request_number || req.params.id}`]
          );
        } catch (logErr) { console.error('Log error:', logErr); }
      }
      
      if (reqRow) {
        await db.query(
          "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Success')",
          [reqRow.distributor_id, `Stock Request ${reqRow.request_number} APPROVED — Stock added to your inventory`]
        );
      }
    } else {
      try {
        const [[reqRow]] = await db.query('SELECT distributor_id, request_number FROM stock_requests WHERE id = ?', [req.params.id]);
        if (reqRow) {
          await db.query(
            "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Info')",
            [reqRow.distributor_id, `Stock Request ${reqRow.request_number} marked as ${status} by Admin`]
          );
        }
      } catch (logErr) {
        console.error('Activity log failed (status still updated):', logErr.message);
      }
    }
    
    res.json({ message: `Request status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createStockRequest = async (req, res) => {
  const { distributor_id, items, total_amount } = req.body;
  const request_number = 'REQ-' + Math.floor(Math.random() * 1000000);
  try {
    const [result] = await db.query(
      "INSERT INTO stock_requests (distributor_id, request_number, total_amount, status) VALUES (?, ?, ?, 'Pending')",
      [distributor_id, request_number, total_amount]
    );
    const requestId = result.insertId;

    for (const item of items) {
      await db.query(
        'INSERT INTO stock_request_items (request_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [requestId, item.id, item.name, item.quantity, item.price]
      );
    }

    // Log Activity
    await db.query(
      "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Success')",
      [distributor_id, `Stock Request ${request_number} sent to Admin for ₹${total_amount}`]
    );

    res.json({ id: requestId, request_number, message: 'Stock request sent successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Razorpay Order for Stock Request
exports.createStockRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `stock_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ success: false, message: 'Could not create Razorpay order' });
    res.json({ success: true, order_id: order.id, amount: order.amount, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay Stock Order Error:', error);
    res.status(500).json({ success: false, message: 'Razorpay error' });
  }
};

// Verify Payment & Save Stock Request
exports.verifyStockPayment = async (req, res) => {
  const { distributor_id, items, total_amount, payment_id, razorpay_order_id, payment_method } = req.body;
  const request_number = 'REQ-' + Math.floor(Math.random() * 1000000);
  try {
    const [result] = await db.query(
      "INSERT INTO stock_requests (distributor_id, request_number, total_amount, status, payment_status, payment_id, payment_method) VALUES (?, ?, ?, 'Pending', 'Paid', ?, ?)",
      [distributor_id, request_number, total_amount, payment_id || null, payment_method || 'Online']
    );
    const requestId = result.insertId;

    for (const item of items) {
      await db.query(
        'INSERT INTO stock_request_items (request_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [requestId, item.id, item.name, item.quantity, item.price]
      );
    }

    await db.query(
      "INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, 'Success')",
      [distributor_id, `Stock Request ${request_number} paid via ${payment_method || 'Online'} — ₹${total_amount}`]
    );

    res.json({ success: true, request_number, message: 'Payment received & stock request submitted!' });
  } catch (error) {
    console.error('Verify stock payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDealerOrders = async (req, res) => {
  try {
    const distributorId = req.params.id;
    const [orders] = await db.query(
      `SELECT o.id, o.order_number, o.created_at as date, o.total_amount as total, o.status, 
              d.name as dealerName, d.phone as dealerPhone, d.email as dealerEmail, d.business_name as dealerBusiness, 
              o.created_at as requiredBy 
       FROM dealer_orders o 
       JOIN dealers d ON o.dealer_id = d.id 
       WHERE o.distributor_id = ? 
       ORDER BY o.created_at DESC`,
      [distributorId]
    );
    for (let order of orders) {
      const [items] = await db.query('SELECT id, product_id, product_name, quantity, price FROM dealer_order_items WHERE order_id = ?', [order.id]);
      order.order_items = items || [];
      order.items = (items || []).reduce((sum, it) => sum + (parseInt(it.quantity) || 0), 0);
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDealerOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    
    // 1. Fetch current order details including stock_deducted flag
    const numId = parseInt(String(orderId).replace(/[^0-9]/g, '')) || 0;
    const [orders] = await db.query(
      'SELECT * FROM dealer_orders WHERE order_number = ? OR id = ? LIMIT 1',
      [orderId, numId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const order = orders[0];
    const distId = order.distributor_id || 1;

    // 2. Fetch order items
    const [items] = await db.query('SELECT * FROM dealer_order_items WHERE order_id = ?', [order.id]);

    const activeFulfillStatuses = ['Processing', 'Approved', 'Shipped', 'Delivered'];
    let stockDeducted = order.stock_deducted ? 1 : 0;

    // 3. Deduct stock if moving to an active fulfillment status and not already deducted
    if (activeFulfillStatuses.includes(status) && !stockDeducted) {
      for (const item of items) {
        const qty = parseInt(item.quantity) || 1;
        let prodId = item.product_id ? parseInt(String(item.product_id).replace(/[^0-9]/g, '')) : null;
        if (!prodId && item.product_name) {
          const [[prod]] = await db.query('SELECT id FROM products WHERE name = ? LIMIT 1', [item.product_name]);
          if (prod) prodId = prod.id;
        }

        if (distId && prodId) {
          // Deduct from distributor_inventory (both stock_quantity and stock)
          await db.query(`
            INSERT INTO distributor_inventory (distributor_id, product_id, stock_quantity, stock)
            VALUES (?, ?, 0, 0)
            ON DUPLICATE KEY UPDATE 
              stock_quantity = GREATEST(0, COALESCE(stock_quantity, stock, 0) - ?),
              stock = GREATEST(0, COALESCE(stock, stock_quantity, 0) - ?)
          `, [distId, prodId, qty, qty]);
        }

        // Log inventory change
        try {
          await db.query(
            'INSERT INTO inventory_logs (product_id, product_name, change_type, quantity_change, agent) VALUES (?, ?, ?, ?, ?)',
            [prodId || null, item.product_name || 'Product', 'Stock Out', -qty, `Dealer Order ${order.order_number || order.id} (${status})`]
          );
        } catch (logErr) {
          console.error('Inventory log error:', logErr);
        }
      }
      stockDeducted = 1;
    } 
    // 4. Restore stock if cancelled after being deducted
    else if (status === 'Cancelled' && stockDeducted) {
      for (const item of items) {
        const qty = parseInt(item.quantity) || 1;
        let prodId = item.product_id ? parseInt(String(item.product_id).replace(/[^0-9]/g, '')) : null;
        if (!prodId && item.product_name) {
          const [[prod]] = await db.query('SELECT id FROM products WHERE name = ? LIMIT 1', [item.product_name]);
          if (prod) prodId = prod.id;
        }

        if (distId && prodId) {
          // Add back to distributor_inventory (both stock_quantity and stock)
          await db.query(`
            INSERT INTO distributor_inventory (distributor_id, product_id, stock_quantity, stock)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              stock_quantity = COALESCE(stock_quantity, stock, 0) + ?,
              stock = COALESCE(stock, stock_quantity, 0) + ?
          `, [distId, prodId, qty, qty, qty, qty]);
        }

        try {
          await db.query(
            'INSERT INTO inventory_logs (product_id, product_name, change_type, quantity_change, agent) VALUES (?, ?, ?, ?, ?)',
            [prodId || null, item.product_name || 'Product', 'Stock In', qty, `Dealer Order Cancelled ${order.order_number || order.id}`]
          );
        } catch (logErr) {
          console.error('Inventory log error:', logErr);
        }
      }
      stockDeducted = 0;
    }

    // 5. Update order status and stock_deducted flag
    await db.query('UPDATE dealer_orders SET status = ?, stock_deducted = ? WHERE id = ?', [status, stockDeducted, order.id]);

    res.json({ success: true, message: `Status updated to ${status}`, stockDeducted });
  } catch (error) {
    console.error('Error updating dealer order status:', error);
    res.status(500).json({ error: error.message });
  }
};

