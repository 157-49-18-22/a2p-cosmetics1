import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Eye, Trash2, ChevronRight, Package, Truck, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

const API = API_BASE_URL;

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders/all`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return { bg: '#fef9c3', text: '#a16207' };
      case 'Shipped': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'Delivered': return { bg: '#dcfce7', text: '#15803d' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const filtered = orders.filter(o => 
    o.order_number?.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="adm-fade-in" style={{ padding: '4px' }}>
      {/* Header Section */}
      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Orders Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>Track, manage and fulfill customer orders in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchOrders} style={{ background: '#fff', flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="adm-btn adm-btn-primary" style={{ background: '#3b82f6', flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }}>
            <ShoppingBag size={18} /> Export
          </button>
        </div>
      </div>

      {/* Orders Stats (Mini) */}
      <div className="adm-stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Pending', count: orders.filter(o => o.order_status === 'Processing').length, color: '#f59e0b', icon: Package },
          { label: 'In Transit', count: orders.filter(o => o.order_status === 'Shipped').length, color: '#3b82f6', icon: Truck },
          { label: 'Completed', count: orders.filter(o => o.order_status === 'Delivered').length, color: '#10b981', icon: CheckCircle },
          { label: 'Cancelled', count: orders.filter(o => o.order_status === 'Cancelled').length, color: '#f43f5e', icon: XCircle },
        ].map((s, i) => (
          <div key={i} className="adm-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</p>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{s.count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table Card */}
      <div className="adm-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="adm-card-header adm-card-header-flex">
          <div className="adm-search-container">
            <div className="adm-search" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Search size={16} color="#94a3b8" />
              <input placeholder="Search by Order ID or Customer..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <button className="adm-btn adm-btn-outline" style={{ border: '1px solid #e2e8f0' }}><Filter size={16} /> Filters</button>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ paddingLeft: '24px' }}>Order ID</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ paddingRight: '24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No orders found matching your search.</td></tr>
              ) : filtered.map((o, i) => {
                const status = getStatusColor(o.order_status);
                return (
                  <tr key={i}>
                    <td style={{ paddingLeft: '24px' }}>
                      <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.88rem' }}>#{o.order_number.split('-')[1] || o.order_number}</span>
                    </td>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{o.customer_name}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>{o.customer_email}</p>
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{parseFloat(o.total_amount).toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: o.payment_status === 'Paid' ? '#10b981' : '#f59e0b' }}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        background: status.bg,
                        color: status.text,
                        textTransform: 'uppercase'
                      }}>
                        {o.order_status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ paddingRight: '24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="adm-icon-btn" style={{ background: '#eff6ff', color: '#3b82f6', border: 'none' }} title="View Details"><Eye size={16} /></button>
                        <button className="adm-icon-btn" style={{ background: '#fff1f2', color: '#f43f5e', border: 'none' }} title="Cancel Order"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
