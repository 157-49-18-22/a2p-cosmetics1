import React, { useState } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, CheckCircle, Clock, Star } from 'lucide-react';

const dealers = [
  { id: 'DL001', name: 'Sharma Traders', type: 'Dealer', zone: 'Zone A', phone: '+91 98100 12345', email: 'sharma@traders.com', city: 'Delhi', status: 'Active', rev: '₹82K', joined: 'Jan 2025' },
  { id: 'DL002', name: 'Priya Sub-Stores', type: 'Sub-Dealer', zone: 'Zone A', phone: '+91 99901 54321', email: 'priya@substores.com', city: 'Rohini', status: 'Active', rev: '₹18K', joined: 'Mar 2025' },
  { id: 'DL003', name: 'Ravi Distribution', type: 'Dealer', zone: 'Zone B', phone: '+91 98200 11223', email: 'ravi@dist.com', city: 'Noida', status: 'Active', rev: '₹68K', joined: 'Feb 2025' },
  { id: 'DL004', name: 'Kiran Agencies', type: 'Sub-Dealer', zone: 'Zone B', phone: '+91 97300 44556', email: 'kiran@agencies.com', city: 'Ghaziabad', status: 'Inactive', rev: '₹6K', joined: 'Jun 2025' },
  { id: 'DL005', name: 'Mehta Co.', type: 'Dealer', zone: 'Zone C', phone: '+91 96100 77889', email: 'mehta@co.com', city: 'Gurugram', status: 'Active', rev: '₹74K', joined: 'Jan 2025' },
  { id: 'DL006', name: 'Sunita Verma Stores', type: 'Sub-Dealer', zone: 'Zone D', phone: '+91 95500 33441', email: 'sunita@stores.com', city: 'Jaipur', status: 'Active', rev: '₹22K', joined: 'Apr 2025' },
];

const DealerSubDealer = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('table'); // 'table' | 'cards'

  const filtered = dealers.filter(d =>
    (filterType === 'All' || d.type === filterType) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.zone.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Dealer / Sub-Dealer</h1>
          <p className="dd-module-subtitle">Manage your entire dealer network and sub-dealer relationships</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline" onClick={() => setView(view === 'table' ? 'cards' : 'table')}>
            {view === 'table' ? '⊞ Card View' : '≡ Table View'}
          </button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Dealer</button>
        </div>
      </div>

      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Dealers', value: dealers.filter(d => d.type === 'Dealer').length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Total Sub-Dealers', value: dealers.filter(d => d.type === 'Sub-Dealer').length, color: '#fff0f9', iconColor: '#ec4899' },
          { label: 'Active', value: dealers.filter(d => d.status === 'Active').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Inactive', value: dealers.filter(d => d.status === 'Inactive').length, color: '#fffbeb', iconColor: '#d97706' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}><Users size={18} color={s.iconColor} /></div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Add Dealer / Sub-Dealer</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Full Name / Business</label><input placeholder="Enter name" /></div>
              <div className="dd-field"><label>Type</label><select><option>Dealer</option><option>Sub-Dealer</option></select></div>
              <div className="dd-field"><label>Zone</label><select><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option></select></div>
              <div className="dd-field"><label>City</label><input placeholder="e.g. Delhi" /></div>
              <div className="dd-field"><label>Phone</label><input placeholder="+91 XXXXX XXXXX" /></div>
              <div className="dd-field"><label>Email</label><input placeholder="email@example.com" /></div>
              <div className="dd-field"><label>Parent Dealer (for Sub-Dealer)</label><select><option>None</option>{dealers.filter(d => d.type === 'Dealer').map(d => <option key={d.id}>{d.name}</option>)}</select></div>
              <div className="dd-field"><label>Credit Limit (₹)</label><input type="number" placeholder="e.g. 50000" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><CheckCircle size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Dealer', 'Sub-Dealer'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid', borderColor: filterType === t ? '#a855f7' : '#ede9f5',
                background: filterType === t ? '#f3eeff' : '#fff', color: filterType === t ? '#7c3aed' : '#6b7280', transition: 'all 0.2s'
              }}>{t}</button>
            ))}
          </div>
          <div className="dd-search-inline">
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search dealer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {view === 'cards' ? (
          <div className="dd-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(d => (
              <div key={d.id} style={{ border: '1.5px solid #ede9f5', borderRadius: 14, padding: '16px 18px', background: '#faf8ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#ec4899,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{d.name[0]}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e1b2e' }}>{d.name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{d.id}</p>
                    </div>
                  </div>
                  <span className={`dd-badge ${d.type === 'Dealer' ? 'dd-badge-purple' : 'dd-badge-blue'}`}>{d.type}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} color="#ec4899" /> {d.city} · {d.zone}</p>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} color="#a855f7" /> {d.phone}</p>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} color="#2563eb" /> {d.email}</p>
                </div>
                <div className="dd-divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>{d.rev} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.72rem' }}>/ month</span></span>
                  <span className={`dd-badge ${d.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dd-table-wrap">
            <table className="dd-table">
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Zone</th><th>City</th><th>Phone</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{ color: '#7c3aed', fontWeight: 600 }}>{d.id}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className={`dd-badge ${d.type === 'Dealer' ? 'dd-badge-purple' : 'dd-badge-blue'}`}>{d.type}</span></td>
                    <td>{d.zone}</td>
                    <td>{d.city}</td>
                    <td>{d.phone}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{d.rev}</td>
                    <td><span className={`dd-badge ${d.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{d.status}</span></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Edit2 size={12} /></button>
                      <button className="dd-btn dd-btn-danger" style={{ padding: '5px 9px' }}><Trash2 size={12} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerSubDealer;
