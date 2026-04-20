import React from 'react';
import { MessageSquare, Search, Filter, Clock, User, CheckCircle, AlertCircle, Send, MoreVertical } from 'lucide-react';

const SupportManager = () => {
  const tickets = [
    { id: 'TIC-2042', subject: 'Late delivery for Order #120', user: 'Anil Kapoor', category: 'Shipping', priority: 'High', status: 'Open', time: '10m ago' },
    { id: 'TIC-2041', subject: 'Refund request for Serum', user: 'Sneha Rao', category: 'Billing', priority: 'Medium', status: 'In Progress', time: '45m ago' },
    { id: 'TIC-2040', subject: 'Doubt about Product Expiry', user: 'Vikram S.', category: 'Product', priority: 'Low', status: 'Open', time: '2h ago' },
    { id: 'TIC-2039', subject: 'Unable to track order', user: 'Pooja J.', category: 'Shipping', priority: 'Medium', status: 'Resolved', time: '1d ago' },
  ];

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Customer Support Center</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage tickets, queries, and feedback from all channels.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="adm-btn adm-btn-outline"><MessageSquare size={18} /> Chat Live</button>
          <button className="adm-btn adm-btn-primary"><Clock size={18} /> Shift Roster</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div className="adm-card">
          <div className="adm-card-header">
            <div className="adm-search" style={{ width: '380px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search by ticket ID, subject or user..." />
            </div>
            <button className="adm-btn adm-btn-outline"><Filter size={16} /> Filter</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject & User</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td><span style={{ fontWeight: 800, color: '#3b82f6' }}>{t.id}</span><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.time}</div></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{t.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>User: {t.user}</div>
                    </td>
                    <td><span className="adm-badge adm-badge-info">{t.category}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.priority === 'High' ? '#f43f5e' : (t.priority === 'Medium' ? '#f59e0b' : '#10b981') }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{t.priority}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${t.status === 'Resolved' ? 'success' : (t.status === 'Open' ? 'danger' : 'warning')}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button className="adm-icon-btn"><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Quick Reply</h3>
          </div>
          <div className="adm-card-body">
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>AK</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Anil Kapoor</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TIC-2042 • High Priority</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>"My order #120 is still not delivered, it shows on hold. Can you please check?"</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea 
                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', minHeight: '120px', fontSize: '0.85rem' }} 
                placeholder="Type your response here..."
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center' }}><AlertCircle size={16} /> Escalate</button>
                <button className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Send size={16} /> Send</button>
              </div>
            </div>
            
            <div className="adm-divider" style={{ margin: '20px 0' }} />
            
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Suggested Macros</p>
            {['Order Delayed Msg', 'Refund Initiated', 'Address Correction'].map((m, i) => (
              <button key={i} style={{ 
                width: '100%', padding: '10px', textAlign: 'left', background: '#fff', 
                border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.75rem', 
                fontWeight: 600, color: '#64748b', marginBottom: '8px', cursor: 'pointer' 
              }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportManager;
