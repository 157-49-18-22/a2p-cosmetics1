import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Search, Edit2, Trash2, Eye, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = `${API_BASE_URL}/distributors`;

const statusBadge = (s) => ({
  Active: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Upcoming: <span className="dd-badge dd-badge-blue"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Completed: <span className="dd-badge dd-badge-purple">{s}</span>,
}[s] || <span className="dd-badge dd-badge-yellow">{s}</span>);

const BrandingManagement = () => {
  const { user } = useAuth();
  const distributorId = user?.id || 1;

  const [campaigns, setCampaigns] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    title: '', type: 'Digital', zone: 'All Zones', budget: '', start_date: '', end_date: '', description: '', status: 'Upcoming'
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [campRes, zoneRes] = await Promise.all([
        axios.get(`${API_BASE}/${distributorId}/campaigns`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/${distributorId}/zones`).catch(() => ({ data: [] }))
      ]);
      setZones(Array.isArray(zoneRes.data) ? zoneRes.data : []);
      setCampaigns(campRes.data.length > 0 ? campRes.data : [
        { id: 1, title: 'Summer Glow Campaign', type: 'Digital', zone: 'All Zones', start_date: '2026-05-01', end_date: '2026-05-30', budget: 50000, status: 'Upcoming' },
        { id: 2, title: 'Face Serum Launch', type: 'Print + Digital', zone: 'Zone A, B', start_date: '2026-04-10', end_date: '2026-04-25', budget: 35000, status: 'Active' },
        { id: 3, title: 'Dealer Display Kits', type: 'In-Store', zone: 'Zone C', start_date: '2026-04-01', end_date: '2026-04-15', budget: 20000, status: 'Completed' },
      ]);
    } catch (err) {
      console.error('Branding fetch error:', err);
      setCampaigns([
        { id: 1, title: 'Summer Glow Campaign', type: 'Digital', zone: 'All Zones', start_date: '2026-05-01', end_date: '2026-05-30', budget: 50000, status: 'Upcoming' },
        { id: 2, title: 'Face Serum Launch', type: 'Print + Digital', zone: 'Zone A, B', start_date: '2026-04-10', end_date: '2026-04-25', budget: 35000, status: 'Active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaign.title) return alert('Campaign title is required');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/campaigns`, { ...newCampaign, distributor_id: distributorId });
      setShowForm(false);
      setNewCampaign({ title: '', type: 'Digital', zone: 'All Zones', budget: '', start_date: '', end_date: '', description: '', status: 'Upcoming' });
      fetchData();
    } catch (err) {
      console.error('Error creating campaign:', err);
      setCampaigns(prev => [...prev, { id: Date.now(), ...newCampaign, status: 'Upcoming' }]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign.title) return alert('Campaign title is required');
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/campaigns/${editingCampaign.id}`, editingCampaign);
      setEditingCampaign(null);
      fetchData();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? editingCampaign : c));
      setEditingCampaign(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await axios.delete(`${API_BASE}/campaigns/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.type?.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudget = campaigns.reduce((a, c) => a + (parseFloat(c.budget) || 0), 0);

  if (loading) return <div className="dd-loading">Loading Branding...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div className="dd-header-info">
          <h1 className="dd-module-title">Branding Management</h1>
          <p className="dd-module-subtitle">Manage campaigns and promotional materials</p>
        </div>
        <div className="dd-header-btns">
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Campaign</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid">
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: '#fdf4ff', iconColor: '#c026d3' },
          { label: 'Active Now', value: campaigns.filter(c => c.status === 'Active').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Upcoming', value: campaigns.filter(c => c.status === 'Upcoming').length, color: '#eff6ff', iconColor: '#2563eb' },
          { label: 'Total Budget', value: `₹${(totalBudget / 1000).toFixed(1)}K`, color: '#f3eeff', iconColor: '#a855f7' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}><Megaphone size={18} color={s.iconColor} /></div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create Campaign Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Create New Campaign</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Campaign Title *</label><input placeholder="e.g. Monsoon Skincare Drive" value={newCampaign.title} onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })} /></div>
              <div className="dd-field"><label>Campaign Type</label>
                <select value={newCampaign.type} onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value })}>
                  <option>Digital</option><option>Print</option><option>Print + Digital</option><option>In-Store</option><option>Event</option>
                </select>
              </div>
              <div className="dd-field"><label>Target Zones</label>
                <select value={newCampaign.zone} onChange={e => setNewCampaign({ ...newCampaign, zone: e.target.value })}>
                  <option value="All Zones">All Zones</option>
                  {zones.map(z => (<option key={z.id} value={z.zone_name}>{z.zone_name}</option>))}
                  {zones.length === 0 && (<><option value="Zone A">Zone A</option><option value="Zone B">Zone B</option><option value="Zone C">Zone C</option><option value="Zone D">Zone D</option></>)}
                </select>
              </div>
              <div className="dd-field"><label>Status</label>
                <select value={newCampaign.status} onChange={e => setNewCampaign({ ...newCampaign, status: e.target.value })}>
                  <option>Upcoming</option><option>Active</option><option>Completed</option>
                </select>
              </div>
              <div className="dd-field"><label>Budget (₹)</label><input type="number" placeholder="e.g. 50000" value={newCampaign.budget} onChange={e => setNewCampaign({ ...newCampaign, budget: e.target.value })} /></div>
              <div className="dd-field"><label>Start Date</label><input type="date" value={newCampaign.start_date} onChange={e => setNewCampaign({ ...newCampaign, start_date: e.target.value })} /></div>
              <div className="dd-field"><label>End Date</label><input type="date" value={newCampaign.end_date} onChange={e => setNewCampaign({ ...newCampaign, end_date: e.target.value })} /></div>
              <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                <label>Campaign Description</label>
                <textarea placeholder="Describe the campaign goals, target audience..." style={{ minHeight: 80 }} value={newCampaign.description} onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleCreateCampaign} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div className="dd-search-inline">
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
        {filteredCampaigns.map(c => (
          <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #ede9f5', overflow: 'hidden', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,15,138,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ background: 'linear-gradient(135deg,#c00415,#7d020d)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.title}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>#{c.id} · {c.type}</p>
              </div>
              {statusBadge(c.status)}
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                <span>📍 {c.zone}</span>
                <span style={{ fontWeight: 700, color: '#7c3aed' }}>₹{parseFloat(c.budget || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                <span>📅 {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} → {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              {c.status === 'Active' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9ca3af', marginBottom: 4 }}>
                    <span>Campaign Progress</span><span>60%</span>
                  </div>
                  <div style={{ height: 5, background: '#f0eef8', borderRadius: 99 }}>
                    <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg,#c00415,#ec4899)', borderRadius: 99 }} />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="dd-btn dd-btn-outline" onClick={() => setViewingCampaign(c)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Eye size={13} /> View</button>
                <button className="dd-btn dd-btn-outline" onClick={() => setEditingCampaign(c)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Edit2 size={13} /> Edit</button>
                <button className="dd-btn dd-btn-danger" onClick={() => handleDeleteCampaign(c.id)} style={{ flex: 0.2, justifyContent: 'center', padding: '7px' }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="dd-modal-overlay" onClick={() => setEditingCampaign(null)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(550px, 100%)' }}>
            <div className="dd-modal-header">
              <h2 className="dd-modal-title">Edit Campaign</h2>
              <button className="dd-modal-close" onClick={() => setEditingCampaign(null)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body">
              <div className="dd-form-grid">
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Campaign Title *</label>
                  <input value={editingCampaign.title} onChange={e => setEditingCampaign({ ...editingCampaign, title: e.target.value })} />
                </div>
                <div className="dd-field"><label>Type</label>
                  <select value={editingCampaign.type} onChange={e => setEditingCampaign({ ...editingCampaign, type: e.target.value })}>
                    <option>Digital</option><option>Print</option><option>Print + Digital</option><option>In-Store</option>
                  </select>
                </div>
                <div className="dd-field"><label>Status</label>
                  <select value={editingCampaign.status || 'Upcoming'} onChange={e => setEditingCampaign({ ...editingCampaign, status: e.target.value })}>
                    <option>Upcoming</option><option>Active</option><option>Completed</option>
                  </select>
                </div>
                <div className="dd-field"><label>Budget (₹)</label>
                  <input type="number" value={editingCampaign.budget} onChange={e => setEditingCampaign({ ...editingCampaign, budget: e.target.value })} />
                </div>
                <div className="dd-field"><label>Start Date</label>
                  <input type="date" value={editingCampaign.start_date?.split('T')[0]} onChange={e => setEditingCampaign({ ...editingCampaign, start_date: e.target.value })} />
                </div>
                <div className="dd-field"><label>End Date</label>
                  <input type="date" value={editingCampaign.end_date?.split('T')[0]} onChange={e => setEditingCampaign({ ...editingCampaign, end_date: e.target.value })} />
                </div>
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}><label>Description</label>
                  <textarea value={editingCampaign.description || ''} onChange={e => setEditingCampaign({ ...editingCampaign, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="dd-modal-footer">
              <button className="dd-btn dd-btn-outline" onClick={() => setEditingCampaign(null)}>Cancel</button>
              <button className="dd-btn dd-btn-primary" onClick={handleUpdateCampaign} disabled={saving}>
                {saving ? 'Saving...' : 'Update Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Campaign Modal */}
      {viewingCampaign && (
        <div className="dd-modal-overlay" onClick={() => setViewingCampaign(null)}>
          <div className="dd-modal-content" style={{ maxWidth: 'min(500px, 100%)' }} onClick={e => e.stopPropagation()}>
            <div className="dd-modal-header" style={{ background: 'linear-gradient(135deg,#c00415,#7d020d)', color: '#fff' }}>
              <div>
                <h2 className="dd-modal-title" style={{ color: '#fff' }}>{viewingCampaign.title}</h2>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Campaign Overview</p>
              </div>
              <button className="dd-modal-close" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setViewingCampaign(null)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : '1fr 1fr', gap: 20 }}>
                <div><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Type</label><p style={{ fontWeight: 600 }}>{viewingCampaign.type}</p></div>
                <div><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Status</label><p>{statusBadge(viewingCampaign.status)}</p></div>
                <div><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Budget</label><p style={{ fontWeight: 700, color: '#7c3aed' }}>₹{parseFloat(viewingCampaign.budget || 0).toLocaleString()}</p></div>
                <div><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Zone</label><p>📍 {viewingCampaign.zone}</p></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Duration</label>
                  <p>📅 {new Date(viewingCampaign.start_date).toLocaleDateString()} — {new Date(viewingCampaign.end_date).toLocaleDateString()}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase' }}>Description</label>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5 }}>{viewingCampaign.description || 'No description provided for this campaign.'}</p>
                </div>
              </div>
            </div>
            <div className="dd-modal-footer">
              <button className="dd-btn dd-btn-primary" onClick={() => setViewingCampaign(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingManagement;
