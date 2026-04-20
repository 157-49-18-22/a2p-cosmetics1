import React, { useState } from 'react';
import { Star, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, CheckCircle, TrendingUp, Package, Users } from 'lucide-react';

const stockists = [
  { id: 'SS001', name: 'Mehta Co. Distributors', zone: 'Zone C', city: 'Gurugram', phone: '+91 92100 11223', email: 'mehta@co.com', dealers: 14, stock: '₹2.4L', status: 'Active', rating: 5, joined: 'Jan 2025' },
  { id: 'SS002', name: 'Sharma Mega Traders', zone: 'Zone A', city: 'Delhi', phone: '+91 98100 12345', email: 'sharma@mega.com', dealers: 18, stock: '₹3.1L', status: 'Active', rating: 4, joined: 'Feb 2025' },
  { id: 'SS003', name: 'Singh Super Supplies', zone: 'Zone E', city: 'Ludhiana', phone: '+91 96500 77889', email: 'singh@super.com', dealers: 9, stock: '₹1.8L', status: 'Active', rating: 4, joined: 'Mar 2025' },
  { id: 'SS004', name: 'Rajput Wholesale Hub', zone: 'Zone B', city: 'Noida', phone: '+91 97700 33445', email: 'rajput@wholesale.com', dealers: 11, stock: '₹2.0L', status: 'Inactive', rating: 3, joined: 'May 2025' },
];

const SuperStockist = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = stockists.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.zone.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Super Stockist</h1>
          <p className="dd-module-subtitle">Manage top-tier stockists who supply to your dealer network</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline">Export Report</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Stockist</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Super Stockists', value: stockists.length, color: '#fdf4ff', iconColor: '#c026d3' },
          { label: 'Active', value: stockists.filter(s => s.status === 'Active').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Total Dealers Under', value: stockists.reduce((a, s) => a + s.dealers, 0), color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Combined Stock Value', value: '₹9.3L', color: '#eff6ff', iconColor: '#2563eb' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}><Star size={18} color={s.iconColor} /></div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Stockist Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Register New Super Stockist</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Business Name</label><input placeholder="e.g. XYZ Distributors Pvt. Ltd." /></div>
              <div className="dd-field"><label>Stockist ID</label><input placeholder="Auto-generated" disabled style={{ background: '#f5f4f9', color: '#9ca3af' }} /></div>
              <div className="dd-field"><label>Assigned Zone</label><select><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option></select></div>
              <div className="dd-field"><label>City</label><input placeholder="e.g. Mumbai" /></div>
              <div className="dd-field"><label>Contact Person</label><input placeholder="Full name" /></div>
              <div className="dd-field"><label>Phone</label><input placeholder="+91 XXXXX XXXXX" /></div>
              <div className="dd-field"><label>Email</label><input placeholder="email@business.com" /></div>
              <div className="dd-field"><label>GST Number</label><input placeholder="GSTIN" /></div>
              <div className="dd-field"><label>Credit Limit (₹)</label><input type="number" placeholder="e.g. 500000" /></div>
              <div className="dd-field"><label>Payment Terms</label><select><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><CheckCircle size={14} /> Register Stockist</button>
            </div>
          </div>
        </div>
      )}

      {/* Stockist Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e1b2e' }}>All Super Stockists</p>
        <div className="dd-search-inline">
          <Search size={14} color="#9ca3af" />
          <input placeholder="Search stockist..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18, marginBottom: 24 }}>
        {filtered.map(s => (
          <div key={s.id} style={{
            background: '#fff', borderRadius: 18, border: '1.5px solid #ede9f5',
            overflow: 'hidden', transition: 'all 0.25s', cursor: 'pointer'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(74,15,138,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* Card Header */}
            <div style={{ background: 'linear-gradient(135deg,#1a0533,#4a0f8a)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{s.name[0]}</div>
                <div>
                  <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{s.name}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{s.id} · Joined {s.joined}</p>
                </div>
              </div>
              <span className={`dd-badge ${s.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{s.status}</span>
            </div>

            {/* Card Body */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color="#ec4899" /> {s.city} · {s.zone}</p>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} color="#a855f7" /> {s.phone}</p>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} color="#2563eb" /> {s.email}</p>
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <Star key={r} size={14} fill={r <= s.rating ? '#f59e0b' : 'none'} color={r <= s.rating ? '#f59e0b' : '#d1d5db'} />
                ))}
                <span style={{ fontSize: '0.73rem', color: '#9ca3af', marginLeft: 4 }}>({s.rating}/5)</span>
              </div>

              <div className="dd-divider" style={{ margin: '0 0 14px' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Dealers', value: s.dealers, icon: Users, color: '#a855f7' },
                  { label: 'Stock Value', value: s.stock, icon: Package, color: '#ec4899' },
                  { label: 'Growth', value: '+12%', icon: TrendingUp, color: '#16a34a' },
                ].map((m, i) => (
                  <div key={i} style={{ background: '#f9f7ff', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <m.icon size={14} color={m.color} style={{ margin: '0 auto 4px' }} />
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e1b2e' }}>{m.value}</p>
                    <p style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{m.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="dd-btn dd-btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.77rem' }}><Edit2 size={13} /> Edit</button>
                <button className="dd-btn dd-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.77rem' }}>View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="dd-card">
        <div className="dd-card-header"><span className="dd-card-title">Stockist Performance Summary</span></div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead><tr><th>ID</th><th>Name</th><th>Zone</th><th>City</th><th>Dealers Under</th><th>Stock Value</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {stockists.map(s => (
                <tr key={s.id}>
                  <td style={{ color: '#c026d3', fontWeight: 700 }}>{s.id}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.zone}</td>
                  <td>{s.city}</td>
                  <td style={{ fontWeight: 600 }}>{s.dealers}</td>
                  <td style={{ fontWeight: 700, color: '#7c3aed' }}>{s.stock}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(r => <Star key={r} size={12} fill={r <= s.rating ? '#f59e0b' : 'none'} color={r <= s.rating ? '#f59e0b' : '#d1d5db'} />)}
                    </div>
                  </td>
                  <td><span className={`dd-badge ${s.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{s.status}</span></td>
                  <td><div style={{ display: 'flex', gap: 6 }}>
                    <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Edit2 size={12} /></button>
                    <button className="dd-btn dd-btn-danger" style={{ padding: '5px 9px' }}><Trash2 size={12} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperStockist;
