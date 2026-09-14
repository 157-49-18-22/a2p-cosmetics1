import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import {
  Search, Filter, ShoppingBag, Eye, Trash2, ChevronRight,
  Package, Truck, CheckCircle, XCircle, RefreshCcw, X,
  MapPin, Phone, Mail, User, DollarSign, Calendar, Tag
} from 'lucide-react';

const API = API_BASE_URL;

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders/all`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch orders', e);
      showToast('Failed to load orders', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`${API}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      showToast(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }
    } catch (e) {
      showToast(e.message || 'Failed to update order status', 'danger');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return { bg: '#fef9c3', text: '#a16207', border: '#fef08a' };
      case 'Shipped': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'Delivered': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const filtered = orders.filter(o => {
    const term = search.toLowerCase();
    const orderNo = (o.order_number || '').toLowerCase();
    const custName = (o.customer_name || '').toLowerCase();
    const custEmail = (o.customer_email || '').toLowerCase();
    const hasItemMatch = (o.items || []).some(item =>
      (item.product_name || '').toLowerCase().includes(term)
    );
    return orderNo.includes(term) || custName.includes(term) || custEmail.includes(term) || hasItemMatch;
  });

  return (
    <div className="adm-fade-in" style={{ padding: '4px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          background: toast.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#fff', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Orders Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Track sold items, inspect product images & details, and fulfill customer orders in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchOrders} style={{ background: '#fff', flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => window.print()} style={{ background: '#3b82f6', flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }}>
            <ShoppingBag size={18} /> Export / Print
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
            <div className="adm-search" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', minWidth: '320px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                placeholder="Search by Order ID, Customer, or Product Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <span className="adm-count-badge">{filtered.length} orders</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ paddingLeft: '20px' }}>Order ID</th>
                <th>Customer</th>
                <th style={{ minWidth: '240px' }}>Items Sold (Image & Name)</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ paddingRight: '20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No orders found matching your search.</td></tr>
              ) : filtered.map((o, i) => {
                const status = getStatusColor(o.order_status);
                const items = o.items || [];
                return (
                  <tr key={i}>
                    {/* Order ID */}
                    <td style={{ paddingLeft: '20px' }}>
                      <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.88rem' }}>
                        #{o.order_number?.split('-')[1] || o.order_number}
                      </span>
                    </td>

                    {/* Customer */}
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{o.customer_name}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>{o.customer_email}</p>
                      </div>
                    </td>

                    {/* Items Sold with Picture & Name */}
                    <td>
                      {items.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: '#eff6ff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#3b82f6', flexShrink: 0
                          }}>
                            <Package size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Standard Order</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Qty: 1 • ₹{parseFloat(o.total_amount).toLocaleString()}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: '#f8fafc', padding: '6px 10px',
                                borderRadius: '8px', border: '1px solid #e2e8f0'
                              }}
                            >
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '6px',
                                background: '#e2e8f0', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#64748b', flexShrink: 0,
                                overflow: 'hidden', border: '1px solid #cbd5e1'
                              }}>
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.parentElement.innerHTML = '<span style="font-size:11px;font-weight:800;color:#64748b">A2P</span>';
                                    }}
                                  />
                                ) : (
                                  <Package size={18} color="#94a3b8" />
                                )}
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                  fontWeight: 700, fontSize: '0.82rem', color: '#0f172a',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                  maxWidth: '200px'
                                }}>
                                  {item.product_name || 'Product'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>
                                    Qty: {item.quantity || 1}
                                  </span>
                                  <span>•</span>
                                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                    ₹{parseFloat(item.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      ₹{parseFloat(o.total_amount).toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800,
                        color: o.payment_status === 'Paid' ? '#10b981' : '#f59e0b',
                        background: o.payment_status === 'Paid' ? '#ecfdf5' : '#fffbeb',
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        {o.payment_status}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: status.bg,
                        color: status.text,
                        border: `1px solid ${status.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {o.order_status}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td style={{ paddingRight: '20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="adm-icon-btn"
                          style={{ background: '#eff6ff', color: '#3b82f6', border: 'none' }}
                          title="View Order Details"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/*  ORDER FULL DETAILS & INVOICE MODAL         */}
      {/* ═══════════════════════════════════════════ */}
      {selectedOrder && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '750px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                    Order #{selectedOrder.order_number}
                  </h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px',
                    background: getStatusColor(selectedOrder.order_status).bg,
                    color: getStatusColor(selectedOrder.order_status).text,
                    textTransform: 'uppercase'
                  }}>
                    {selectedOrder.order_status}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0' }}>
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              <button className="adm-icon-btn" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Status Update Action Bar */}
              <div style={{
                background: '#f8fafc', padding: '14px 18px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Update Fulfillment Status:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus || selectedOrder.order_status === st}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800,
                        border: selectedOrder.order_status === st ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedOrder.order_status === st ? '#eff6ff' : '#fff',
                        color: selectedOrder.order_status === st ? '#1d4ed8' : '#475569',
                        cursor: selectedOrder.order_status === st ? 'default' : 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Purchased Box */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Purchased Products & Quantities
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedOrder.items && selectedOrder.items.length > 0) ? (
                    selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', background: '#ffffff', borderRadius: '12px',
                          border: '1.5px solid #e2e8f0'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: '54px', height: '54px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={24} color="#94a3b8" />
                            </div>
                          )}
                          <div>
                            <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                              {item.product_name}
                            </h5>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Unit Price: ₹{parseFloat(item.price || 0).toLocaleString()} × {item.quantity || 1} pcs
                            </span>
                          </div>
                        </div>

                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                          ₹{(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
                      Standard package order: ₹{parseFloat(selectedOrder.total_amount).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#3b82f6" /> Customer Information
                  </h5>
                  <div style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 700 }}>
                    {selectedOrder.customer_name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} /> {selectedOrder.customer_email || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} /> {selectedOrder.customer_phone || 'N/A'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#10b981" /> Shipping Address
                  </h5>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                    {selectedOrder.address || 'No address provided'}
                    <br />
                    {[selectedOrder.city, selectedOrder.state, selectedOrder.zip_code].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>

              {/* Billing Calculation Summary */}
              <div style={{
                background: '#faf5ff', padding: '16px 20px', borderRadius: '12px',
                border: '1px solid #f3e8ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#6b21a8' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 700 }}>₹{parseFloat(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString()}</span>
                </div>
                {parseFloat(selectedOrder.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Discount applied</span>
                    <span style={{ fontWeight: 700 }}>-₹{parseFloat(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', paddingTop: '10px',
                  borderTop: '1px solid #e9d5ff', fontSize: '1.1rem', fontWeight: 800, color: '#581c87'
                }}>
                  <span>Total Amount Paid</span>
                  <span>₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px', borderTop: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'flex-end', background: '#fafafa'
            }}>
              <button
                className="adm-btn adm-btn-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Close Order View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;


