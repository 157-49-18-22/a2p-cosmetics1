import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Clock, X, CheckCircle, AlertCircle, Send, Trash2, Plus, RefreshCcw, Mail, Tag, AlertTriangle, Check } from 'lucide-react';

const API = `${API_BASE_URL}/support`;
const MACROS = ['Thank you for contacting us. We will resolve your issue shortly.', 'Your refund has been initiated and will reflect in 5-7 business days.', 'Your order is delayed due to high demand. We apologize for the inconvenience.', 'We have updated your delivery address as requested.'];

const SupportManager = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0, high: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', user_name: '', user_email: '', category: 'General', priority: 'Medium', message: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([fetch(`${API}`), fetch(`${API}/stats`)]);
      const [td, sd] = await Promise.all([t.json(), s.json()]);
      setTickets(Array.isArray(td) ? td : []);
      setStats(sd);
    } catch (e) { setTickets([]); }
    finally { setLoading(false); }
  };

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    const res = await fetch(`${API}/${ticket.id}/replies`);
    const data = await res.json();
    setReplies(Array.isArray(data) ? data : []);
    setShowModal(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      await fetch(`${API}/${selectedTicket.id}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply: replyText, agent: 'Admin' }) });
      setReplies(prev => [...prev, { agent: 'Admin', message: replyText, created_at: new Date().toISOString() }]);
      setReplyText('');
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: t.status === 'Open' ? 'In Progress' : t.status } : t));
      showToast('Reply sent!');
    } catch (e) { showToast('Failed to send reply', 'danger'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, status }));
      fetchAll();
      showToast(`Status updated to ${status}`);
    } catch (e) { showToast('Update failed', 'danger'); }
  };

  const deleteTicket = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setTickets(prev => prev.filter(t => t.id !== id));
      if (selectedTicket?.id === id) setShowModal(false);
      fetchAll();
      showToast('Ticket deleted');
    } catch (e) { showToast('Delete failed', 'danger'); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTicket) });
      setShowNewModal(false);
      setNewTicket({ subject: '', user_name: '', user_email: '', category: 'General', priority: 'Medium', message: '' });
      fetchAll();
      showToast('Ticket created!');
    } catch (e) { showToast('Failed to create ticket', 'danger'); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const priorityColor = { High: '#f43f5e', Medium: '#f59e0b', Low: '#10b981' };
  const statusBadge = { Open: 'danger', 'In Progress': 'warning', Resolved: 'success', Closed: 'info' };

  const filtered = tickets.filter(t =>
    (filterStatus === 'All' || t.status === filterStatus) &&
    (t.subject?.toLowerCase().includes(search.toLowerCase()) ||
     t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
     t.ticket_id?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="adm-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Customer Support Center</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage tickets, queries, and feedback in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchAll}><RefreshCcw size={16} /></button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowNewModal(true)}><Plus size={18} /> New Ticket</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Open', val: stats.open, color: '#f43f5e', icon: AlertCircle },
          { label: 'In Progress', val: stats.in_progress, color: '#f59e0b', icon: Clock },
          { label: 'Resolved', val: stats.resolved, color: '#10b981', icon: CheckCircle },
          { label: 'High Priority', val: stats.high, color: '#8b5cf6', icon: AlertTriangle }
        ].map((s, i) => (
          <div key={i} className="adm-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', border: filterStatus === s.label ? `2px solid ${s.color}` : '1px solid #e2e8f0' }} onClick={() => setFilterStatus(prev => prev === s.label ? 'All' : s.label)}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={20} /></div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card">
        <div style={{ padding: '18px 24px', display: 'flex', gap: '12px' }}>
          <div className="adm-search" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Search size={16} color="#94a3b8" />
            <input placeholder="Search by ticket ID, subject or user..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="adm-btn adm-btn-outline" style={{ height: '42px', padding: '0 14px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '24px' }}>Ticket ID</th>
                <th>Subject & User</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading tickets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No tickets found.</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => openTicket(t)}>
                  <td style={{ paddingLeft: '24px' }}>
                    <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem' }}>{t.ticket_id}</span>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.user_name}</div>
                  </td>
                  <td><span className="adm-badge adm-badge-info" style={{ fontSize: '0.7rem' }}>{t.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColor[t.priority] }} />
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{t.priority}</span>
                    </div>
                  </td>
                  <td><span className={`adm-badge adm-badge-${statusBadge[t.status] || 'info'}`}>{t.status}</span></td>
                  <td style={{ paddingRight: '24px' }}>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      {t.status !== 'Resolved' && (
                        <button className="adm-icon-btn" style={{ background: '#f0fdf4', color: '#10b981', borderRadius: '8px' }} title="Mark Resolved" onClick={() => updateStatus(t.id, 'Resolved')}><CheckCircle size={15} /></button>
                      )}
                      <button className="adm-icon-btn" style={{ background: '#fff1f2', color: '#f43f5e', borderRadius: '8px' }} title="Delete" onClick={(e) => deleteTicket(t.id, e)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }} onClick={() => setShowModal(false)}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '28px 28px 0 0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, color: '#3b82f6' }}>{selectedTicket.ticket_id}</span>
                  <span className={`adm-badge adm-badge-${statusBadge[selectedTicket.status]}`}>{selectedTicket.status}</span>
                  <span style={{ fontSize: '0.7rem', color: '#fff', background: priorityColor[selectedTicket.priority], padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>{selectedTicket.priority}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '4px' }}>{selectedTicket.subject}</h3>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Customer Info */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', flexShrink: 0 }}>
                  {selectedTicket.user_name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, color: '#0f172a' }}>{selectedTicket.user_name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedTicket.user_email}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                  <select className="adm-btn adm-btn-outline" style={{ height: '36px', fontSize: '0.8rem', padding: '0 10px' }} value={selectedTicket.status} onChange={e => updateStatus(selectedTicket.id, e.target.value)}>
                    <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                  </select>
                </div>
              </div>

              {/* Original Message */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>Original Message</p>
                <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>"{selectedTicket.message}"</p>
              </div>

              {/* Replies Thread */}
              {replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Conversation Thread</p>
                  {replies.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>A</div>
                      <div style={{ flex: 1, background: '#eff6ff', padding: '12px 16px', borderRadius: '14px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}>{r.agent} • {new Date(r.created_at).toLocaleTimeString()}</p>
                        <p style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Quick Reply</p>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} style={{ width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '14px', minHeight: '100px', fontSize: '0.88rem', outline: 'none', resize: 'vertical', lineHeight: 1.5 }} placeholder="Type your response here..." />
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }} onClick={() => updateStatus(selectedTicket.id, 'Resolved')}><CheckCircle size={15} /> Mark Resolved</button>
                  <button className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={sendReply}><Send size={16} /> Send Reply</button>
                </div>
              </div>

              {/* Suggested Macros */}
              <div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Suggested Macros</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {MACROS.map((m, i) => (
                    <button key={i} onClick={() => setReplyText(m)} style={{ textAlign: 'left', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', fontWeight: 500, transition: '0.15s' }}
                      onMouseEnter={e => e.target.style.background = '#eff6ff'} onMouseLeave={e => e.target.style.background = '#f8fafc'}>
                      {m.length > 80 ? m.slice(0, 80) + '...' : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '500px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ fontWeight: 800 }}>Create New Ticket</h3>
              <button className="adm-icon-btn" onClick={() => setShowNewModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={createTicket} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ l: 'Subject', k: 'subject', t: 'text' }, { l: 'Customer Name', k: 'user_name', t: 'text' }, { l: 'Customer Email', k: 'user_email', t: 'email' }].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>{f.l}</label>
                  <input type={f.t} required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '44px', padding: '0 14px' }} value={newTicket[f.k]} onChange={e => setNewTicket({ ...newTicket, [f.k]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', height: '44px', padding: '0 14px' }} value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}>
                    <option>General</option><option>Shipping</option><option>Billing</option><option>Product</option><option>Returns</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Priority</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', height: '44px', padding: '0 14px' }} value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Message</label>
                <textarea className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', minHeight: '80px', padding: '10px 14px' }} value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button type="button" className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManager;
