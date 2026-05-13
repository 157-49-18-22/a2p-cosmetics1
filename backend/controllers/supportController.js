const db = require('../db');

exports.getTickets = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM support_tickets ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const [[{ open }]] = await db.query('SELECT COUNT(*) as open FROM support_tickets WHERE status = "Open"');
    const [[{ in_progress }]] = await db.query('SELECT COUNT(*) as in_progress FROM support_tickets WHERE status = "In Progress"');
    const [[{ resolved }]] = await db.query('SELECT COUNT(*) as resolved FROM support_tickets WHERE status = "Resolved"');
    const [[{ high }]] = await db.query('SELECT COUNT(*) as high FROM support_tickets WHERE priority = "High" AND status != "Resolved"');
    res.json({ open, in_progress, resolved, high });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.createTicket = async (req, res) => {
  const { subject, user_name, user_email, category, priority, message } = req.body;
  try {
    const ticket_id = 'TIC-' + Date.now().toString().slice(-4);
    const [result] = await db.query(
      'INSERT INTO support_tickets (ticket_id, subject, user_name, user_email, category, priority, status, message) VALUES (?,?,?,?,?,?,?,?)',
      [ticket_id, subject, user_name, user_email, category || 'General', priority || 'Medium', 'Open', message]
    );
    res.json({ id: result.insertId, ticket_id });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.replyTicket = async (req, res) => {
  const { reply, agent } = req.body;
  try {
    await db.query(
      'INSERT INTO ticket_replies (ticket_id, agent, message) VALUES (?,?,?)',
      [req.params.id, agent || 'Admin', reply]
    );
    await db.query('UPDATE support_tickets SET status = "In Progress" WHERE id = ? AND status = "Open"', [req.params.id]);
    res.json({ message: 'Reply sent' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getReplies = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [req.params.id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteTicket = async (req, res) => {
  try {
    await db.query('DELETE FROM ticket_replies WHERE ticket_id = ?', [req.params.id]);
    await db.query('DELETE FROM support_tickets WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ticket deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
