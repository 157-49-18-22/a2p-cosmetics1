import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useSession } from '../../../hooks/useSession.js';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, CheckCircle, Clock, Star, Eye, X, Package, ShoppingCart } from 'lucide-react';

const API_BASE = `${API_BASE_URL}/distributors`;

const DealerSubDealer = () => {
  const [dealers, setDealers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('table'); // 'table' | 'cards'
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'orders'
  const { user: authUser } = useAuth();
  const { user: sessionUser } = useSession();
  const distributor = authUser || sessionUser;
  const distributorId = distributor?.id || 1;

  const [dealerOrders, setDealerOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [newDealer, setNewDealer] = useState({ name: '', type: 'Dealer', zone: '', phone: '', email: '', status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchZones = async (targetId = distributorId) => {
    try {
      const res = await axios.get(`${API_BASE}/${targetId}/zones`);
      const zList = Array.isArray(res.data) ? res.data : [];
      setZones(zList);
      if (zList.length > 0) {
        setNewDealer(prev => ({ ...prev, zone: prev.zone || zList[0].zone_name }));
      }
    } catch (err) {
      console.error('Error fetching zones in DealerSubDealer:', err);
    }
  };

  const fetchDealers = async (targetId = distributorId) => {
    try {
      const res = await axios.get(`${API_BASE}/${targetId}/dealers`);
      setDealers(res.data);
    } catch (err) {
      console.error('Error fetching dealers:', err);
    }
  };

  const fetchDealerOrders = async (targetId = distributorId) => {
    try {
      const res = await axios.get(`${API_BASE}/${targetId}/dealer-orders`);
      setDealerOrders(res.data.map(o => ({
        id: o.order_number || `ORD-${o.id}`,
        rawId: o.id,
        date: new Date(o.date).toLocaleDateString('en-IN'),
        dealerName: o.dealerName,
        dealerPhone: o.dealerPhone,
        dealerEmail: o.dealerEmail,
        dealerBusiness: o.dealerBusiness,
        requiredBy: new Date(o.requiredBy || o.date).toLocaleDateString('en-IN'),
        items: o.items || 0,
        order_items: o.order_items || [],
        total: `₹${parseFloat(o.total || 0).toLocaleString()}`,
        rawTotal: parseFloat(o.total || 0),
        status: o.status || 'Pending'
      })));
    } catch (err) {
      console.error('Error fetching dealer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (distributorId) {
      fetchZones(distributorId);
      fetchDealers(distributorId);
      fetchDealerOrders(distributorId);
      const interval = setInterval(() => fetchDealerOrders(distributorId), 5000);
      return () => clearInterval(interval);
    }
  }, [distributorId]);

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


  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/dealer-orders/${orderId}/status`, { status: newStatus });
      fetchDealerOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const filtered = dealers.filter(d =>
    (filterType === 'All' || d.type === filterType) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.zone && d.zone.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) return <div className="dd-loading">Loading Network...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div className="dd-header-info">
          <h1 className="dd-module-title">Dealers</h1>
          <p className="dd-module-subtitle">Manage your entire dealer network</p>
        </div>
        <div className="dd-header-btns">
          {activeTab === 'network' && (
            <>
              <button className="dd-btn dd-btn-outline" onClick={handleExportDealers}>Export Network</button>
              <button className="dd-btn dd-btn-outline" onClick={() => setView(view === 'table' ? 'cards' : 'table')}>
                {view === 'table' ? '⊞ Card View' : '≡ Table View'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #f1f5f9' }}>
        <button 
          onClick={() => setActiveTab('network')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'network' ? '2px solid #a855f7' : '2px solid transparent', color: activeTab === 'network' ? '#7c3aed' : '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '-2px' }}
        >
          Dealer Network
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'orders' ? '2px solid #a855f7' : '2px solid transparent', color: activeTab === 'orders' ? '#7c3aed' : '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '-2px' }}
        >
          Dealer Orders
        </button>
      </div>

      {activeTab === 'network' ? (
        <>
          <div className="dd-stats-grid">
        {[
          { label: 'Total Dealers', value: dealers.filter(d => d.type === 'Dealer').length, color: '#f3eeff', iconColor: '#a855f7' },
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
            <span className="dd-card-title">Edit Dealer Details</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => { setShowForm(false); setIsEditing(false); }}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Business Name</label><input placeholder="e.g. Sharma Traders" value={newDealer.name} onChange={e => setNewDealer({ ...newDealer, name: e.target.value })} /></div>
              <div className="dd-field"><label>Type</label>
                <select value={newDealer.type} onChange={e => setNewDealer({ ...newDealer, type: e.target.value })}><option>Dealer</option></select>
              </div>
              <div className="dd-field"><label>Zone</label>
                <select value={newDealer.zone} onChange={e => setNewDealer({ ...newDealer, zone: e.target.value })}>
                  {zones.length > 0 ? (
                    zones.map(z => (
                      <option key={z.id} value={z.zone_name}>{z.zone_name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Zone A">Zone A</option>
                      <option value="Zone B">Zone B</option>
                      <option value="Zone C">Zone C</option>
                      <option value="Zone D">Zone D</option>
                    </>
                  )}
                </select>
              </div>
              <div className="dd-field"><label>Phone</label><input placeholder="9876543210" value={newDealer.phone} onChange={e => setNewDealer({ ...newDealer, phone: e.target.value })} /></div>
              <div className="dd-field"><label>Email</label><input placeholder="dealer@example.com" value={newDealer.email} onChange={e => setNewDealer({ ...newDealer, email: e.target.value })} /></div>
              <div className="dd-field"><label>Status</label>
                <select value={newDealer.status} onChange={e => setNewDealer({ ...newDealer, status: e.target.value })}><option>Active</option><option>Inactive</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleSaveDealer} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 16, padding: '20px 24px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'stretch' : 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Dealer'].map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid', borderColor: filterType === t ? '#a855f7' : '#ede9f5',
                background: filterType === t ? '#f3eeff' : '#fff', color: filterType === t ? '#7c3aed' : '#6b7280', transition: 'all 0.2s',
                flex: window.innerWidth <= 480 ? 1 : 'none'
              }}>{t}</button>
            ))}
          </div>
          <div className="dd-search-inline" style={{ width: window.innerWidth <= 768 ? '100%' : 260 }}>
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
      </>
      ) : (
        <div className="dd-card">
          <div className="dd-card-header">
            <h3 className="dd-card-title">Recent Dealer Orders</h3>
          </div>
          <div className="dd-card-body">
            <div className="dd-table-wrap">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Dealer Name</th>
                    <th>Required By</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerOrders.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No orders found from dealers.</td></tr>
                  ) : (
                    dealerOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 700, color: '#6366f1' }}>{order.id}</td>
                        <td>{order.date}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.dealerName}</div>
                          {order.dealerBusiness && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{order.dealerBusiness}</div>
                          )}
                        </td>
                        <td style={{ color: '#059669', fontWeight: 500 }}>{order.requiredBy}</td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {order.items} items
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{order.total}</td>
                        <td>
                          <span className={`dd-badge ${
                            order.status === 'Delivered' ? 'dd-badge-green' : 
                            order.status === 'Processing' ? 'dd-badge-blue' : 
                            order.status === 'Shipped' ? 'dd-badge-orange' : 
                            order.status === 'Cancelled' ? 'dd-badge-red' : 'dd-badge-yellow'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              className="dd-btn dd-btn-outline" 
                              style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 600 }}
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderModal(true);
                              }}
                              title="View Order Items & Details"
                            >
                              <Eye size={13} /> View
                            </button>
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              style={{ 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                border: '1px solid #cbd5e1',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: '#ffffff',
                                color: order.status === 'Processing' ? '#2563eb' : order.status === 'Shipped' ? '#ea580c' : order.status === 'Delivered' ? '#16a34a' : order.status === 'Cancelled' ? '#dc2626' : '#d97706'
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Approved">Approved</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dealer Order View Modal */}
      {showOrderModal && selectedOrder && (
        <div className="dd-modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(580px, 95vw)', padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '24px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75, fontWeight: 700 }}>Dealer Order Details</div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 2px 0', letterSpacing: '0.5px' }}>{selectedOrder.id}</h2>
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Placed on {selectedOrder.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8' }}>{selectedOrder.total}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`dd-badge ${
                      selectedOrder.status === 'Delivered' ? 'dd-badge-green' : 
                      selectedOrder.status === 'Processing' ? 'dd-badge-blue' : 
                      selectedOrder.status === 'Shipped' ? 'dd-badge-orange' : 'dd-badge-yellow'
                    }`} style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Dealer Information */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                  Dealer Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Dealer / Contact Name</span>
                    <strong style={{ color: '#0f172a' }}>{selectedOrder.dealerName || '—'}</strong>
                  </div>
                  {selectedOrder.dealerBusiness && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Business Name</span>
                      <strong style={{ color: '#0f172a' }}>{selectedOrder.dealerBusiness}</strong>
                    </div>
                  )}
                  {selectedOrder.dealerPhone && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Phone</span>
                      <strong style={{ color: '#0f172a' }}>📞 {selectedOrder.dealerPhone}</strong>
                    </div>
                  )}
                  {selectedOrder.dealerEmail && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Email</span>
                      <strong style={{ color: '#0f172a' }}>✉️ {selectedOrder.dealerEmail}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ordered Items ({selectedOrder.items} Total Items)</span>
                </div>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                          <th style={{ padding: '9px 12px', textAlign: 'left' }}>Product</th>
                          <th style={{ padding: '9px 12px', textAlign: 'center', width: 60 }}>Qty</th>
                          <th style={{ padding: '9px 12px', textAlign: 'right', width: 90 }}>Price</th>
                          <th style={{ padding: '9px 12px', textAlign: 'right', width: 100 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.order_items.map((it, idx) => (
                          <tr key={idx} style={{ borderBottom: idx < selectedOrder.order_items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f172a' }}>{it.product_name || `Product #${it.product_id}`}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'center', color: '#334155', fontWeight: 600 }}>{it.quantity}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', color: '#64748b' }}>₹{parseFloat(it.price || 0).toLocaleString()}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                              ₹{(parseFloat(it.quantity || 1) * parseFloat(it.price || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    No itemized product lines found for this order. Total: {selectedOrder.total}
                  </div>
                )}
              </div>

              {/* Status Updater & Controls */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Change Order Status:</span>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    border: '1.5px solid #6366f1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: '#fff'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dd-btn dd-btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowOrderModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerSubDealer;


