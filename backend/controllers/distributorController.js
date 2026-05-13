const db = require('../db');

// Stats for Admin View
exports.getAdminStats = async (req, res) => {
  try {
    const [[{ active_partners }]] = await db.query('SELECT COUNT(*) as active_partners FROM distributors WHERE status = "Active"');
    const [[{ total_credit }]] = await db.query('SELECT SUM(credit_limit) as total_credit FROM distributors');
    const [[{ total_outstanding }]] = await db.query('SELECT SUM(balance) as total_outstanding FROM distributors');
    const [[{ platinum_partners }]] = await db.query('SELECT COUNT(*) as platinum_partners FROM distributors WHERE tier = "Platinum"');
    res.json({ active_partners, total_credit: total_credit || 0, total_outstanding: total_outstanding || 0, platinum_partners });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Login
exports.loginDistributor = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM distributors WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const distributor = rows[0];
    if (distributor.status !== 'Active') {
      return res.status(403).json({ error: 'Your account is not active' });
    }
    res.json(distributor);
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
    const [[{ active_orders }]] = await db.query('SELECT COUNT(*) as active_orders FROM distributor_orders WHERE distributor_id = ? AND status != "Delivered" AND status != "Cancelled"', [distId]);
    const [[{ monthly_revenue }]] = await db.query('SELECT SUM(amount) as monthly_revenue FROM distributor_orders WHERE distributor_id = ? AND status = "Delivered" AND MONTH(created_at) = MONTH(CURRENT_DATE())', [distId]);
    res.json({ total_dealers, active_orders, monthly_revenue: monthly_revenue || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Dealers
exports.getDealers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dealers WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
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
  const { distributor_id, name, contact_person, phone, email, zone, type, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO dealers (distributor_id, name, contact_person, phone, email, zone, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [distributor_id, name, contact_person, phone, email, zone || 'Zone A', type || 'Dealer', status || 'Pending']
    );

    // Log activity
    await db.query(
      'INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, "Success")',
      [distributor_id, `New application submitted for "${name}" (${type})`]
    );

    res.json({ id: result.insertId, message: 'Application submitted successfully' });
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
    const [rows] = await db.query('SELECT * FROM branding_campaigns WHERE distributor_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Campaign
exports.createCampaign = async (req, res) => {
  const { distributor_id, title, type, zone, budget, start_date, end_date, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO branding_campaigns (distributor_id, title, type, zone, budget, start_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Upcoming")',
      [distributor_id, title, type, zone, budget || 0, start_date, end_date, description]
    );
    res.json({ id: result.insertId, message: 'Campaign created' });
  } catch (error) { res.status(500).json({ error: error.message }); }
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

// Create Order
exports.createOrder = async (req, res) => {
  const { distributor_id, amount, items_count } = req.body;
  const order_number = 'ORD-' + Math.floor(Math.random() * 1000000);
  try {
    const [result] = await db.query(
      'INSERT INTO distributor_orders (distributor_id, order_number, amount, items_count, status) VALUES (?, ?, ?, ?, "Pending")',
      [distributor_id, order_number, amount, items_count]
    );
    // Log Activity
    await db.query(
      'INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, "Success")',
      [distributor_id, `New Order ${order_number} created for ₹${amount}`]
    );
    res.json({ id: result.insertId, order_number });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create Invoice/Bill
exports.createInvoice = async (req, res) => {
  const { distributor_id, amount, due_date, bill_number, status } = req.body;
  const final_bill_number = bill_number || ('INV-' + Math.floor(Math.random() * 1000000));
  try {
    const [result] = await db.query(
      'INSERT INTO distributor_bills (distributor_id, bill_number, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [distributor_id, final_bill_number, amount, due_date, status || 'Unpaid']
    );
    // Log Activity
    await db.query(
      'INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, "Invoice")',
      [distributor_id, `Invoice ${final_bill_number} generated for ₹${amount}`]
    );
    res.json({ id: result.insertId, bill_number: final_bill_number });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getBills = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM distributor_bills WHERE distributor_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
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

exports.updateStockRequestStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE stock_requests SET status = ? WHERE id = ?', [status, req.params.id]);
    
    // Log Activity for distributor
    const [[reqRow]] = await db.query('SELECT distributor_id, request_number FROM stock_requests WHERE id = ?', [req.params.id]);
    if (reqRow) {
      await db.query(
        'INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, "Info")',
        [reqRow.distributor_id, `Stock Request ${reqRow.request_number} marked as ${status} by Admin`, 'Info']
      );
    }
    
    res.json({ message: `Request status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createStockRequest = async (req, res) => {
  const { distributor_id, items, total_amount } = req.body;
  const request_number = 'REQ-' + Math.floor(Math.random() * 1000000);
  try {
    const [result] = await db.query(
      'INSERT INTO stock_requests (distributor_id, request_number, total_amount, status) VALUES (?, ?, ?, "Pending")',
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
      'INSERT INTO distributor_activity (distributor_id, activity_text, activity_type) VALUES (?, ?, "Success")',
      [distributor_id, `Stock Request ${request_number} sent to Admin for ₹${total_amount}`]
    );

    res.json({ id: requestId, request_number, message: 'Stock request sent successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
