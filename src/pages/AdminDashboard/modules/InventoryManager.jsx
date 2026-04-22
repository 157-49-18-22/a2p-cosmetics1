import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Boxes, Package, RefreshCw, Truck, Edit2, Save, X } from 'lucide-react';

const API = 'http://localhost:5000/api';

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/inventory`);
      const data = await res.json();
      setProducts(data.products || []);
      setLogs(data.logs || []);
    } catch (e) {
      showToast('Failed to load inventory', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (p) => { setEditingId(p.id); setEditStock(p.stock); };
  const cancelEdit = () => { setEditingId(null); setEditStock(''); };

  const saveStock = async (product) => {
    const newQty = parseInt(editStock);
    if (isNaN(newQty) || newQty < 0) return showToast('Enter a valid quantity', 'danger');
    setSaving(true);
    try {
      const change = newQty - product.stock;
      await fetch(`${API}/inventory/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newQty, change_type: 'Manual Adjustment', quantity_change: change, agent: 'Admin' })
      });
      showToast(`Stock updated for ${product.name}`);
      setEditingId(null);
      fetchInventory();
    } catch (e) {
      showToast('Update failed', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const totalQty = products.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 50).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const stockSummary = [
    { label: 'Total Qty', value: totalQty.toLocaleString(), icon: Boxes, color: '#3b82f6' },
    { label: 'Total Products', value: products.length, icon: Package, color: '#8b5cf6' },
    { label: 'Low Stock', value: `${lowStock} Items`, icon: AlertCircle, color: '#f59e0b' },
    { label: 'Out of Stock', value: `${outOfStock} Items`, icon: Truck, color: '#f43f5e' },
  ];

  return (
    <div className="adm-fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Master Inventory Control</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time warehouse synchronization and stock adjustment.</p>
        </div>
        <button className="adm-btn adm-btn-outline" onClick={fetchInventory}><RefreshCw size={18} /> Refresh</button>
      </div>

      {/* Stats */}
      <div className="adm-stats-grid">
        {stockSummary.map((s, i) => (
          <div key={i} className="adm-stat-box">
            <div className="adm-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="adm-stat-details">
              <span>{s.label}</span>
              <h3 style={{ fontSize: '1.2rem' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Stock Levels Table */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Live Stock Levels</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click edit to update stock</span>
          </div>
          <div className="adm-table-wrap">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading inventory...</div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p>No products yet. Add products first.</p>
              </div>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.name}</td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{p.category || '—'}</td>
                      <td>
                        {editingId === p.id ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={e => setEditStock(e.target.value)}
                            style={{ width: '80px', padding: '4px 8px', border: '2px solid #3b82f6', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}
                            autoFocus
                          />
                        ) : (
                          <span style={{ fontWeight: 800, color: p.stock === 0 ? '#f43f5e' : p.stock < 50 ? '#f59e0b' : '#10b981' }}>{p.stock}</span>
                        )}
                      </td>
                      <td>
                        <span className={`adm-badge adm-badge-${p.status === 'Active' ? 'success' : p.status === 'Out of Stock' ? 'danger' : 'warning'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {editingId === p.id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="adm-icon-btn" style={{ color: '#10b981' }} onClick={() => saveStock(p)} disabled={saving}><Save size={14} /></button>
                            <button className="adm-icon-btn" style={{ color: '#f43f5e' }} onClick={cancelEdit}><X size={14} /></button>
                          </div>
                        ) : (
                          <button className="adm-icon-btn" onClick={() => startEdit(p)}><Edit2 size={14} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Inventory Logs */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Inventory Logs</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '0', maxHeight: '440px', overflow: 'auto' }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.85rem' }}>No logs yet.</div>
            ) : logs.map((log, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: i < logs.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: log.quantity_change >= 0 ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {log.quantity_change >= 0 ? <ArrowUp size={16} color="#15803d" /> : <ArrowDown size={16} color="#b91c1c" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.product_name}</span>
                    <span style={{ fontWeight: 800, color: log.quantity_change >= 0 ? '#16a34a' : '#e11d48', fontSize: '0.82rem', flexShrink: 0, marginLeft: 8 }}>{log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    <span>{log.change_type} • {log.agent}</span>
                    <span>{new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
