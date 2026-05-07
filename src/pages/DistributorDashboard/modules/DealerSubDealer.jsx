import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, CheckCircle, Clock, Star } from 'lucide-react';

const API_BASE = `${API_BASE_URL}/distributors`;

const DealerSubDealer = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('table'); // 'table' | 'cards'
  const distributorId = 1;

  const [newDealer, setNewDealer] = useState({ name: '', type: 'Dealer', zone: 'Zone A', phone: '', email: '', status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDealers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${distributorId}/dealers`);
      setDealers(res.data);
    } catch (err) {
      console.error('Error fetching dealers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDealer = async () => {
    if (!newDealer.name) return alert('Name is required');
    setSaving(true);
    try {
      if (isEditing) {
        // In a real app: await axios.put(`${API_BASE}/dealers/${editId}`, newDealer);
        setDealers(prev => prev.map(d => d.id === editId ? { ...d, ...newDealer } : d));
      } else {
        await axios.post(`${API_BASE}/dealers`, { ...newDealer, distributor_id: distributorId });
        fetchDealers();
      }
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setNewDealer({ name: '', type: 'Dealer', zone: 'Zone A', phone: '', email: '', status: 'Active' });
    } catch (err) {
      console.error('Error saving dealer:', err);
      // Fallback for UI
      if (!isEditing) setDealers(prev => [...prev, { id: Date.now(), ...newDealer }]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (d) => {
    setNewDealer({ name: d.name, type: d.type, zone: d.zone, phone: d.phone, email: d.email, status: d.status });
    setEditId(d.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleExportDealers = () => {
    if (dealers.length === 0) return alert('No network data to export');
    const headers = ['ID', 'Business Name', 'Type', 'Zone', 'Phone', 'Email', 'Status'];
    const rows = dealers.map(d => [d.id, d.name, d.type, d.zone, d.phone, d.email, d.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `A2P_Dealer_Network_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      await axios.delete(`${API_BASE}/dealers/${id}`);
      fetchDealers();
    } catch (err) {
      console.error('Error deleting dealer:', err);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const filtered = dealers.filter(d =>
    (filterType === 'All' || d.type === filterType) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.zone && d.zone.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) return <div className="dd-loading">Loading Network...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Dealer / Sub-Dealer</h1>
          <p className="dd-module-subtitle">Manage your entire dealer network and sub-dealer relationships</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline" onClick={handleExportDealers}>Export Network</button>
          <button className="dd-btn dd-btn-outline" onClick={() => setView(view === 'table' ? 'cards' : 'table')}>
            {view === 'table' ? '⊞ Card View' : '≡ Table View'}
          </button>
          <button className="dd-btn dd-btn-primary" onClick={() => { setIsEditing(false); setNewDealer({ name: '', type: 'Dealer', zone: 'Zone A', phone: '', email: '', status: 'Active' }); setShowForm(true); }}><Plus size={15} /> Add Dealer</button>
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

      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">{isEditing ? 'Edit Dealer Details' : 'Add New Dealer'}</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => { setShowForm(false); setIsEditing(false); }}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Business Name</label><input placeholder="e.g. Sharma Traders" value={newDealer.name} onChange={e => setNewDealer({ ...newDealer, name: e.target.value })} /></div>
              <div className="dd-field"><label>Type</label>
                <select value={newDealer.type} onChange={e => setNewDealer({ ...newDealer, type: e.target.value })}><option>Dealer</option><option>Sub-Dealer</option></select>
              </div>
              <div className="dd-field"><label>Zone</label>
                <select value={newDealer.zone} onChange={e => setNewDealer({ ...newDealer, zone: e.target.value })}><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option></select>
              </div>
              <div className="dd-field"><label>Phone</label><input placeholder="9876543210" value={newDealer.phone} onChange={e => setNewDealer({ ...newDealer, phone: e.target.value })} /></div>
              <div className="dd-field"><label>Email</label><input placeholder="dealer@example.com" value={newDealer.email} onChange={e => setNewDealer({ ...newDealer, email: e.target.value })} /></div>
              <div className="dd-field"><label>Status</label>
                <select value={newDealer.status} onChange={e => setNewDealer({ ...newDealer, status: e.target.value })}><option>Active</option><option>Inactive</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleSaveDealer} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : isEditing ? 'Update Details' : 'Save Dealer'}
              </button>
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
                      <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>#{d.id}</p>
                    </div>
                  </div>
                  <span className={`dd-badge ${d.type === 'Dealer' ? 'dd-badge-purple' : 'dd-badge-blue'}`}>{d.type}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} color="#ec4899" /> {d.zone || 'N/A'}</p>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} color="#a855f7" /> {d.phone || 'N/A'}</p>
                  <p style={{ fontSize: '0.77rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} color="#2563eb" /> {d.email || 'N/A'}</p>
                </div>
                <div className="dd-divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>₹0 <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.72rem' }}>/ month</span></span>
                  <span className={`dd-badge ${d.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dd-table-wrap">
            <table className="dd-table">
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Zone</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{ color: '#7c3aed', fontWeight: 600 }}>#{d.id}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className={`dd-badge ${d.type === 'Dealer' ? 'dd-badge-purple' : 'dd-badge-blue'}`}>{d.type}</span></td>
                    <td>{d.zone || 'N/A'}</td>
                    <td>{d.phone || 'N/A'}</td>
                    <td><span className={`dd-badge ${d.status === 'Active' ? 'dd-badge-green' : 'dd-badge-red'}`}>{d.status}</span></td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }} onClick={() => handleEditClick(d)}><Edit2 size={12} /></button>
                      <button className="dd-btn dd-btn-danger" style={{ padding: '5px 9px' }} onClick={() => handleDelete(d.id)}><Trash2 size={12} /></button>
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


