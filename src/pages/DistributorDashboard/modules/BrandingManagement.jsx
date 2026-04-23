import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Search, Image, FileText, Video, Edit2, Trash2, Eye, CheckCircle, Clock, Upload, Tag } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/distributor';
const distributorId = 1;

const assetIcon = (type) => ({
  Print: <FileText size={16} color="#a855f7" />,
  Digital: <Image size={16} color="#ec4899" />,
  Video: <Video size={16} color="#2563eb" />,
  'In-Store': <Tag size={16} color="#16a34a" />
}[type] || <FileText size={16} />);

const statusBadge = (s) => ({
  Active: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Upcoming: <span className="dd-badge dd-badge-blue"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Completed: <span className="dd-badge dd-badge-purple">{s}</span>,
}[s] || <span className="dd-badge dd-badge-yellow">{s}</span>);

const BrandingManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '', type: 'Digital', zone: 'All Zones', budget: '', start_date: '', end_date: '', description: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [campRes, assetRes] = await Promise.all([
        axios.get(`${API_BASE}/campaigns/${distributorId}`),
        axios.get(`${API_BASE}/assets/${distributorId}`)
      ]);
      setCampaigns(campRes.data.length > 0 ? campRes.data : [
        { id: 1, title: 'Summer Glow Campaign', type: 'Digital', zone: 'All Zones', start_date: '2026-05-01', end_date: '2026-05-30', budget: 50000, status: 'Upcoming', assets_count: 8 },
        { id: 2, title: 'Face Serum Launch', type: 'Print + Digital', zone: 'Zone A, B', start_date: '2026-04-10', end_date: '2026-04-25', budget: 35000, status: 'Active', assets_count: 12 },
        { id: 3, title: 'Dealer Display Kits', type: 'In-Store', zone: 'Zone C', start_date: '2026-04-01', end_date: '2026-04-15', budget: 20000, status: 'Completed', assets_count: 5 },
      ]);
      setAssets(assetRes.data.length > 0 ? assetRes.data : [
        { id: 1, name: 'Summer Banner - 6ft x 3ft', type: 'Print', file_format: 'PDF', file_size: '4.2 MB', campaign_title: 'Summer Glow', zone: 'All' },
        { id: 2, name: 'Face Serum Social Post', type: 'Digital', file_format: 'PNG', file_size: '1.8 MB', campaign_title: 'Face Serum Launch', zone: 'Zone A, B' },
        { id: 3, name: 'Product Demo Video 60s', type: 'Video', file_format: 'MP4', file_size: '48 MB', campaign_title: 'Face Serum Launch', zone: 'All' },
      ]);
    } catch (err) {
      console.error('Branding fetch error:', err);
      // Use fallback static data on API error
      setCampaigns([
        { id: 1, title: 'Summer Glow Campaign', type: 'Digital', zone: 'All Zones', start_date: '2026-05-01', end_date: '2026-05-30', budget: 50000, status: 'Upcoming', assets_count: 8 },
        { id: 2, title: 'Face Serum Launch', type: 'Print + Digital', zone: 'Zone A, B', start_date: '2026-04-10', end_date: '2026-04-25', budget: 35000, status: 'Active', assets_count: 12 },
      ]);
      setAssets([
        { id: 1, name: 'Summer Banner - 6ft x 3ft', type: 'Print', file_format: 'PDF', file_size: '4.2 MB', campaign_title: 'Summer Glow', zone: 'All' },
        { id: 2, name: 'Face Serum Social Post', type: 'Digital', file_format: 'PNG', file_size: '1.8 MB', campaign_title: 'Face Serum Launch', zone: 'Zone A, B' },
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
      setNewCampaign({ title: '', type: 'Digital', zone: 'All Zones', budget: '', start_date: '', end_date: '', description: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating campaign:', err);
      // Add locally on API error
      setCampaigns(prev => [...prev, { id: Date.now(), ...newCampaign, status: 'Upcoming', assets_count: 0 }]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.type?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAssets = assets.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.type?.toLowerCase().includes(search.toLowerCase())
  );

  const totalBudget = campaigns.reduce((a, c) => a + (parseFloat(c.budget) || 0), 0);

  if (loading) return <div className="dd-loading">Loading Branding...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Branding Management</h1>
          <p className="dd-module-subtitle">Manage campaigns, brand assets and promotional materials</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline"><Upload size={14} /> Upload Asset</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Campaign</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: '#fdf4ff', iconColor: '#c026d3' },
          { label: 'Active Now', value: campaigns.filter(c => c.status === 'Active').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Brand Assets', value: assets.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Total Budget', value: `₹${(totalBudget / 1000).toFixed(1)}K`, color: '#eff6ff', iconColor: '#2563eb' },
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
                  <option>All Zones</option><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option>
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
            <div style={{ marginTop: 18, padding: '20px', border: '2px dashed #e9d8ff', borderRadius: 12, textAlign: 'center', background: '#faf8ff' }}>
              <Upload size={28} color="#a855f7" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e1b2e' }}>Drag & Drop Campaign Assets</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 12 }}>PNG, JPG, PDF, MP4 — Max 50MB each</p>
              <button className="dd-btn dd-btn-outline" style={{ fontSize: '0.77rem', padding: '7px 16px' }}><Upload size={13} /> Browse Files</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleCreateCampaign} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: '#f5f4f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[{ id: 'campaigns', label: 'Campaigns' }, { id: 'assets', label: 'Brand Assets' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 20px', borderRadius: 9, fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', border: 'none',
            background: activeTab === t.id ? '#fff' : 'transparent',
            color: activeTab === t.id ? '#7c3aed' : '#9ca3af',
            boxShadow: activeTab === t.id ? '0 1px 6px rgba(0,0,0,0.07)' : 'none', transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div className="dd-search-inline">
          <Search size={14} color="#9ca3af" />
          <input placeholder={activeTab === 'campaigns' ? 'Search campaigns...' : 'Search assets...'} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Campaigns Grid */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredCampaigns.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #ede9f5', overflow: 'hidden', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,15,138,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ background: 'linear-gradient(135deg,#1a0533,#4a0f8a)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.title}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>#{c.id} · {c.type}</p>
                </div>
                {statusBadge(c.status)}
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span>📍 {c.zone}</span>
                  <span>🗂 {c.assets_count || 0} assets</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span>📅 {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} → {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}</span>
                  <span style={{ fontWeight: 700, color: '#7c3aed' }}>₹{parseFloat(c.budget || 0).toLocaleString()}</span>
                </div>
                {c.status === 'Active' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9ca3af', marginBottom: 4 }}>
                      <span>Campaign Progress</span><span>60%</span>
                    </div>
                    <div style={{ height: 5, background: '#f0eef8', borderRadius: 99 }}>
                      <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg,#ec4899,#a855f7)', borderRadius: 99 }} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="dd-btn dd-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Eye size={13} /> View</button>
                  <button className="dd-btn dd-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Edit2 size={13} /> Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assets Table */}
      {activeTab === 'assets' && (
        <div className="dd-card">
          <div className="dd-table-wrap">
            <table className="dd-table">
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Format</th><th>Size</th><th>Campaign</th><th>Zone</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredAssets.map(a => (
                  <tr key={a.id}>
                    <td style={{ color: '#c026d3', fontWeight: 700 }}>#{a.id}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, paddingTop: 13 }}>{assetIcon(a.type)} {a.name}</td>
                    <td><span className="dd-badge dd-badge-purple">{a.type}</span></td>
                    <td><span style={{ background: '#f5f4f9', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>{a.file_format}</span></td>
                    <td style={{ color: '#9ca3af' }}>{a.file_size}</td>
                    <td>{a.campaign_title || 'N/A'}</td>
                    <td>{a.zone || 'All'}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Eye size={12} /></button>
                      <button className="dd-btn dd-btn-danger" style={{ padding: '5px 9px' }}><Trash2 size={12} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingManagement;
