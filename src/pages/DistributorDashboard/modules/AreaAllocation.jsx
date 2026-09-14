import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useSession } from '../../../hooks/useSession.js';
import { Map, Plus, Edit2, Trash2, CheckCircle, Users, Package } from 'lucide-react';

const API_BASE = `${API_BASE_URL}/distributors`;

const AreaAllocation = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const { user: authUser } = useAuth();
  const { user: sessionUser } = useSession();
  const distributor = authUser || sessionUser;
  const distributorId = distributor?.id || 1;

  const [newZone, setNewZone] = useState({ zone_name: '', region: '', status: 'Allocated' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dealers, setDealers] = useState([]);

  const fetchZones = async (targetId = distributorId) => {
    try {
      const res = await axios.get(`${API_BASE}/${targetId}/zones`);
      setZones(res.data);
    } catch (err) {
      console.error('Error fetching zones:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async (targetId = distributorId) => {
    try {
      const res = await axios.get(`${API_BASE}/${targetId}/dealers`);
      setDealers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching dealers:', err);
    }
  };

  const handleSaveZone = async () => {
    if (!newZone.zone_name.trim()) return alert('Zone name is required');
    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/zones/${editId}`, newZone);
      } else {
        await axios.post(`${API_BASE}/zones`, { ...newZone, distributor_id: distributorId });
      }
      fetchZones();
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setNewZone({ zone_name: '', region: '', status: 'Allocated' });
    } catch (err) {
      console.error('Error saving zone:', err);
      alert('Failed to save zone');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (z) => {
    setNewZone({ zone_name: z.zone_name, region: z.region || '', status: z.status || 'Allocated' });
    setEditId(z.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) return;
    try {
      await axios.delete(`${API_BASE}/zones/${id}`);
      fetchZones();
    } catch (err) {
      console.error('Error deleting zone:', err);
    }
  };

  const handleExportMap = () => {
    if (zones.length === 0) return alert('No zones to export');
    const headers = ['Zone', 'Region', 'Dealers Count', 'Status'];
    const rows = zones.map(z => [
      z.zone_name, 
      z.region || 'N/A', 
      dealers.filter(d => (d.zone || '').toLowerCase() === (z.zone_name || '').toLowerCase()).length, 
      z.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Area_Allocation_Map_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    if (distributorId) {
      fetchZones(distributorId);
      fetchDealers(distributorId);
    }
  }, [distributorId]);

  if (loading) return <div className="dd-loading">Loading Zones...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div className="dd-header-info">
          <h1 className="dd-module-title">Area Allocation</h1>
          <p className="dd-module-subtitle">Assign and manage distribution zones & territories</p>
        </div>
        <div className="dd-header-btns">
          <button className="dd-btn dd-btn-outline" onClick={handleExportMap}>Export Map</button>
          <button className="dd-btn dd-btn-primary" onClick={() => { setIsEditing(false); setNewZone({ zone_name: '', region: '', status: 'Allocated' }); setShowForm(true); }}><Plus size={15} /> Add Zone</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid">
        {[
          { label: 'Total Zones', value: zones.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Active Zones', value: zones.filter(z => z.status === 'Allocated').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Vacant Zones', value: zones.filter(z => z.status === 'Vacant').length, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Network Dealers', value: dealers.length, color: '#eff6ff', iconColor: '#2563eb' },
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
            <span className="dd-card-title">{isEditing ? 'Edit Zone' : 'Create New Zone'}</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => { setShowForm(false); setIsEditing(false); }}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Zone Name *</label><input placeholder="e.g. Zone Z, North Mumbai, Pune Central..." value={newZone.zone_name} onChange={e => setNewZone({...newZone, zone_name: e.target.value})} /></div>
              <div className="dd-field"><label>Region / State</label><input placeholder="e.g. Maharashtra, Gujarat, Delhi NCR..." value={newZone.region} onChange={e => setNewZone({...newZone, region: e.target.value})} /></div>
              <div className="dd-field"><label>Status</label>
                <select value={newZone.status} onChange={e => setNewZone({...newZone, status: e.target.value})}><option value="Allocated">Allocated</option><option value="Vacant">Vacant</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleSaveZone} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : isEditing ? 'Update Zone' : 'Save Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
        {zones.map(z => {
          const zoneDealersCount = dealers.filter(d => (d.zone || '').toLowerCase() === (z.zone_name || '').toLowerCase()).length;
          return (
            <div key={z.id} onClick={() => setSelected(selected === z.id ? null : z.id)}
              style={{
                background: '#fff', borderRadius: 16, border: `2px solid ${selected === z.id ? '#a855f7' : '#ede9f5'}`,
                padding: '18px 20px', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: selected === z.id ? '0 4px 18px rgba(168,85,247,0.14)' : 'none'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#ec4899,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>{z.zone_name?.[0]?.toUpperCase() || 'Z'}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e1b2e' }}>{z.zone_name}</p>
                      <p style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{z.region || 'Territory'}</p>
                    </div>
                  </div>
                </div>
                <span className={`dd-badge ${z.status === 'Allocated' ? 'dd-badge-green' : 'dd-badge-red'}`}>{z.status}</span>
              </div>
              <div className="dd-divider" style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Dealers in Zone: <strong style={{ color: '#7c3aed' }}>{zoneDealersCount} Dealers</strong></span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="dd-btn dd-btn-outline" style={{ padding: '4px 9px' }} onClick={e => { e.stopPropagation(); handleEditClick(z); }}><Edit2 size={12} /></button>
                  <button className="dd-btn dd-btn-danger" style={{ padding: '4px 9px' }} onClick={e => { e.stopPropagation(); handleDeleteZone(z.id); }}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table View */}
      <div className="dd-card">
        <div className="dd-card-header"><span className="dd-card-title">Zone Summary Table</span></div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead><tr><th>Zone Name</th><th>Region / State</th><th>Assigned Dealers</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {zones.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No zones created yet. Click "+ Add Zone" to create your first distribution zone.
                  </td>
                </tr>
              ) : (
                zones.map(z => {
                  const zoneDealersCount = dealers.filter(d => (d.zone || '').toLowerCase() === (z.zone_name || '').toLowerCase()).length;
                  return (
                    <tr key={z.id}>
                      <td style={{ fontWeight: 700, color: '#7c3aed' }}>{z.zone_name}</td>
                      <td>{z.region || '—'}</td>
                      <td style={{ fontWeight: 600, color: zoneDealersCount > 0 ? '#16a34a' : '#94a3b8' }}>{zoneDealersCount} Dealers</td>
                      <td><span className={`dd-badge ${z.status === 'Allocated' ? 'dd-badge-green' : 'dd-badge-red'}`}>{z.status}</span></td>
                      <td><div style={{ display: 'flex', gap: 6 }}>
                        <button className="dd-btn dd-btn-outline" style={{ padding: '5px 10px', fontSize: '0.73rem' }} onClick={() => handleEditClick(z)}>Edit</button>
                        <button className="dd-btn dd-btn-danger" style={{ padding: '5px 10px', fontSize: '0.73rem' }} onClick={() => handleDeleteZone(z.id)}>Delete</button>
                      </div></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AreaAllocation;
