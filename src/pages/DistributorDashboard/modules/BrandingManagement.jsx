import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Search, Image, FileText, Video, Edit2, Trash2, Eye, CheckCircle, Clock, Upload, Tag, X, Download } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/distributors';
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
  const fileInputRef = React.useRef(null);
  const assetInputRef = React.useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showForm, setShowForm] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    title: '', type: 'Digital', zone: 'All Zones', budget: '', start_date: '', end_date: '', description: ''
  });
  const [newAsset, setNewAsset] = useState({
    name: '', type: 'Digital', campaign_id: '', file: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [campRes, assetRes] = await Promise.all([
        axios.get(`${API_BASE}/${distributorId}/campaigns`),
        axios.get(`${API_BASE}/${distributorId}/assets`)
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
      setCampaigns(prev => [...prev, { id: Date.now(), ...newCampaign, status: 'Upcoming', assets_count: 0 }]);
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

  const handleUploadAsset = async () => {
    if (!newAsset.name) return alert('Asset name is required');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/assets`, { ...newAsset, distributor_id: distributorId });
      setShowAssetModal(false);
      setNewAsset({ name: '', type: 'Digital', campaign_id: '', file: null });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      console.error('Error uploading asset:', err);
      setAssets(prev => [...prev, { id: Date.now(), ...newAsset, file_format: 'PNG', file_size: '2.5 MB', campaign_title: campaigns.find(c => c.id == newAsset.campaign_id)?.title || 'General' }]);
      setShowAssetModal(false);
      setSelectedFile(null);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAsset = async () => {
    if (!editingAsset.name) return alert('Asset name is required');
    setSaving(true);
    try {
      // await axios.put(`${API_BASE}/assets/${editingAsset.id}`, editingAsset);
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...editingAsset, campaign_title: campaigns.find(c => c.id == editingAsset.campaign_id)?.title || 'General' } : a));
      setEditingAsset(null);
    } catch (err) {
      console.error('Error updating asset:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleAssetFileBrowse = () => {
    assetInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewAsset(prev => ({ ...prev, file }));
      // Auto-fill name if empty
      if (!newAsset.name) setNewAsset(prev => ({ ...prev, name: file.name.split('.')[0] }));
    }
  };
  
  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await axios.delete(`${API_BASE}/campaigns/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await axios.delete(`${API_BASE}/assets/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting asset:', err);
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
          <button className="dd-btn dd-btn-outline" onClick={() => setShowAssetModal(true)}><Upload size={14} /> Upload Asset</button>
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
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileChange} />
              <Upload size={28} color="#a855f7" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e1b2e' }}>{selectedFile ? selectedFile.name : 'Drag & Drop Campaign Assets'}</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 12 }}>PNG, JPG, PDF, MP4 — Max 50MB each</p>
              <button className="dd-btn dd-btn-outline" style={{ fontSize: '0.77rem', padding: '7px 16px' }} onClick={handleFileBrowse}><Upload size={13} /> Browse Files</button>
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
                  <button className="dd-btn dd-btn-outline" onClick={() => setViewingCampaign(c)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Eye size={13} /> View</button>
                  <button className="dd-btn dd-btn-outline" onClick={() => setEditingCampaign(c)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '7px' }}><Edit2 size={13} /> Edit</button>
                  <button className="dd-btn dd-btn-danger" onClick={() => handleDeleteCampaign(c.id)} style={{ flex: 0.2, justifyContent: 'center', padding: '7px' }}><Trash2 size={13} /></button>
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
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }} onClick={() => setViewingAsset(a)}><Eye size={12} /></button>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }} onClick={() => setEditingAsset(a)}><Edit2 size={12} /></button>
                      <button className="dd-btn dd-btn-danger" style={{ padding: '5px 9px' }} onClick={() => handleDeleteAsset(a.id)}><Trash2 size={12} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Upload Asset Modal */}
      {showAssetModal && (
        <div className="dd-modal-overlay" onClick={() => setShowAssetModal(false)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dd-modal-header">
              <h2 className="dd-modal-title">Upload Brand Asset</h2>
              <button className="dd-modal-close" onClick={() => setShowAssetModal(false)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body">
              <div className="dd-form-grid">
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Asset Name *</label>
                  <input placeholder="e.g. Summer Banner 2026" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
                </div>
                <div className="dd-field">
                  <label>Asset Type</label>
                  <select value={newAsset.type} onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}>
                    <option>Digital</option><option>Print</option><option>Video</option><option>In-Store</option>
                  </select>
                </div>
                <div className="dd-field">
                  <label>Link to Campaign</label>
                  <select value={newAsset.campaign_id} onChange={e => setNewAsset({ ...newAsset, campaign_id: e.target.value })}>
                    <option value="">No Campaign (General)</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                  <input type="file" ref={assetInputRef} style={{ display: 'none' }} onChange={onFileChange} />
                  <div style={{ padding: '30px', border: '2px dashed #e9d8ff', borderRadius: 16, textAlign: 'center', background: '#faf8ff', cursor: 'pointer' }} onClick={handleAssetFileBrowse}>
                    <Upload size={32} color="#a855f7" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontWeight: 600 }}>{selectedFile ? selectedFile.name : 'Select or drop files here'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Max file size: 50MB</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="dd-modal-footer">
              <button className="dd-btn dd-btn-outline" onClick={() => setShowAssetModal(false)}>Cancel</button>
              <button className="dd-btn dd-btn-primary" onClick={handleUploadAsset} disabled={saving}>
                {saving ? 'Uploading...' : 'Upload Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="dd-modal-overlay" onClick={() => setEditingCampaign(null)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()}>
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
                <div className="dd-field">
                  <label>Type</label>
                  <select value={editingCampaign.type} onChange={e => setEditingCampaign({ ...editingCampaign, type: e.target.value })}>
                    <option>Digital</option><option>Print</option><option>Print + Digital</option><option>In-Store</option>
                  </select>
                </div>
                <div className="dd-field">
                  <label>Budget (₹)</label>
                  <input type="number" value={editingCampaign.budget} onChange={e => setEditingCampaign({ ...editingCampaign, budget: e.target.value })} />
                </div>
                <div className="dd-field">
                  <label>Start Date</label>
                  <input type="date" value={editingCampaign.start_date?.split('T')[0]} onChange={e => setEditingCampaign({ ...editingCampaign, start_date: e.target.value })} />
                </div>
                <div className="dd-field">
                  <label>End Date</label>
                  <input type="date" value={editingCampaign.end_date?.split('T')[0]} onChange={e => setEditingCampaign({ ...editingCampaign, end_date: e.target.value })} />
                </div>
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
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
          <div className="dd-modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="dd-modal-header" style={{ background: 'linear-gradient(135deg,#1a0533,#4a0f8a)', color: '#fff' }}>
              <div>
                <h2 className="dd-modal-title" style={{ color: '#fff' }}>{viewingCampaign.title}</h2>
                <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>Campaign Overview</p>
              </div>
              <button className="dd-modal-close" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setViewingCampaign(null)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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

      {/* View Asset Modal */}
      {viewingAsset && (
        <div className="dd-modal-overlay" onClick={() => setViewingAsset(null)}>
          <div className="dd-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="dd-modal-header" style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                    {assetIcon(viewingAsset.type)}
                  </div>
                  <div>
                    <h2 className="dd-modal-title" style={{ fontSize: '1.05rem' }}>Asset Preview</h2>
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{viewingAsset.file_format} · {viewingAsset.file_size}</p>
                  </div>
               </div>
               <button className="dd-modal-close" onClick={() => setViewingAsset(null)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '100%', height: 200, background: '#f9fafb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e7eb', marginBottom: 20 }}>
                   <div style={{ textAlign: 'center' }}>
                      <Image size={48} color="#d1d5db" style={{ margin: '0 auto 10px' }} />
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No Preview Available for {viewingAsset.file_format}</p>
                   </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1b2e' }}>{viewingAsset.name}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>Campaign: <strong style={{ color: '#7c3aed' }}>{viewingAsset.campaign_title || 'General'}</strong></p>
            </div>
            <div className="dd-modal-footer">
               <button className="dd-btn dd-btn-outline" style={{ flex: 1 }} onClick={() => setViewingAsset(null)}>Close</button>
               <button className="dd-btn dd-btn-primary" style={{ flex: 1 }}><Download size={14} /> Download</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="dd-modal-overlay" onClick={() => setEditingAsset(null)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dd-modal-header">
              <h2 className="dd-modal-title">Edit Asset Details</h2>
              <button className="dd-modal-close" onClick={() => setEditingAsset(null)}><X size={18} /></button>
            </div>
            <div className="dd-modal-body">
              <div className="dd-form-grid">
                <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Asset Name *</label>
                  <input value={editingAsset.name} onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })} />
                </div>
                <div className="dd-field">
                  <label>Type</label>
                  <select value={editingAsset.type} onChange={e => setEditingAsset({ ...editingAsset, type: e.target.value })}>
                    <option>Digital</option><option>Print</option><option>Video</option><option>In-Store</option>
                  </select>
                </div>
                <div className="dd-field">
                  <label>Campaign</label>
                  <select value={editingAsset.campaign_id} onChange={e => setEditingAsset({ ...editingAsset, campaign_id: e.target.value })}>
                    <option value="">No Campaign (General)</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="dd-modal-footer">
              <button className="dd-btn dd-btn-outline" onClick={() => setEditingAsset(null)}>Cancel</button>
              <button className="dd-btn dd-btn-primary" onClick={handleUpdateAsset} disabled={saving}>
                {saving ? 'Saving...' : 'Update Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingManagement;
