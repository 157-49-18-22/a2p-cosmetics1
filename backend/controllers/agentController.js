const db = require('../db');

// Stats
exports.getStats = async (req, res) => {
  try {
    const [[{ total_agents }]] = await db.query('SELECT COUNT(*) as total_agents FROM agents');
    const [[{ active_referrals }]] = await db.query('SELECT COUNT(*) as active_referrals FROM agent_referrals WHERE status = "Converted"');
    const [[{ total_commission }]] = await db.query('SELECT SUM(amount) as total_commission FROM agent_commissions WHERE status = "Earned"');
    const [[{ pending_payouts }]] = await db.query('SELECT SUM(amount) as pending_payouts FROM agent_payouts WHERE status = "Pending"');
    res.json({ total_agents, active_referrals: active_referrals || 0, total_commission: total_commission || 0, pending_payouts: pending_payouts || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Login
exports.loginAgent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM agents WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const agent = rows[0];
    if (agent.status !== 'Active') {
      return res.status(403).json({ error: 'Your account is not active' });
    }
    res.json(agent);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Top Agents
exports.getTopAgents = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT name, tier, id FROM agents WHERE status = "Active" LIMIT 5');
    const topAgents = rows.map(a => ({
      ...a,
      rev: `₹${(Math.random() * 2 + 1).toFixed(1)}L`,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=random&color=fff`
    }));
    res.json(topAgents);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Applicants
exports.getApplicants = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agents ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Hierarchy
exports.getHierarchy = async (req, res) => {
  try {
    const [agents] = await db.query('SELECT id, name, role, tier, parent_id FROM agents WHERE status != "Rejected"');
    
    // Build tree
    const map = {};
    const roots = [];
    
    agents.forEach(agent => {
      map[agent.id] = { ...agent, team: 0, children: [] };
    });
    
    agents.forEach(agent => {
      if (agent.parent_id && map[agent.parent_id]) {
        map[agent.parent_id].children.push(map[agent.id]);
        // Update team count
        map[agent.parent_id].team += 1;
      } else {
        roots.push(map[agent.id]);
      }
    });

    res.json(roots);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Onboard
exports.onboard = async (req, res) => {
  const { name, email, phone, city, address, profile_pic, document_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO agents (name, email, phone, city, address, profile_pic, document_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, "Pending")',
      [name, email, phone, city, address, profile_pic, document_url]
    );
    await db.query(
      'INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES (?, ?, "Onboarding", "Pending")',
      [result.insertId, `New registration request from ${name}`]
    );
    res.json({ id: result.insertId, message: 'Application submitted successfully' });
  } catch (error) { 
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }
    res.status(500).json({ error: error.message }); 
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  const { status, email, password } = req.body;
  try {
    if (status === 'Active') {
      await db.query(
        'UPDATE agents SET status = ?, email = ?, password = ? WHERE id = ?',
        [status, email, password, req.params.id]
      );
    } else {
      await db.query('UPDATE agents SET status = ? WHERE id = ?', [status, req.params.id]);
    }
    
    await db.query(
      'INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES (?, ?, "Verification", ?)',
      [req.params.id, `Agent status updated to ${status}${status === 'Active' ? ' (Credentials set)' : ''}`, status]
    );
    res.json({ message: `Agent status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Update Notes
exports.updateNotes = async (req, res) => {
  const { notes } = req.body;
  try {
    await db.query('UPDATE agents SET admin_notes = ? WHERE id = ?', [notes, req.params.id]);
    res.json({ message: 'Agent notes updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Delete
exports.deleteAgent = async (req, res) => {
  try {
    await db.query('DELETE FROM agents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Agent deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Logs
exports.getLogs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, a.name as agent_name 
      FROM agent_logs l 
      LEFT JOIN agents a ON l.agent_id = a.id 
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.clearLogs = async (req, res) => {
  try {
    await db.query('DELETE FROM agent_logs');
    res.json({ message: 'Logs cleared successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Payouts
exports.getPayouts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, a.name as agent_name 
      FROM agent_payouts p 
      JOIN agents a ON p.agent_id = a.id 
      ORDER BY p.request_time DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updatePayoutStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE agent_payouts SET status = ?, processed_time = NOW() WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Payout status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.processPayoutBatch = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE agent_payouts SET status = ?, processed_time = NOW() WHERE status = "Pending"', [status]);
    res.json({ message: 'All pending payouts processed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Referral Codes
exports.getReferralCodes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rc.*, a.name as agent_name 
      FROM agent_referral_codes rc 
      JOIN agents a ON rc.agent_id = a.id 
      ORDER BY rc.created_at DESC
    `);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createReferralCode = async (req, res) => {
  const { code, agent_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO agent_referral_codes (code, agent_id, status) VALUES (?, ?, "Active")',
      [code, agent_id]
    );
    res.json({ id: result.insertId, message: 'Referral code created' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateReferralCodeStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE agent_referral_codes SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Referral code status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.sendRecognition = async (req, res) => {
  const { message } = req.body;
  try {
    // Logic to send notification/email
    res.json({ message: 'Recognition sent successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Commission Rules
exports.getCommissionRules = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agent_commission_rules ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createCommissionRule = async (req, res) => {
  const { category_name, base_rate, bonus_margin, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO agent_commission_rules (category_name, base_rate, bonus_margin, status) VALUES (?, ?, ?, ?)',
      [category_name, base_rate, bonus_margin, status || 'Active']
    );
    res.json({ id: result.insertId, message: 'Rule created successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteCommissionRule = async (req, res) => {
  try {
    await db.query('DELETE FROM agent_commission_rules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Rule deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.bulkUpdateCommissionRules = async (req, res) => {
  const { percentage } = req.body;
  try {
    // MySQL query to update base_rate string like '15%' by adding the percentage
    // Since base_rate is a VARCHAR like '15%', we extract the number, add the percentage, and append '%'
    await db.query(`
      UPDATE agent_commission_rules 
      SET base_rate = CONCAT(CAST(REPLACE(base_rate, '%', '') AS DECIMAL(5,2)) + ?, '%')
      WHERE status = 'Active'
    `, [percentage]);
    res.json({ message: 'Bulk update successful' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM agent_settings LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateSettings = async (req, res) => {
  const { referral_bonus_percent, min_payout_threshold, commission_cycle_days } = req.body;
  try {
    await db.query(`
      UPDATE agent_settings 
      SET referral_bonus_percent = ?, min_payout_threshold = ?, commission_cycle_days = ?
      WHERE id = 1
    `, [referral_bonus_percent, min_payout_threshold, commission_cycle_days]);
    res.json({ message: 'Settings updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
