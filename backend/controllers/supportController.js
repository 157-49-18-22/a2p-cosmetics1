const db = require('../db');

// GET ALL TICKETS with search/filter
exports.getTickets = async (req, res) => {
  try {
    const { status, category, priority, search, assigned_to, email } = req.query;
    let query = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];

    if (email) { query += ' AND user_email = ?'; params.push(email); }
    if (status && status !== 'All') { query += ' AND status = ?'; params.push(status); }
    if (category && category !== 'All') { query += ' AND category = ?'; params.push(category); }
    if (priority && priority !== 'All') { query += ' AND priority = ?'; params.push(priority); }
    if (assigned_to && assigned_to !== 'All') {
      if (assigned_to === 'Unassigned') { query += ' AND (assigned_to IS NULL OR assigned_to = "")'; }
      else { query += ' AND assigned_to = ?'; params.push(assigned_to); }
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (ticket_id LIKE ? OR subject LIKE ? OR user_name LIKE ? OR user_email LIKE ? OR message LIKE ?)';
      params.push(term, term, term, term, term);
    }
    query += ' ORDER BY FIELD(priority,"Urgent","High","Medium","Low"), created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// GET STATS
exports.getStats = async (req, res) => {
  try {
    const [[{ open }]] = await db.query("SELECT COUNT(*) as open FROM support_tickets WHERE status = 'Open'");
    const [[{ in_progress }]] = await db.query("SELECT COUNT(*) as in_progress FROM support_tickets WHERE status = 'In Progress'");
    const [[{ resolved }]] = await db.query("SELECT COUNT(*) as resolved FROM support_tickets WHERE status = 'Resolved'");
    const [[{ closed }]] = await db.query("SELECT COUNT(*) as closed FROM support_tickets WHERE status = 'Closed'");
    const [[{ high }]] = await db.query("SELECT COUNT(*) as high FROM support_tickets WHERE priority IN ('High','Urgent') AND status NOT IN ('Resolved','Closed')");
    const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM support_tickets");
    let avg_response = 0;
    try {
      const [[row]] = await db.query("SELECT COALESCE(ROUND(AVG(TIMESTAMPDIFF(HOUR, t.created_at, r.created_at)),1), 0) as avg_response FROM support_tickets t LEFT JOIN ticket_replies r ON r.ticket_id = t.id AND r.sender_type = 'admin' WHERE r.id IS NOT NULL");
      avg_response = row.avg_response || 0;
    } catch(e) { avg_response = 0; }
    const [byDay] = await db.query("SELECT DATE(created_at) as day, COUNT(*) as count FROM support_tickets WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY day ASC");
    const [byCategory] = await db.query("SELECT category, COUNT(*) as count FROM support_tickets GROUP BY category ORDER BY count DESC");
    res.json({ open: open||0, in_progress: in_progress||0, resolved: resolved||0, closed: closed||0, high: high||0, total: total||0, avg_response, byDay, byCategory });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// GET SINGLE TICKET
exports.getTicketById = async (req, res) => {
  try {
    const [tickets] = await db.query('SELECT * FROM support_tickets WHERE id = ? OR ticket_id = ?', [req.params.id, req.params.id]);
    if (tickets.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    const [replies] = await db.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [tickets[0].id]);
    res.json({ ...tickets[0], replies });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// CREATE TICKET
exports.createTicket = async (req, res) => {
  const { subject, user_name, user_email, user_phone, category, priority, message, tags } = req.body;
  try {
    if (!subject || !user_name || !user_email) return res.status(400).json({ error: 'Subject, name and email are required' });
    
    // Ensure table column types are VARCHAR
    try {
      await db.query("ALTER TABLE support_tickets MODIFY COLUMN category VARCHAR(100) DEFAULT 'General'");
      await db.query("ALTER TABLE support_tickets MODIFY COLUMN priority VARCHAR(50) DEFAULT 'Medium'");
    } catch(e) {}

    let cleanCategory = category || 'General';
    if (cleanCategory.includes('Shipping') || cleanCategory.includes('Delivery')) cleanCategory = 'Shipping';
    else if (cleanCategory.includes('Billing') || cleanCategory.includes('Payment') || cleanCategory.includes('Refund')) cleanCategory = 'Billing';
    else if (cleanCategory.includes('Product') || cleanCategory.includes('Damaged')) cleanCategory = 'Product';
    else if (cleanCategory.includes('Technical') || cleanCategory.includes('Account')) cleanCategory = 'Technical';
    else if (cleanCategory.includes('General')) cleanCategory = 'General';

    const ticket_id = 'TIC-' + Math.floor(1000 + Math.random() * 9000);
    const [result] = await db.query(
      'INSERT INTO support_tickets (ticket_id, subject, user_name, user_email, user_phone, category, priority, status, message, tags) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [ticket_id, subject, user_name, user_email, user_phone||null, cleanCategory, priority||'Medium', 'Open', message||'', tags||null]
    );
    res.status(201).json({ success: true, id: result.insertId, ticket_id, message: 'Ticket created successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: `Status updated to ${status}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// UPDATE PRIORITY
exports.updatePriority = async (req, res) => {
  const { priority } = req.body;
  try {
    const [result] = await db.query('UPDATE support_tickets SET priority = ? WHERE id = ?', [priority, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: `Priority updated to ${priority}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ASSIGN TICKET
exports.assignTicket = async (req, res) => {
  const { assigned_to } = req.body;
  try {
    await db.query('UPDATE support_tickets SET assigned_to = ? WHERE id = ?', [assigned_to||null, req.params.id]);
    res.json({ message: `Ticket assigned to ${assigned_to || 'nobody'}` });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// REPLY TO TICKET
exports.replyTicket = async (req, res) => {
  const { reply, agent, sender_type } = req.body;
  try {
    if (!reply || !reply.trim()) return res.status(400).json({ error: 'Reply cannot be empty' });
    const type = sender_type || 'admin';
    await db.query('INSERT INTO ticket_replies (ticket_id, agent, message, sender_type) VALUES (?,?,?,?)', [req.params.id, agent||'Admin', reply.trim(), type]);
    if (type === 'admin') {
      await db.query("UPDATE support_tickets SET status = 'In Progress' WHERE id = ? AND status = 'Open'", [req.params.id]);
    }
    res.json({ success: true, message: 'Reply added successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// GET REPLIES
exports.getReplies = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// UPDATE TAGS
exports.updateTags = async (req, res) => {
  const { tags } = req.body;
  try {
    await db.query('UPDATE support_tickets SET tags = ? WHERE id = ?', [tags, req.params.id]);
    res.json({ message: 'Tags updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// DELETE TICKET
exports.deleteTicket = async (req, res) => {
  try {
    await db.query('DELETE FROM ticket_replies WHERE ticket_id = ?', [req.params.id]);
    const [result] = await db.query('DELETE FROM support_tickets WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// BULK ACTIONS
exports.bulkAction = async (req, res) => {
  const { ids, action, value } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ error: 'No ticket IDs provided' });
  try {
    const placeholders = ids.map(() => '?').join(',');
    if (action === 'delete') {
      await db.query(`DELETE FROM ticket_replies WHERE ticket_id IN (${placeholders})`, ids);
      await db.query(`DELETE FROM support_tickets WHERE id IN (${placeholders})`, ids);
      return res.json({ message: `${ids.length} tickets deleted` });
    }
    if (action === 'status' && value) {
      await db.query(`UPDATE support_tickets SET status = ? WHERE id IN (${placeholders})`, [value, ...ids]);
      return res.json({ message: `${ids.length} tickets updated to ${value}` });
    }
    if (action === 'priority' && value) {
      await db.query(`UPDATE support_tickets SET priority = ? WHERE id IN (${placeholders})`, [value, ...ids]);
      return res.json({ message: `${ids.length} tickets priority set to ${value}` });
    }
    if (action === 'assign' && value !== undefined) {
      await db.query(`UPDATE support_tickets SET assigned_to = ? WHERE id IN (${placeholders})`, [value||null, ...ids]);
      return res.json({ message: `${ids.length} tickets assigned` });
    }
    res.status(400).json({ error: 'Invalid bulk action' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// EXPORT CSV
exports.exportCSV = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT ticket_id, subject, user_name, user_email, category, priority, status, assigned_to, created_at FROM support_tickets ORDER BY created_at DESC');
    const headers = ['Ticket ID','Subject','Customer Name','Customer Email','Category','Priority','Status','Assigned To','Created At'];
    const csv = [
      headers.join(','),
      ...rows.map(r =>
        [r.ticket_id, `"${(r.subject||'').replace(/"/g,'""')}"`, r.user_name, r.user_email, r.category, r.priority, r.status, r.assigned_to||'Unassigned', new Date(r.created_at).toLocaleString()].join(',')
      )
    ].join('\n');
    res.header('Content-Type','text/csv');
    res.header('Content-Disposition','attachment; filename=support_tickets.csv');
    res.send(csv);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
