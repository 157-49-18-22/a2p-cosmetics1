import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle, AlertCircle, Info, Tag, X, Send } from 'lucide-react';

const API = API_BASE_URL;

const BroadcastManager = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'Promotion', status: 'Active' });

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API}/announcements`);
      const data = await res.json();
      setBroadcasts(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBroadcasts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', message: '', type: 'Promotion', status: 'Active' });
        fetchBroadcasts();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast?')) return;
    try {
      const res = await fetch(`${API}/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBroadcasts();
    } catch (e) { console.error(e); }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Promotion': return <Tag size={16} color="#f59e0b" />;
      case 'Alert': return <AlertCircle size={16} color="#ef4444" />;
      case 'News': return <Megaphone size={16} color="#3b82f6" />;
      default: return <Info size={16} color="#64748b" />;
    }
  };

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Broadcasts & Promos</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage live announcements and promotional pop-ups for users.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Broadcast
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>Loading broadcasts...</p>
        ) : broadcasts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
             <Megaphone size={40} style={{ opacity: 0.1, marginBottom: '16px' }} />
             <p style={{ color: '#94a3b8' }}>No active broadcasts. Create one to notify users!</p>
          </div>
        ) : broadcasts.map((b) => (
          <div key={b.id} className="adm-card" style={{ padding: '24px', borderLeft: `4px solid ${b.type === 'Alert' ? '#ef4444' : b.type === 'Promotion' ? '#f59e0b' : '#3b82f6'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getTypeIcon(b.type)}
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{b.type}</span>
              </div>
              <button className="adm-icon-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(b.id)}><Trash2 size={16} /></button>
            </div>
            <h4 style={{ fontWeight: 800, margin: '0 0 8px', fontSize: '1.1rem' }}>{b.title}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>{b.message}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`adm-badge ${b.status === 'Active' ? 'adm-badge-success' : ''}`}>{b.status}</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(b.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '480px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
               <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Create Broadcast</h3>
               <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Title</label>
                <input type="text" required placeholder="e.g. Mega Sale 10% Off" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Message</label>
                <textarea required placeholder="Write your broadcast message here..." className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', minHeight: '100px', padding: '12px' }} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Type</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', height: '48px' }} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option>Promotion</option>
                    <option>Alert</option>
                    <option>News</option>
                    <option>Info</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Initial Status</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', height: '48px' }} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="adm-btn adm-btn-primary" style={{ width: '100%', height: '52px', justifyContent: 'center', marginTop: '12px', fontSize: '1rem' }}>
                <Send size={18} /> Send Broadcast
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastManager;
