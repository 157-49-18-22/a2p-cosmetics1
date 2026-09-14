import API_BASE_URL from '../../apiConfig.js';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';
import {
  Package, Clock, ChevronRight, Loader2, XCircle, AlertTriangle,
  LifeBuoy, Send, X, CheckCircle, Phone, ArrowRight
} from 'lucide-react';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Report Issue Modal State
  const [reportOrder, setReportOrder] = useState(null);
  const [reportCategory, setReportCategory] = useState('Shipping');
  const [reportPriority, setReportPriority] = useState('Medium');
  const [reportSubject, setReportSubject] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [reportPhone, setReportPhone] = useState(user?.phone || '');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, { credentials: 'include' });
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const openReportModal = (order) => {
    setReportOrder(order);
    setReportCategory('Shipping');
    setReportPriority('Medium');
    setReportSubject(`Issue with Order #${order.order_number}`);
    setReportMessage('');
    setReportPhone(user?.phone || '');
    setReportSuccess(null);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportMessage.trim()) {
      showToast('Please enter problem details', 'error');
      return;
    }

    try {
      setSubmittingReport(true);
      const payload = {
        subject: `[Order #${reportOrder.order_number}] ${reportSubject || 'Order Issue'}`,
        user_name: user?.name || reportOrder.customer_name || 'Customer',
        user_email: user?.email || reportOrder.customer_email || '',
        user_phone: reportPhone,
        category: reportCategory,
        priority: reportPriority,
        message: reportMessage,
        tags: `order,${reportOrder.order_number}`
      };

      const res = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setReportSuccess(data);
      showToast(`Support Ticket ${data.ticket_id} created successfully!`);
    } catch (err) {
      console.error('Report error:', err);
      showToast(err.message || 'Failed to report problem', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.message || 'Order cancelled successfully');
        // Refresh orders
        const ordersResponse = await fetch(`${API_BASE_URL}/orders/my-orders`, { credentials: 'include' });
        const data = await ordersResponse.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to cancel order', 'error');
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast('Error cancelling order. Please try again.', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (order) => {
    const cancellableStatuses = ['Pending', 'Processing', 'Confirmed', 'Placed'];
    return cancellableStatuses.includes(order.order_status);
  };

  if (loading) {
    return (
      <div className="profile-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#d4a373" />
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="profile-header header-with-action" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Orders</h1>
          <p>Track, manage and report issues on your previous orders.</p>
        </div>
        <Link
          to="/help-support"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe',
            padding: '10px 18px', borderRadius: '12px', fontWeight: 700,
            textDecoration: 'none', fontSize: '0.88rem'
          }}
        >
          <LifeBuoy size={18} /> Support Center & Tickets
        </Link>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-orders" style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '20px' }}>
            <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div className="order-main-info">
                  <div className="order-icon-bg">
                    <Package size={24} />
                  </div>
                  <div className="order-details">
                    <h3>Order #{order.order_number}</h3>
                    <span className="order-date"><Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="order-meta" style={{ gap: '1rem' }}>
                  <div className="order-status-badge" data-status={order.order_status?.toLowerCase()}>
                    {order.order_status}
                  </div>
                  <div className="order-total">
                    <span>{order.payment_status}</span>
                    <strong>Rs. {order.total_amount}</strong>
                  </div>
                </div>
              </div>

              {/* Order Actions Toolbar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px'
              }}>
                {/* Report Problem Button */}
                <button
                  type="button"
                  onClick={() => openReportModal(order)}
                  style={{
                    padding: '8px 14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1.5px solid #dbeafe',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                >
                  <LifeBuoy size={15} /> Report Issue / Need Help
                </button>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {canCancelOrder(order) && (
                    <button 
                      className="cancel-order-btn"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      style={{
                        padding: '8px 14px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.82rem',
                        fontWeight: '600'
                      }}
                    >
                      {cancellingOrderId === order.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ════════ REPORT ISSUE MODAL ════════ */}
      {reportOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', maxWidth: '560px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0', animation: 'fadeIn 0.25s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Report Issue on Order
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Order #{reportOrder.order_number} · ₹{reportOrder.total_amount}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReportOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {reportSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: '#dcfce7', color: '#16a34a', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                  }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    Problem Reported Successfully!
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
                    Your ticket has been sent to our Admin Support Desk:
                  </p>
                  <div style={{
                    display: 'inline-block', background: '#f0fdf4', border: '1.5px dashed #86efac',
                    padding: '8px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '1.1rem',
                    color: '#15803d', marginBottom: '24px'
                  }}>
                    Ticket ID: #{reportSuccess.ticket_id}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => { setReportOrder(null); navigate('/help-support?tab=history'); }}
                      style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
                    >
                      Track Support Ticket <ArrowRight size={16}/>
                    </button>
                    <button
                      onClick={() => setReportOrder(null)}
                      style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport}>
                  {/* Category Selection */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Problem Type / Category *
                    </label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#fff'
                      }}
                    >
                      <option value="Shipping">🚚 Delivery Delayed / Tracking Not Updating</option>
                      <option value="Product">📦 Damaged / Wrong Product Received</option>
                      <option value="Billing">💳 Payment / Refund Issue</option>
                      <option value="General">❌ Cancellation / Other Inquiry</option>
                    </select>
                  </div>

                  {/* Problem Description */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Describe the Issue *
                    </label>
                    <textarea
                      rows={4}
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
                      placeholder="Please explain what went wrong with your order..."
                      required
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                        border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none',
                        boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Contact Phone */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={reportPhone}
                      onChange={(e) => setReportPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                        border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none',
                        boxSizing: 'border-box', fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setReportOrder(null)}
                      style={{
                        padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1',
                        background: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReport}
                      style={{
                        padding: '10px 22px', borderRadius: '10px', border: 'none',
                        background: '#2563eb', color: '#fff', fontSize: '0.88rem',
                        fontWeight: 700, cursor: submittingReport ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <Send size={15} />
                      {submittingReport ? 'Submitting...' : 'Submit Report to Support'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

