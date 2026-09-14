import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../../apiConfig.js';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy, Send, Clock, CheckCircle, AlertCircle, MessageSquare,
  Package, ChevronDown, ChevronUp, RefreshCcw, Shield, Check,
  AlertTriangle, Phone, Mail, User, HelpCircle, ArrowRight,
  Headphones, Sparkles, Truck, CreditCard, RotateCcw
} from 'lucide-react';
import './Profile.css';

const ISSUE_CATEGORIES = [
  { id: 'Shipping', icon: Truck, label: 'Delivery & Tracking Delay', desc: 'Order not arrived, delayed or invalid tracking status' },
  { id: 'Product', icon: Package, label: 'Damaged / Wrong Item Received', desc: 'Broken packaging, incorrect product or missing contents' },
  { id: 'Billing', icon: CreditCard, label: 'Payment, Refund & Invoicing', desc: 'Deducted payment, pending refund, or invoice receipt' },
  { id: 'Technical', icon: Headphones, label: 'Account / Website Glitch', desc: 'Login troubles, promo codes, or checkout errors' },
  { id: 'General', icon: MessageSquare, label: 'General Query / Skincare Advice', desc: 'Usage questions, routine recommendations & feedback' }
];

const HelpSupport = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // URL Query Params
  const queryParams = new URLSearchParams(location.search);
  const initialOrderId = queryParams.get('orderId') || '';

  const [activeTab, setActiveTab] = useState(queryParams.get('tab') === 'history' ? 'history' : 'create');
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [sendingReply, setSendingReply] = useState({});
  const [toast, setToast] = useState(null);

  // Form State (Urgent option removed as requested)
  const [formData, setFormData] = useState({
    order_id: initialOrderId,
    category: 'Shipping',
    priority: 'Medium',
    subject: initialOrderId ? `Issue with Order #${initialOrderId}` : '',
    message: '',
    user_phone: user?.phone || ''
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Orders for dropdown
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setOrders(data);
        }
      } catch (e) {
        console.error('Error fetching orders:', e);
      }
    };
    fetchOrders();
  }, []);

  // Fetch user tickets
  const fetchTickets = async () => {
    if (!user?.email) return;
    try {
      setLoadingTickets(true);
      const res = await fetch(`${API_BASE_URL}/support?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        const fullTickets = await Promise.all(
          data.map(async (t) => {
            try {
              const repRes = await fetch(`${API_BASE_URL}/support/${t.id}/replies`);
              if (repRes.ok) {
                const repData = await repRes.json();
                return { ...t, replies: repData };
              }
            } catch (err) {}
            return { ...t, replies: [] };
          })
        );
        setTickets(fullTickets);
      }
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchTickets();
    }
  }, [user]);

  // Handle Order Selection Change
  const handleOrderChange = (ordId) => {
    setFormData((prev) => ({
      ...prev,
      order_id: ordId,
      subject: ordId ? `Issue with Order #${ordId}` : prev.subject
    }));
  };

  // Submit Support Ticket
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      showToast('Please enter a subject', 'error');
      return;
    }
    if (!formData.message.trim()) {
      showToast('Please describe your issue or question', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const fullSubject = formData.order_id 
        ? `[Order #${formData.order_id}] ${formData.subject}` 
        : formData.subject;

      const payload = {
        subject: fullSubject,
        user_name: user?.name || 'Customer',
        user_email: user?.email || '',
        user_phone: formData.user_phone,
        category: formData.category,
        priority: formData.priority, // Low, Medium, High
        message: formData.message,
        tags: formData.order_id ? `order,${formData.order_id}` : 'customer_ticket'
      };

      const res = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');

      setSubmittedTicket({
        ticket_id: data.ticket_id,
        subject: fullSubject,
        category: formData.category,
        message: formData.message
      });

      // Reset form
      setFormData({
        order_id: '',
        category: 'Shipping',
        priority: 'Medium',
        subject: '',
        message: '',
        user_phone: user?.phone || ''
      });

      showToast(`Support Ticket ${data.ticket_id} created successfully!`);
      fetchTickets();
    } catch (err) {
      console.error('Ticket submit error:', err);
      showToast(err.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reply to ticket
  const handleSendReply = async (ticketId) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    try {
      setSendingReply((prev) => ({ ...prev, [ticketId]: true }));
      const res = await fetch(`${API_BASE_URL}/support/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: text.trim(),
          agent: user?.name || 'Customer',
          sender_type: 'user'
        })
      });

      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
        showToast('Message sent to support team');
        fetchTickets();
      } else {
        showToast('Failed to send reply', 'error');
      }
    } catch (e) {
      showToast('Error sending reply', 'error');
    } finally {
      setSendingReply((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return { bg: '#fee2e2', text: '#dc2626', label: '🔴 Open' };
      case 'In Progress':
        return { bg: '#fef3c7', text: '#d97706', label: '🟡 In Progress' };
      case 'Resolved':
        return { bg: '#dcfce7', text: '#15803d', label: '🟢 Resolved' };
      case 'Closed':
        return { bg: '#f1f5f9', text: '#64748b', label: '⚪ Closed' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '140px 20px 80px',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', top: 24, right: 24, zIndex: 999999,
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff', padding: '12px 24px', borderRadius: '12px',
            fontWeight: 700, boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {toast.type === 'error' ? <AlertTriangle size={18}/> : <Check size={18}/>}
            {toast.msg}
          </div>
        )}

        {/* ════════ HERO HEADER ════════ */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              <Sparkles size={14}/> 24/7 Dedicated Customer Desk
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>
              Help & Support Center
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              Need help with a delivery, damaged parcel, payment, or general advice? Report below and our team will resolve it quickly.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/my-orders"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '12px 20px', borderRadius: '14px', fontWeight: 700,
                fontSize: '0.88rem', textDecoration: 'none', transition: 'all 0.2s',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Package size={18}/> My Orders
            </Link>
          </div>
        </div>

        {/* ════════ MAIN CARD ════════ */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
          padding: '36px',
          boxSizing: 'border-box'
        }}>
          
          {/* Tab Navigation */}
          <div style={{
            display: 'flex', gap: '12px', borderBottom: '2px solid #f1f5f9',
            marginBottom: '32px', paddingBottom: '2px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('create'); setSubmittedTicket(null); }}
              style={{
                padding: '14px 24px', border: 'none', background: 'transparent',
                fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                color: activeTab === 'create' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'create' ? '3px solid #2563eb' : '3px solid transparent',
                marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Send size={18} /> Report an Issue / Submit Ticket
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); fetchTickets(); }}
              style={{
                padding: '14px 24px', border: 'none', background: 'transparent',
                fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                color: activeTab === 'history' ? '#2563eb' : '#64748b',
                borderBottom: activeTab === 'history' ? '3px solid #2563eb' : '3px solid transparent',
                marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={18} /> My Support Tickets
              {tickets.length > 0 && (
                <span style={{
                  fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb',
                  padding: '2px 10px', borderRadius: '12px', fontWeight: 800
                }}>
                  {tickets.length}
                </span>
              )}
            </button>
          </div>

          {/* ════════ TAB 1: RAISE ISSUE / TICKET ════════ */}
          {activeTab === 'create' && (
            <div>
              {submittedTicket ? (
                /* Success confirmation state */
                <div style={{
                  background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '20px',
                  padding: '48px 32px', textAlign: 'center'
                }}>
                  <div style={{
                    width: '68px', height: '68px', borderRadius: '50%',
                    background: '#dcfce7', color: '#16a34a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px', boxShadow: '0 8px 20px rgba(22,163,74,0.15)'
                  }}>
                    <CheckCircle size={40} />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
                    Problem Reported Successfully!
                  </h3>
                  <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                    Your ticket has been registered on the Admin Support Desk with reference ID:
                  </p>
                  <div style={{
                    display: 'inline-block', background: '#ffffff', border: '2px dashed #22c55e',
                    padding: '12px 30px', borderRadius: '14px', fontSize: '1.4rem', fontWeight: 900,
                    color: '#15803d', letterSpacing: '1px', marginBottom: '28px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                  }}>
                    #{submittedTicket.ticket_id}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '32px' }}>
                    Our customer support team is actively reviewing your query and will reply shortly.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { setActiveTab('history'); fetchTickets(); }}
                      style={{
                        padding: '14px 28px', borderRadius: '14px', border: 'none',
                        background: '#2563eb', color: '#fff', fontSize: '0.95rem', fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 6px 20px rgba(37,99,235,0.3)'
                      }}
                    >
                      View Ticket & Status <ArrowRight size={18}/>
                    </button>
                    <button
                      onClick={() => setSubmittedTicket(null)}
                      style={{
                        padding: '14px 24px', borderRadius: '14px', border: '1.5px solid #cbd5e1',
                        background: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', color: '#334155'
                      }}
                    >
                      Submit Another Report
                    </button>
                  </div>
                </div>
              ) : (
                /* Report Problem Form */
                <form onSubmit={handleSubmitTicket}>
                  
                  {/* Related Order Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Related Order (Optional)
                    </label>
                    <select
                      value={formData.order_id}
                      onChange={(e) => handleOrderChange(e.target.value)}
                      style={{
                        width: '100%', padding: '13px 16px', borderRadius: '14px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.92rem', background: '#fff',
                        outline: 'none', cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Select an Order from Your Account or Leave Empty --</option>
                      {orders
                        .filter(o => 
                          (user?.email && o.customer_email && o.customer_email.toLowerCase() === user.email.toLowerCase()) ||
                          (user?.id && o.customer_id === user.id) ||
                          (!o.customer_email && !o.customer_id)
                        )
                        .map((o) => (
                          <option key={o.id} value={o.order_number}>
                            Order #{o.order_number} (₹{o.total_amount} · {o.order_status})
                          </option>
                        ))}
                    </select>
                    {formData.order_id && (
                      <p style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '6px' }}>
                        ✓ Linked to Your Order #{formData.order_id}
                      </p>
                    )}
                  </div>

                  {/* Category Picker Cards */}
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>
                      What issue are you facing? *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      {ISSUE_CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isSelected = formData.category === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            style={{
                              border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#fafbfc',
                              padding: '16px 18px',
                              borderRadius: '16px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxShadow: isSelected ? '0 6px 18px rgba(37,99,235,0.12)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: isSelected ? '#2563eb' : '#e2e8f0',
                                color: isSelected ? '#ffffff' : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <IconComponent size={16} />
                              </div>
                              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                                {cat.label}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                              {cat.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Subject / Title *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Package arrived with damaged seal / Delivery delayed by 3 days"
                      required
                      style={{
                        width: '100%', padding: '13px 16px', borderRadius: '14px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.95rem', outline: 'none',
                        boxSizing: 'border-box', fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Message Description */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Describe your problem in detail *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please explain the issue clearly (e.g. date of delivery, specific product name, tracking number, or refund details)..."
                      required
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '14px',
                        border: '1.5px solid #e2e8f0', fontSize: '0.92rem', outline: 'none',
                        boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                        Contact Phone (for quick callback)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '0 14px', background: '#fff' }}>
                        <Phone size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
                        <input
                          type="text"
                          value={formData.user_phone}
                          onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          style={{ border: 'none', outline: 'none', padding: '13px 0', fontSize: '0.9rem', width: '100%', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                        Registered Email
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #f1f5f9', borderRadius: '14px', padding: '0 14px', background: '#f8fafc' }}>
                        <Mail size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
                        <input
                          type="text"
                          value={user?.email || ''}
                          disabled
                          style={{ border: 'none', outline: 'none', padding: '13px 0', fontSize: '0.9rem', width: '100%', background: 'transparent', color: '#64748b' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/my-orders')}
                      style={{
                        padding: '13px 24px', borderRadius: '14px', border: '1.5px solid #e2e8f0',
                        background: '#fff', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer', color: '#64748b'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '14px 32px', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#fff', fontSize: '0.95rem', fontWeight: 800,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 8px 24px rgba(37,99,235,0.35)'
                      }}
                    >
                      <Send size={18} />
                      {submitting ? 'Submitting Report...' : 'Submit Support Ticket'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ════════ TAB 2: MY TICKETS & LIVE REPLIES ════════ */}
          {activeTab === 'history' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b' }}>
                  Showing all support queries for <strong>{user?.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={fetchTickets}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#f8fafc', border: '1.5px solid #e2e8f0',
                    padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem',
                    fontWeight: 700, color: '#334155', cursor: 'pointer'
                  }}
                >
                  <RefreshCcw size={14} className={loadingTickets ? 'animate-spin' : ''} /> Refresh Tickets
                </button>
              </div>

              {loadingTickets ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                  <RefreshCcw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#2563eb' }} />
                  <p style={{ fontWeight: 600 }}>Loading your support tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div style={{
                  background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '20px',
                  padding: '54px 20px', textAlign: 'center'
                }}>
                  <LifeBuoy size={52} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>
                    No Support Tickets Found
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '22px' }}>
                    If you ever face any issues with an order or payment, submit a report here.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    style={{
                      padding: '12px 24px', borderRadius: '12px', background: '#2563eb',
                      color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                    }}
                  >
                    Raise an Issue Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {tickets.map((t) => {
                    const statusStyle = getStatusBadge(t.status);
                    const isExpanded = expandedTicketId === t.id;
                    const replyCount = (t.replies || []).length;

                    return (
                      <div
                        key={t.id}
                        style={{
                          background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px',
                          overflow: 'hidden', transition: 'all 0.2s',
                          boxShadow: isExpanded ? '0 10px 28px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        {/* Ticket Header */}
                        <div
                          onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                          style={{
                            padding: '20px 24px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                            background: isExpanded ? '#fafbfc' : '#ffffff'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontFamily: 'monospace', fontWeight: 900, fontSize: '0.88rem',
                                background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px'
                              }}>
                                #{t.ticket_id}
                              </span>
                              <span style={{
                                fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px',
                                borderRadius: '20px', background: statusStyle.bg, color: statusStyle.text
                              }}>
                                {statusStyle.label}
                              </span>
                              <span style={{
                                fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px',
                                borderRadius: '6px', background: '#f1f5f9', color: '#475569'
                              }}>
                                {t.category}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                <Clock size={12} style={{ display: 'inline', marginRight: '3px' }}/>
                                {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <h4 style={{
                              margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                              {t.subject}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {replyCount > 0 && (
                              <span style={{
                                fontSize: '0.8rem', fontWeight: 800, color: '#2563eb',
                                background: '#eff6ff', padding: '6px 12px', borderRadius: '12px'
                              }}>
                                💬 {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                              </span>
                            )}
                            <div style={{ color: '#94a3b8' }}>
                              {isExpanded ? <ChevronUp size={22}/> : <ChevronDown size={22}/>}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Conversation */}
                        {isExpanded && (
                          <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                            {/* Original Message */}
                            <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '14px', marginBottom: '22px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                                <strong>Your Original Report:</strong>
                                <span>Priority: <strong>{t.priority}</strong></span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                {t.message || 'No description provided'}
                              </p>
                            </div>

                            {/* Thread */}
                            <div style={{ marginBottom: '22px' }}>
                              <h5 style={{ fontSize: '0.82rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                                Live Conversation with Support
                              </h5>

                              {t.replies && t.replies.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  {t.replies.map((rep) => {
                                    const isAdmin = rep.sender_type === 'admin';
                                    return (
                                      <div
                                        key={rep.id}
                                        style={{
                                          alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                                          maxWidth: '85%',
                                          background: isAdmin ? '#eff6ff' : '#f8fafc',
                                          border: isAdmin ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                                          borderRadius: '16px',
                                          padding: '14px 18px',
                                          boxShadow: isAdmin ? '0 4px 14px rgba(37,99,235,0.06)' : 'none'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 800, color: isAdmin ? '#1d4ed8' : '#475569' }}>
                                          {isAdmin ? <Shield size={15} color="#2563eb" /> : <User size={15} />}
                                          <span>{isAdmin ? `Official Support Desk (${rep.agent || 'Team'})` : 'You'}</span>
                                          <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 'auto' }}>
                                            {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                          {rep.message}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p style={{ fontSize: '0.88rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                                  No replies from support yet. Our team will respond here shortly.
                                </p>
                              )}
                            </div>

                            {/* Reply Input */}
                            {t.status !== 'Closed' && (
                              <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
                                <input
                                  type="text"
                                  value={replyText[t.id] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(t.id); }}
                                  placeholder="Type a reply or question to support team..."
                                  style={{
                                    flex: 1, padding: '12px 18px', borderRadius: '14px',
                                    border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none',
                                    fontFamily: 'inherit'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(t.id)}
                                  disabled={sendingReply[t.id] || !replyText[t.id]?.trim()}
                                  style={{
                                    padding: '12px 24px', borderRadius: '14px', border: 'none',
                                    background: '#2563eb', color: '#fff', fontWeight: 800,
                                    fontSize: '0.92rem', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '8px'
                                  }}
                                >
                                  <Send size={16} /> Send Reply
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
