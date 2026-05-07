import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, Plus, Search, Trash2, CheckCircle, Clock, AlertCircle, RefreshCcw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const StockRequest = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const distributor = JSON.parse(localStorage.getItem('active_distributor') || '{}');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory`);
      setProducts(res.data.products || []);
    } catch (err) { console.error(err); }
  };

  const fetchRequests = async () => {
    if (!distributor.id) return;
    try {
      const res = await axios.get(`${API_BASE}/distributors/${distributor.id}/stock-requests`);
      setRequests(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchRequests();
    setLoading(false);
  }, []);

  const addToCart = (p) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...p, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, q) => {
    if (q <= 0) return setCart(cart.filter(item => item.id !== id));
    setCart(cart.map(item => item.id === id ? { ...item, quantity: q } : item));
  };

  const handleSubmitRequest = async () => {
    if (cart.length === 0) return alert('Add items to request stock');
    setSubmitting(true);
    const total_amount = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    try {
      await axios.post(`${API_BASE}/distributors/stock-requests`, {
        distributor_id: distributor.id,
        items: cart,
        total_amount
      });
      alert('Stock request sent to Admin successfully!');
      setCart([]);
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Approved': return '#10b981';
      case 'Shipped': return '#3b82f6';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) return <div className="dd-loading">Loading Stock Request...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Stock Indenting</h1>
          <p className="dd-module-subtitle">Request new stock directly from A2P Admin.</p>
        </div>
        <button className="dd-btn dd-btn-outline" onClick={() => { fetchProducts(); fetchRequests(); }}><RefreshCcw size={16} /> Refresh</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
        {/* Product Catalog */}
        <div className="dd-card" style={{ padding: 24, borderRadius: 24 }}>
          <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
            <div className="dd-search-inline" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <Search size={14} color="#94a3b8" />
              <input placeholder="Search main inventory..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} style={{ padding: 16, border: '1.5px solid #f1f5f9', borderRadius: 16, background: '#fff', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#f1f5f9', borderRadius: 12, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Package size={24} color="#64748b" />
                </div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 4px', color: '#1e293b' }}>{p.name}</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 12px' }}>₹{p.price}</p>
                <button className="dd-btn dd-btn-primary" style={{ width: '100%', fontSize: '0.75rem', padding: '8px', borderRadius: 10 }} onClick={() => addToCart(p)}>
                  <Plus size={14} /> Add to List
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Request List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="dd-card" style={{ padding: 24, borderRadius: 24, background: '#fff', border: '2px solid #a855f720' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3eeff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>Stock Request List</h3>
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 20 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <ShoppingCart size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <p style={{ fontSize: '0.8rem' }}>No items added yet</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem' }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>₹{item.price} x {item.quantity}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value))} style={{ width: 45, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700 }} />
                      <button onClick={() => updateQuantity(item.id, 0)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div style={{ borderTop: '2px dashed #f1f5f9', padding: '16px 0', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Total Value:</span>
                    <span style={{ color: '#a855f7' }}>₹{cart.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()}</span>
                  </div>
                </div>
                <button className="dd-btn dd-btn-primary" style={{ width: '100%', height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }} onClick={handleSubmitRequest} disabled={submitting}>
                  {submitting ? 'Sending Request...' : 'Submit Request to Admin'}
                </button>
              </>
            )}
          </div>

          {/* Past Requests */}
          <div className="dd-card" style={{ padding: 20, borderRadius: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 16 }}>Recent Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.slice(0, 3).map((r, i) => (
                <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.75rem', color: '#1e293b' }}>{r.request_number}</p>
                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: getStatusColor(r.status) }}>{r.status}</span>
                </div>
              ))}
              {requests.length === 0 && <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>No past requests</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequest;
