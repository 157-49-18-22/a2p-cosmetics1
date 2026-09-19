const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';

// ── 1. LOGIN ──
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
    const payload = { id: agent.id, name: agent.name, email: agent.email, role: agent.role, type: 'agent' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('a2p_token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── 2. STATS ──
exports.getStats = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;

    if (!aId) {
      const [[a]] = await db.query('SELECT COUNT(*) as total_agents FROM agents');
      const [[r]] = await db.query('SELECT COALESCE(SUM(usage_count), 0) as active_referrals FROM agent_referral_codes');
      const [[c]] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as total_commission FROM agent_commissions WHERE status = 'Earned'");
      const [[p]] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as paid_commission FROM agent_commissions WHERE status = 'Paid'");
      
      let pending_payouts = 0;
      try {
        const [[py]] = await db.query("SELECT COALESCE(SUM(amount), 0) as pending_payouts FROM agent_payouts WHERE status = 'Pending'");
        pending_payouts = py?.pending_payouts || 0;
      } catch (e) {}

      const [[o]] = await db.query("SELECT COUNT(*) as total_referral_orders FROM orders WHERE referral_code IS NOT NULL AND referral_code != ''");
      const [[d]] = await db.query('SELECT COUNT(*) as direct_referrals FROM agent_commissions WHERE level_number = 1');
      const [[s]] = await db.query('SELECT COUNT(*) as sub_agent_referrals FROM agent_commissions WHERE level_number > 1');

      return res.json({ 
        total_agents: a.total_agents || 0, 
        active_referrals: parseInt(r.active_referrals) || 0, 
        total_commission: parseFloat(c.total_commission) || 0, 
        paid_commission: parseFloat(p.paid_commission) || 0,
        pending_payouts: parseFloat(pending_payouts) || 0,
        total_referral_orders: o.total_referral_orders || 0,
        direct_referrals: d.direct_referrals || 0,
        sub_agent_referrals: s.sub_agent_referrals || 0
      });
    } else {
      // Scoped strictly to logged-in agent
      const [[subTeam]] = await db.query('SELECT COUNT(*) as team_count FROM agents WHERE parent_id = ?', [aId]);
      const [[r]] = await db.query('SELECT COALESCE(SUM(usage_count), 0) as active_referrals FROM agent_referral_codes WHERE agent_id = ?', [aId]);
      const [[c]] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as total_commission FROM agent_commissions WHERE agent_id = ? AND status = 'Earned'", [aId]);
      const [[p]] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as paid_commission FROM agent_commissions WHERE agent_id = ? AND status = 'Paid'", [aId]);
      
      let pending_payouts = 0;
      try {
        const [[py]] = await db.query("SELECT COALESCE(SUM(amount), 0) as pending_payouts FROM agent_payouts WHERE agent_id = ? AND status = 'Pending'", [aId]);
        pending_payouts = py?.pending_payouts || 0;
      } catch (e) {}

      const [[o]] = await db.query("SELECT COUNT(*) as total_referral_orders FROM orders WHERE referral_agent_id = ? AND referral_code IS NOT NULL AND referral_code != ''", [aId]);
      const [[d]] = await db.query('SELECT COUNT(*) as direct_referrals FROM agent_commissions WHERE agent_id = ? AND level_number = 1', [aId]);
      const [[s]] = await db.query('SELECT COUNT(*) as sub_agent_referrals FROM agent_commissions WHERE agent_id = ? AND level_number > 1', [aId]);

      return res.json({ 
        total_agents: subTeam.team_count || 0, 
        active_referrals: parseInt(r.active_referrals) || 0, 
        total_commission: parseFloat(c.total_commission) || 0, 
        paid_commission: parseFloat(p.paid_commission) || 0,
        pending_payouts: parseFloat(pending_payouts) || 0,
        total_referral_orders: o.total_referral_orders || 0,
        direct_referrals: d.direct_referrals || 0,
        sub_agent_referrals: s.sub_agent_referrals || 0
      });
    }
  } catch (error) { 
    console.error('getStats error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

// ── 3. TOP AGENTS ──
exports.getTopAgents = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE a.status = "Active" AND (a.id = ? OR a.parent_id = ?)' : 'WHERE a.status = "Active"';
    const params = aId ? [aId, aId] : [];

    const [rows] = await db.query(`
      SELECT a.id, a.name, a.role, a.tier,
             COALESCE(SUM(c.commission_amount), 0) as total_earned,
             COALESCE((SELECT SUM(rc.usage_count) FROM agent_referral_codes rc WHERE rc.agent_id = a.id), 0) as total_referrals
      FROM agents a
      LEFT JOIN agent_commissions c ON c.agent_id = a.id
      ${whereClause}
      GROUP BY a.id, a.name, a.role, a.tier
      ORDER BY total_referrals DESC, total_earned DESC
      LIMIT 5
    `, params);
    const topAgents = rows.map(a => ({
      ...a,
      rev: `₹${parseFloat(a.total_earned || 0).toLocaleString()}`,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=0ea5e9&color=fff`
    }));
    res.json(topAgents);
  } catch (error) { 
    console.error('getTopAgents error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

// ── 4. APPLICANTS / AGENT LIST ──
exports.getApplicants = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE parent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`SELECT * FROM agents ${whereClause} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── 5. HIERARCHY STRUCTURE ──
exports.getHierarchy = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;

    const [agents] = await db.query("SELECT id, name, role, tier, parent_id FROM agents WHERE status != 'Rejected'");
    
    // Build tree
    const map = {};
    const roots = [];
    
    agents.forEach(agent => {
      map[agent.id] = { ...agent, team: 0, children: [] };
    });
    
    agents.forEach(agent => {
      if (agent.parent_id && map[agent.parent_id]) {
        map[agent.parent_id].children.push(map[agent.id]);
        map[agent.parent_id].team += 1;
      } else {
        roots.push(map[agent.id]);
      }
    });

    if (aId && map[aId]) {
      return res.json([map[aId]]);
    }

    res.json(roots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── 6. MY REFERRAL NETWORK ──
exports.getMyReferralNetwork = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const agentIdInt = agent_id ? parseInt(agent_id) : null;

    const [agents] = await db.query("SELECT id, name, role, tier, parent_id, status, created_at as join_date FROM agents WHERE status != 'Rejected'");
    
    const map = {};
    agents.forEach(agent => {
      map[agent.id] = { 
        id: agent.id, 
        name: agent.name, 
        role: agent.role || 'Agent', 
        tier: agent.tier || 'Silver',
        join_date: agent.join_date || new Date(),
        total_orders: 0,
        total_commission: 0,
        status: agent.status,
        children: [] 
      };
    });

    // Build tree
    const roots = [];
    agents.forEach(agent => {
      if (agent.parent_id && map[agent.parent_id]) {
        map[agent.parent_id].children.push(map[agent.id]);
      } else {
        roots.push(map[agent.id]);
      }
    });

    let networkResult = roots;
    if (agentIdInt && map[agentIdInt]) {
      networkResult = [map[agentIdInt]];
    }

    const statsWhere = agentIdInt ? `AND agent_id = ${agentIdInt}` : '';
    const ordersWhere = agentIdInt ? `AND referral_agent_id = ${agentIdInt}` : '';
    const [[stats]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM agents WHERE parent_id ${agentIdInt ? `= ${agentIdInt}` : 'IS NOT NULL'}) as sub_agent_referrals,
        (SELECT COUNT(*) FROM agents WHERE parent_id ${agentIdInt ? `= ${agentIdInt}` : 'IS NOT NULL'}) as direct_referrals,
        (SELECT COUNT(*) FROM orders WHERE referral_code IS NOT NULL ${ordersWhere}) as total_referral_orders,
        (SELECT IFNULL(SUM(commission_amount), 0) FROM agent_commissions WHERE status = 'Earned' ${statsWhere}) as total_commission_from_referrals
    `);

    res.json({
      network: networkResult,
      stats: {
        direct_referrals: stats.direct_referrals || 0,
        sub_agent_referrals: stats.sub_agent_referrals || 0,
        total_referral_orders: stats.total_referral_orders || 0,
        total_commission_from_referrals: stats.total_commission_from_referrals || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── 7. ONBOARD AGENT ──
exports.onboard = async (req, res) => {
  const { name, email, phone, city, address, profile_pic, document_url, role, parent_id, password } = req.body;
  try {
    const loginEmail = email;
    const loginPassword = password || Math.random().toString(36).slice(-8);

    const [result] = await db.query(
      "INSERT INTO agents (name, email, password, phone, city, address, profile_pic, document_url, status, role, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)",
      [name, loginEmail, loginPassword, phone, city, address, profile_pic, document_url, role || 'Sales Rep', parent_id ? parseInt(parent_id) : null]
    );

    const agentId = result.insertId;
    const referralCode = `A2P${name.replace(/\s+/g, '').toUpperCase().slice(0, 5)}${agentId}`;
    try {
      await db.query(
        "INSERT INTO agent_referral_codes (agent_id, code, status) VALUES (?, ?, 'Active')",
        [agentId, referralCode]
      );
    } catch (e) { /* ignore if exists */ }

    await db.query(
      "INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES (?, ?, 'Onboarding', 'Approved')",
      [agentId, `Agent ${name} registered and auto-approved`]
    );

    res.json({ 
      id: agentId, 
      message: 'Agent created and activated successfully',
      credentials: { email: loginEmail, password: loginPassword, referral_code: referralCode }
    });
  } catch (error) { 
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
    }
    res.status(500).json({ error: error.message }); 
  }
};

// ── 8. UPDATE AGENT STATUS ──
exports.updateStatus = async (req, res) => {
  const { status, email, password } = req.body;
  try {
    if (status === 'Active') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required to approve an agent' });
      }

      try {
        await db.query('ALTER TABLE agents ADD COLUMN password VARCHAR(255) AFTER email');
      } catch (e) {}

      const [dup] = await db.query(
        'SELECT id FROM agents WHERE email = ? AND id != ? LIMIT 1',
        [email, req.params.id]
      );
      if (dup.length > 0) {
        return res.status(400).json({ error: 'This email is already used by another agent. Use a different email.' });
      }

      await db.query(
        'UPDATE agents SET status = ?, email = ?, password = ? WHERE id = ?',
        [status, email, password, req.params.id]
      );
    } else {
      await db.query('UPDATE agents SET status = ? WHERE id = ?', [status, req.params.id]);
    }

    try {
      await db.query(
        'INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES (?, ?, ?, ?)',
        [req.params.id, `Agent status updated to ${status}${status === 'Active' ? ' (Credentials set)' : ''}`, 'Verification', status]
      );
    } catch (logErr) {
      console.error('Agent log insert failed:', logErr.message);
    }

    res.json({ message: `Agent status updated to ${status}` });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This email is already registered. Use a different email.' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ── 9. UPDATE AGENT NOTES ──
exports.updateNotes = async (req, res) => {
  const { notes } = req.body;
  try {
    await db.query('UPDATE agents SET admin_notes = ? WHERE id = ?', [notes, req.params.id]);
    res.json({ message: 'Agent notes updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 10. DELETE AGENT ──
exports.deleteAgent = async (req, res) => {
  try {
    await db.query('DELETE FROM agents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Agent deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 11. LOGS ──
exports.getLogs = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE l.agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT l.*, a.name as agent_name 
      FROM agent_logs l 
      LEFT JOIN agents a ON l.agent_id = a.id 
      ${whereClause}
      ORDER BY l.created_at DESC
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.clearLogs = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    if (aId) {
      await db.query('DELETE FROM agent_logs WHERE agent_id = ?', [aId]);
    } else {
      await db.query('DELETE FROM agent_logs');
    }
    res.json({ message: 'Logs cleared successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 12. PAYOUTS ──
exports.getPayouts = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE c.agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT 
        c.id, 
        c.commission_amount as amount, 
        CASE WHEN c.status = 'Earned' THEN 'Pending' ELSE c.status END as status, 
        c.created_at as request_time, 
        a.name as agent_name 
      FROM agent_commissions c 
      JOIN agents a ON c.agent_id = a.id 
      ${whereClause}
      ORDER BY c.created_at DESC
    `, params);
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
    await db.query("UPDATE agent_payouts SET status = ?, processed_time = NOW() WHERE status = 'Pending'", [status]);
    res.json({ message: 'All pending payouts processed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 13. REFERRAL CODES ──
exports.getReferralCodes = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE c.agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT c.*, a.name as agent_name 
      FROM agent_referral_codes c 
      LEFT JOIN agents a ON c.agent_id = a.id 
      ${whereClause}
      ORDER BY c.created_at DESC
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createReferralCode = async (req, res) => {
  try {
    const { code, agent_id, discount_type, discount_value } = req.body;
    if (!code || !agent_id) {
      return res.status(400).json({ error: 'Code and Agent are required' });
    }
    const cleanCode = code.trim().toUpperCase();
    const dType = discount_type === 'fixed' ? 'fixed' : 'percentage';
    const dVal = discount_value !== undefined && discount_value !== '' ? parseFloat(discount_value) : 10.00;

    // Check if code already exists
    const [existing] = await db.query('SELECT id, agent_id FROM agent_referral_codes WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `Referral code "${cleanCode}" already exists. Please choose a different code.` });
    }

    await db.query(
      'INSERT INTO agent_referral_codes (code, agent_id, discount_type, discount_value, status) VALUES (?, ?, ?, ?, "Active")',
      [cleanCode, agent_id, dType, dVal]
    );
    res.json({ message: 'Referral code created successfully' });
  } catch (error) { 
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'This referral code already exists. Please choose a different code.' });
    }
    res.status(500).json({ error: error.message }); 
  }
};

exports.validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;
    const [rows] = await db.query(`
      SELECT c.code, c.agent_id, c.discount_type, c.discount_value, a.name as agent_name 
      FROM agent_referral_codes c 
      JOIN agents a ON c.agent_id = a.id 
      WHERE c.code = ? AND c.status = 'Active' AND a.status = 'Active'
    `, [code]);
    if (rows.length > 0) {
      res.json({ valid: true, ...rows[0] });
    } else {
      res.json({ valid: false, message: 'Invalid or inactive code' });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateReferralCodeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE agent_referral_codes SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.sendRecognition = async (req, res) => {
  try {
    res.json({ message: 'Recognition sent' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 14. REFERRAL ORDERS ──
exports.getReferralOrders = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const extraWhere = aId ? 'AND o.referral_agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT 
        o.id, 
        o.order_number as order_id, 
        o.referral_code, 
        a.name as agent_name, 
        o.customer_name, 
        'General' as product_category, 
        o.total_amount as order_amount, 
        IFNULL(c.commission_amount, 0) as commission_amount,
        IFNULL(c.commission_rate, '0%') as commission_rate,
        o.created_at as order_date, 
        o.order_status as status
      FROM orders o
      JOIN agents a ON o.referral_agent_id = a.id
      LEFT JOIN agent_commissions c ON c.order_id = o.id AND c.agent_id = a.id
      WHERE o.referral_code IS NOT NULL ${extraWhere}
      ORDER BY o.created_at DESC
    `, params);
    res.json(rows);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

exports.getReferralOrderStats = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const agentWhere = aId ? 'AND referral_agent_id = ?' : '';
    const codeWhere = aId ? 'AND agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [[{ total_orders, total_revenue }]] = await db.query(
      `SELECT COUNT(*) as total_orders, IFNULL(SUM(total_amount), 0) as total_revenue FROM orders WHERE referral_code IS NOT NULL ${agentWhere}`,
      params
    );
    const [[{ active_codes }]] = await db.query(
      `SELECT COUNT(*) as active_codes FROM agent_referral_codes WHERE status = 'Active' ${codeWhere}`,
      params
    );
    const [topCode] = await db.query(
      `SELECT referral_code, COUNT(*) as uses FROM orders WHERE referral_code IS NOT NULL ${agentWhere} GROUP BY referral_code ORDER BY uses DESC LIMIT 1`,
      params
    );
    res.json({
      total_referral_orders: total_orders || 0,
      total_referral_revenue: total_revenue || 0,
      active_referral_codes: active_codes || 0,
      top_performing_code: topCode.length > 0 ? topCode[0].referral_code : 'N/A'
    });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// ── 15. COMMISSION RULES ──
exports.getCommissionRules = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`SELECT * FROM agent_commission_rules ${whereClause} ORDER BY created_at DESC`, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createCommissionRule = async (req, res) => {
  const { category_name, base_rate, bonus_margin, referral_level, status, agent_id, commission_type, campaign_name, start_date, end_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO agent_commission_rules (category_name, base_rate, bonus_margin, referral_level, status, agent_id, commission_type, campaign_name, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        category_name, 
        base_rate, 
        bonus_margin, 
        referral_level || 'All Levels', 
        status || 'Active', 
        agent_id ? parseInt(agent_id) : null,
        commission_type || 'percentage',
        campaign_name || null,
        start_date || null,
        end_date || null
      ]
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
  const { percentage, agent_id } = req.body;
  try {
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereExtra = aId ? 'AND agent_id = ?' : '';
    const params = aId ? [percentage, aId] : [percentage];

    await db.query(`
      UPDATE agent_commission_rules 
      SET base_rate = CONCAT(CAST(REPLACE(base_rate, '%', '') AS DECIMAL(5,2)) + ?, '%')
      WHERE status = 'Active' ${whereExtra}
    `, params);
    res.json({ message: 'Bulk update successful' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── 16. SETTINGS ──
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

// ── 17. AUTO COMMISSION CALCULATION ENGINE ──
exports.calculateCommission = async (req, res) => {
  const { agent_id, order_amount, category_name, order_id } = req.body;

  if (!agent_id || !order_amount) {
    return res.status(400).json({ error: 'agent_id and order_amount are required' });
  }

  try {
    // 1. Fetch active commission rules
    const [rules] = await db.query(
      `SELECT * FROM agent_commission_rules 
       WHERE status = 'Active'
       ORDER BY created_at DESC`
    );

    if (rules.length === 0) {
      return res.status(404).json({ error: 'No active commission rules found. Set up rules first.' });
    }

    // 2. Build referral chain: agent → parent → grandparent
    const chain = [];
    let currentId = parseInt(agent_id);
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const [[agent]] = await db.query(
        'SELECT id, name, role, parent_id FROM agents WHERE id = ?',
        [currentId]
      );
      if (!agent) break;
      chain.push(agent);
      currentId = agent.parent_id;
    }

    // 3. Level labels
    const levelLabels = [
      'Level 1 (Sales Rep)',
      'Level 2 (Sub Agent)',
      'Level 3 (Master Agent)',
    ];

    const inserted = [];

    // 4. Calculate for each level
    for (let i = 0; i < chain.length; i++) {
      const agent = chain[i];
      const levelNum = i + 1;
      const levelLabel = levelLabels[i] || `Level ${levelNum}`;

      const matchingRule = rules.find(r =>
          (r.category_name === category_name || !category_name) &&
          (r.referral_level === levelLabel || r.referral_level === 'All Levels')
        ) ||
        rules.find(r => r.referral_level === levelLabel) ||
        rules.find(r => r.referral_level === 'All Levels');

      if (!matchingRule) continue;

      const isFixed = matchingRule.commission_type === 'fixed';
      const rawRate = String(matchingRule.base_rate).replace(/[₹%\s]/g, '').trim();
      const rate = parseFloat(rawRate);
      if (isNaN(rate) || rate <= 0) continue;

      const commissionAmount = isFixed
        ? rate.toFixed(2)
        : ((parseFloat(order_amount) * rate) / 100).toFixed(2);

      await db.query(
        `INSERT INTO agent_commissions 
         (agent_id, order_id, order_amount, commission_amount, commission_rate, category_name, referral_level, level_number, status, triggered_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Earned', ?)`,
        [agent.id, order_id || null, order_amount, commissionAmount,
         matchingRule.base_rate, category_name || 'General', levelLabel, levelNum, parseInt(agent_id)]
      );

      await db.query(
        `INSERT INTO agent_logs (agent_id, activity_text, activity_type, status) VALUES (?, ?, 'Commission', 'Approved')`,
        [agent.id, `Auto commission of Rs.${commissionAmount} (${matchingRule.base_rate}) earned at ${levelLabel} on order of Rs.${order_amount}`]
      );

      inserted.push({
        agent_id: agent.id,
        agent_name: agent.name,
        level: levelLabel,
        rate: matchingRule.base_rate,
        commission_amount: parseFloat(commissionAmount)
      });
    }

    if (inserted.length === 0) {
      return res.json({ message: 'No matching commission rules found for this sale.', commissions: [] });
    }

    res.json({
      message: `Commission calculated for ${inserted.length} agent(s) in the referral chain.`,
      commissions: inserted
    });

  } catch (error) {
    console.error('Commission calculation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── 18. COMMISSIONS LIST & SUMMARIES ──
exports.getCommissions = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE ac.agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT ac.*, a.name as agent_name, a.role as agent_role
      FROM agent_commissions ac
      JOIN agents a ON ac.agent_id = a.id
      ${whereClause}
      ORDER BY ac.created_at DESC
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getAgentCommissionSummary = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? "WHERE a.status = 'Active' AND a.id = ?" : "WHERE a.status = 'Active'";
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT 
        a.id, a.name, a.role,
        COUNT(ac.id) as total_transactions,
        SUM(ac.commission_amount) as total_earned,
        SUM(CASE WHEN ac.status = 'Paid' THEN ac.commission_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN ac.status = 'Earned' THEN ac.commission_amount ELSE 0 END) as total_pending
      FROM agents a
      LEFT JOIN agent_commissions ac ON a.id = ac.agent_id
      ${whereClause}
      GROUP BY a.id, a.name, a.role
      ORDER BY total_earned DESC
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getReferralWiseCommission = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const extraWhere = aId ? 'AND o.referral_agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT 
        o.referral_code, 
        a.name as agent_name, 
        COUNT(o.id) as total_orders, 
        IFNULL(SUM(c.commission_amount), 0) as total_commission, 
        'Active' as status
      FROM orders o
      JOIN agents a ON o.referral_agent_id = a.id
      LEFT JOIN agent_commissions c ON c.order_id = o.id AND c.agent_id = a.id
      WHERE o.referral_code IS NOT NULL ${extraWhere}
      GROUP BY o.referral_code, a.name
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getLevelWiseCommission = async (req, res) => {
  try {
    const { agent_id } = req.query;
    const aId = agent_id ? parseInt(agent_id) : null;
    const whereClause = aId ? 'WHERE c.agent_id = ?' : '';
    const params = aId ? [aId] : [];

    const [rows] = await db.query(`
      SELECT 
        c.referral_level as level,
        SUM(c.commission_amount) as total_commission,
        COUNT(DISTINCT c.agent_id) as agents_count,
        SUM(c.commission_amount) / COUNT(DISTINCT c.agent_id) as avg_commission
      FROM agent_commissions c
      ${whereClause}
      GROUP BY c.referral_level
    `, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateCommissionStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE agent_commissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Commission marked as ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
