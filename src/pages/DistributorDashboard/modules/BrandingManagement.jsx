import React, { useState } from 'react';
import { Megaphone, Plus, Search, Image, FileText, Video, Edit2, Trash2, Eye, CheckCircle, Clock, Upload, Tag } from 'lucide-react';

const campaigns = [
  { id: 'BR001', title: 'Summer Glow Campaign', type: 'Digital', zone: 'All Zones', start: '01 May 2026', end: '30 May 2026', budget: '₹50,000', status: 'Upcoming', assets: 8 },
  { id: 'BR002', title: 'Face Serum Launch', type: 'Print + Digital', zone: 'Zone A, B', start: '10 Apr 2026', end: '25 Apr 2026', budget: '₹35,000', status: 'Active', assets: 12 },
  { id: 'BR003', title: 'Dealer Display Kits', type: 'In-Store', zone: 'Zone C', start: '01 Apr 2026', end: '15 Apr 2026', budget: '₹20,000', status: 'Completed', assets: 5 },
  { id: 'BR004', title: 'Holi Special Promo', type: 'Digital', zone: 'All Zones', start: '20 Mar 2026', end: '31 Mar 2026', budget: '₹28,000', status: 'Completed', assets: 9 },
];

const assets = [
  { id: 'AST001', name: 'Summer Banner - 6ft x 3ft', type: 'Print', format: 'PDF', size: '4.2 MB', campaign: 'Summer Glow', zone: 'All' },
  { id: 'AST002', name: 'Face Serum Social Post', type: 'Digital', format: 'PNG', size: '1.8 MB', campaign: 'Face Serum Launch', zone: 'Zone A, B' },
  { id: 'AST003', name: 'Product Demo Video 60s', type: 'Video', format: 'MP4', size: '48 MB', campaign: 'Face Serum Launch', zone: 'All' },
  { id: 'AST004', name: 'Dealer Standee Template', type: 'In-Store', format: 'PSD', size: '22 MB', campaign: 'Dealer Display', zone: 'Zone C' },
  { id: 'AST005', name: 'Holi Offer WhatsApp Card', type: 'Digital', format: 'JPG', size: '0.9 MB', campaign: 'Holi Promo', zone: 'All' },
];

const assetIcon = (type) => ({ Print: <FileText size={16} color="#a855f7" />, Digital: <Image size={16} color="#ec4899" />, Video: <Video size={16} color="#2563eb" />, 'In-Store': <Tag size={16} color="#16a34a" /> }[type] || <FileText size={16} />);

const statusBadge = (s) => ({
  Active: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Upcoming: <span className="dd-badge dd-badge-blue"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Completed: <span className="dd-badge dd-badge-purple">{s}</span>,
}[s]);

const BrandingManagement = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showForm, setShowForm] = useState(false);

  const filteredCampaigns = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
  );

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
          { label: 'Total Budget', value: '₹1.33L', color: '#eff6ff', iconColor: '#2563eb' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}><Megaphone size={18} color={s.iconColor} /></div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create Campaign */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Create New Campaign</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Campaign Title</label><input placeholder="e.g. Monsoon Skincare Drive" /></div>
              <div className="dd-field"><label>Campaign Type</label><select><option>Digital</option><option>Print</option><option>Print + Digital</option><option>In-Store</option><option>Event</option></select></div>
              <div className="dd-field"><label>Target Zones</label><select><option>All Zones</option><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option></select></div>
              <div className="dd-field"><label>Budget (₹)</label><input type="number" placeholder="e.g. 50000" /></div>
              <div className="dd-field"><label>Start Date</label><input type="date" /></div>
              <div className="dd-field"><label>End Date</label><input type="date" /></div>
              <div className="dd-field" style={{ gridColumn: '1 / -1' }}>
                <label>Campaign Description</label>
                <textarea placeholder="Describe the campaign goals, target audience..." style={{ minHeight: 80 }} />
              </div>
            </div>

            {/* Asset uploader */}
            <div style={{ marginTop: 18, padding: '20px', border: '2px dashed #e9d8ff', borderRadius: 12, textAlign: 'center', background: '#faf8ff' }}>
              <Upload size={28} color="#a855f7" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e1b2e' }}>Drag & Drop Campaign Assets</p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 12 }}>PNG, JPG, PDF, MP4 — Max 50MB each</p>
              <button className="dd-btn dd-btn-outline" style={{ fontSize: '0.77rem', padding: '7px 16px' }}><Upload size={13} /> Browse Files</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><CheckCircle size={14} /> Create Campaign</button>
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
            boxShadow: activeTab === t.id ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
            transition: 'all 0.2s'
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

      {activeTab === 'campaigns' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredCampaigns.map(c => (
            <div key={c.id} style={{
              background: '#fff', borderRadius: 16, border: '1.5px solid #ede9f5', overflow: 'hidden',
              transition: 'all 0.25s'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(74,15,138,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ background: 'linear-gradient(135deg,#1a0533,#4a0f8a)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.title}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{c.id} · {c.type}</p>
                </div>
                {statusBadge(c.status)}
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span>📍 {c.zone}</span>
                  <span>🗂 {c.assets} assets</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span>📅 {c.start} → {c.end}</span>
                  <span style={{ fontWeight: 700, color: '#7c3aed' }}>{c.budget}</span>
                </div>

                {/* Progress bar for active campaigns */}
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

      {activeTab === 'assets' && (
        <div className="dd-card">
          <div className="dd-table-wrap">
            <table className="dd-table">
              <thead><tr><th>Asset ID</th><th>Name</th><th>Type</th><th>Format</th><th>Size</th><th>Campaign</th><th>Zone</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredAssets.map(a => (
                  <tr key={a.id}>
                    <td style={{ color: '#c026d3', fontWeight: 700 }}>{a.id}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, paddingTop: 13 }}>{assetIcon(a.type)} {a.name}</td>
                    <td><span className="dd-badge dd-badge-purple">{a.type}</span></td>
                    <td><span style={{ background: '#f5f4f9', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>{a.format}</span></td>
                    <td style={{ color: '#9ca3af' }}>{a.size}</td>
                    <td>{a.campaign}</td>
                    <td>{a.zone}</td>
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
