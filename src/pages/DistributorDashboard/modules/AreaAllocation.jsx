import React, { useState } from 'react';
import { Map, Plus, Edit2, Trash2, CheckCircle, Users, Package } from 'lucide-react';

const zones = [
  { id: 'ZA', name: 'Zone A', region: 'Delhi NCR', assignedTo: 'Sharma Traders', dealers: 18, coverage: 'North Delhi, Rohini, Pitampura', status: 'Active', rev: '₹82K' },
  { id: 'ZB', name: 'Zone B', region: 'UP West', assignedTo: 'Ravi Distribution', dealers: 14, coverage: 'Noida, Ghaziabad, Meerut', status: 'Active', rev: '₹68K' },
  { id: 'ZC', name: 'Zone C', region: 'Haryana', assignedTo: 'Mehta Co.', dealers: 11, coverage: 'Gurugram, Faridabad, Panipat', status: 'Active', rev: '₹74K' },
  { id: 'ZD', name: 'Zone D', region: 'Rajasthan', assignedTo: 'Unassigned', dealers: 0, coverage: 'Jaipur, Ajmer, Bikaner', status: 'Inactive', rev: '—' },
  { id: 'ZE', name: 'Zone E', region: 'Punjab', assignedTo: 'Singh Distributors', dealers: 9, coverage: 'Ludhiana, Amritsar, Patiala', status: 'Active', rev: '₹55K' },
];

const AreaAllocation = () => {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Area Allocation</h1>
          <p className="dd-module-subtitle">Assign and manage distribution zones & territories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline">Export Map</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Zone</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Zones', value: zones.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Active Zones', value: zones.filter(z => z.status === 'Active').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Unassigned Zones', value: zones.filter(z => z.assignedTo === 'Unassigned').length, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Dealers', value: zones.reduce((a, z) => a + z.dealers, 0), color: '#eff6ff', iconColor: '#2563eb' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <Map size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Zone Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Create New Zone</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Zone Name</label><input placeholder="e.g. Zone F" /></div>
              <div className="dd-field"><label>Region / State</label><input placeholder="e.g. Maharashtra" /></div>
              <div className="dd-field"><label>Coverage Area</label><input placeholder="e.g. Mumbai, Pune..." /></div>
              <div className="dd-field"><label>Assign Super Stockist</label>
                <select><option>Unassigned</option><option>Sharma Traders</option><option>Mehta Co.</option><option>Ravi Distribution</option></select>
              </div>
              <div className="dd-field"><label>Product Lines</label>
                <select><option>All Products</option><option>Face Care Only</option><option>Body Care Only</option></select>
              </div>
              <div className="dd-field"><label>Status</label>
                <select><option>Active</option><option>Inactive</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><CheckCircle size={14} /> Save Zone</button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 18, marginBottom: 24 }}>
        {zones.map(z => (
          <div key={z.id} onClick={() => setSelected(selected === z.id ? null : z.id)}
            style={{
              background: '#fff', borderRadius: 16, border: `2px solid ${selected === z.id ? '#a855f7' : '#ede9f5'}`,
              padding: '18px 20px', cursor: 'pointer', transition: 'all 0.25s',
              boxShadow: selected === z.id ? '0 4px 18px rgba(168,85,247,0.14)' : 'none'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#ec4899,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>{z.id}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e1b2e' }}>{z.name}</p>
                    <p style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{z.region}</p>
                  </div>
                </div>
              </div>
              <span className={`dd-badge ${z.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{z.status}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>📍 {z.coverage}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: '#374151' }}>
                <Users size={13} color="#a855f7" /> {z.dealers} Dealers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.77rem', color: '#374151' }}>
                <Package size={13} color="#ec4899" /> Rev: {z.rev}
              </div>
            </div>
            <div className="dd-divider" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Assigned to: <strong style={{ color: z.assignedTo === 'Unassigned' ? '#d97706' : '#1e1b2e' }}>{z.assignedTo}</strong></span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="dd-btn dd-btn-outline" style={{ padding: '4px 9px' }} onClick={e => e.stopPropagation()}><Edit2 size={12} /></button>
                <button className="dd-btn dd-btn-danger" style={{ padding: '4px 9px' }} onClick={e => e.stopPropagation()}><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table View */}
      <div className="dd-card">
        <div className="dd-card-header"><span className="dd-card-title">Zone Summary Table</span></div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead><tr><th>Zone</th><th>Region</th><th>Assigned To</th><th>Dealers</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id}>
                  <td style={{ fontWeight: 700, color: '#7c3aed' }}>{z.name}</td>
                  <td>{z.region}</td>
                  <td style={{ fontWeight: 600, color: z.assignedTo === 'Unassigned' ? '#d97706' : '#1e1b2e' }}>{z.assignedTo}</td>
                  <td>{z.dealers}</td>
                  <td style={{ fontWeight: 700 }}>{z.rev}</td>
                  <td><span className={`dd-badge ${z.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{z.status}</span></td>
                  <td><div style={{ display: 'flex', gap: 6 }}>
                    <button className="dd-btn dd-btn-outline" style={{ padding: '5px 10px', fontSize: '0.73rem' }}>Edit</button>
                    {z.assignedTo === 'Unassigned' && <button className="dd-btn dd-btn-primary" style={{ padding: '5px 10px', fontSize: '0.73rem' }}>Assign</button>}
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

export default AreaAllocation;
