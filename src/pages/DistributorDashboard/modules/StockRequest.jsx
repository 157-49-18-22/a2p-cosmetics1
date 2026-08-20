import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShoppingCart, Package, Plus, Search, Trash2,
  CheckCircle, Clock, AlertCircle, RefreshCcw,
  CreditCard, Smartphone, Banknote, X, ShieldCheck, Loader2
} from 'lucide-react';

const API_BASE = API_BASE_URL;

/* ───────── Payment Modal ───────── */
const PaymentModal = ({ cart, totalAmount, distributor, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);

  const loadScript = (src) =>
    new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleOnlinePayment = async () => {
    setProcessing(true);
    try {
      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) { alert('Razorpay SDK failed to load. Are you online?'); setProcessing(false); return; }

      const { data } = await axios.post(`${API_BASE}/distributors/stock-requests/razorpay`, { amount: totalAmount });
      if (!data.success) { alert('Server error'); setProcessing(false); return; }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: 'INR',
        name: 'A2P Cosmetics',
        description: `Stock Order — ${distributor.name || 'Distributor'}`,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            const saveRes = await axios.post(`${API_BASE}/distributors/stock-requests/verify-payment`, {
              distributor_id: distributor.id,
              items: cart,
              total_amount: totalAmount,
              payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              payment_method: 'Online (Razorpay)'
            });
            if (saveRes.data.success) onSuccess(saveRes.data.request_number, 'Online');
            else alert('Payment successful but order could not be saved. Please contact support.');
          } catch (e) {
            console.error(e);
            alert('Payment successful but an error occurred while saving the order.');
          }
        },
        prefill: { name: distributor.name || '', contact: distributor.phone || '' },
        theme: { color: '#a855f7' },
        modal: { ondismiss: () => setProcessing(false) }
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e) {
      console.error(e);
      alert('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    try {
      const { data } = await axios.post(`${API_BASE}/distributors/stock-requests`, {
        distributor_id: distributor.id,
        items: cart,
        total_amount: totalAmount
      });
      onSuccess(data.request_number, 'Cash');
    } catch (e) {
      alert('Failed to send request');
      setProcessing(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === 'razorpay') handleOnlinePayment();
    else handleCashPayment();
  };

  const paymentOptions = [
    {
      id: 'razorpay',
      icon: <CreditCard size={20} />,
      label: 'Online Payment',
      sub: 'UPI · Cards · Netbanking · Wallet',
      color: '#a855f7',
      bg: '#f3eeff'
    },
    {
      id: 'cash',
      icon: <Banknote size={20} />,
      label: 'Cash / Pay Later',
      sub: 'Request stock, pay on delivery',
      color: '#10b981',
      bg: '#ecfdf5'
    }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15,10,30,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: 28, width: '100%', maxWidth: 480,
        boxShadow: '0 40px 100px rgba(168,85,247,0.25)',
        overflow: 'hidden', position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
          padding: '24px 28px 20px', color: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, letterSpacing: 1 }}>
                A2P COSMETICS — DISTRIBUTOR PORTAL
              </p>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Complete Payment</h2>
            </div>
            <button onClick={onClose} disabled={processing} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12,
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff'
            }}>
              <X size={18} />
            </button>
          </div>
          <div style={{
            marginTop: 20, background: 'rgba(255,255,255,0.15)', borderRadius: 16,
            padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Total Amount</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 900 }}>₹{totalAmount.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.7rem', opacity: 0.8 }}>
              <p style={{ margin: 0 }}>{cart.length} items</p>
              <p style={{ margin: 0 }}>{distributor.name}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: 0.5 }}>
            SELECT PAYMENT METHOD
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {paymentOptions.map(opt => (
              <button key={opt.id} onClick={() => setPaymentMethod(opt.id)} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                borderRadius: 16, border: paymentMethod === opt.id ? `2px solid ${opt.color}` : '2px solid #f1f5f9',
                background: paymentMethod === opt.id ? opt.bg : '#fafafa',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: paymentMethod === opt.id ? `0 0 0 4px ${opt.color}20` : 'none'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: paymentMethod === opt.id ? opt.color : '#e2e8f0',
                  color: paymentMethod === opt.id ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s'
                }}>
                  {opt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{opt.label}</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{opt.sub}</p>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${paymentMethod === opt.id ? opt.color : '#cbd5e1'}`,
                  background: paymentMethod === opt.id ? opt.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {paymentMethod === opt.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </button>
            ))}
          </div>

          {/* Items summary */}
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 16px', marginBottom: 24 }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>ORDER ITEMS</p>
            {cart.slice(0, 3).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>{item.name} × {item.quantity}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            {cart.length > 3 && (
              <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>+{cart.length - 3} more items</p>
            )}
          </div>

          <button onClick={handlePay} disabled={processing} style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
            background: processing ? '#e2e8f0' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
            color: processing ? '#94a3b8' : '#fff', fontWeight: 800, fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.2s'
          }}>
            {processing ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            ) : paymentMethod === 'razorpay' ? (
              <><ShieldCheck size={18} /> Pay ₹{totalAmount.toLocaleString()} Securely</>
            ) : (
              <><Banknote size={18} /> Submit Stock Request</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', margin: '12px 0 0' }}>
            🔒 Secured by Razorpay · 256-bit SSL Encryption
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ───────── Success Modal ───────── */
const SuccessModal = ({ requestNumber, method, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(15,10,30,0.65)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
  }}>
    <div style={{
      background: '#fff', borderRadius: 28, width: '100%', maxWidth: 400,
      padding: '48px 32px', textAlign: 'center',
      boxShadow: '0 40px 100px rgba(16,185,129,0.2)'
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
      }}>
        <CheckCircle size={40} color="#fff" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', margin: '0 0 8px' }}>Request Submitted!</h2>
      <p style={{ color: '#64748b', margin: '0 0 24px', fontSize: '0.9rem' }}>
        {method === 'Online' ? 'Payment successful!' : 'Cash request sent!'} The admin has received your request.
      </p>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '14px 20px', marginBottom: 28 }}>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>REQUEST NUMBER</p>
        <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 900, color: '#064e3b' }}>{requestNumber}</p>
      </div>
      <button onClick={onClose} style={{
        width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff', fontWeight: 800, fontSize: '0.95rem'
      }}>
        Done
      </button>
    </div>
  </div>
);

/* ───────── Main Component ───────── */
const StockRequest = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [successData, setSuccessData] = useState(null);

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

  const totalAmount = cart.reduce((a, b) => a + (b.price * b.quantity), 0);

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

  const handlePaymentSuccess = (requestNumber, method) => {
    setShowPayment(false);
    setSuccessData({ requestNumber, method });
    setCart([]);
    fetchRequests();
  };

  if (loading) return <div className="dd-loading">Loading Stock Request...</div>;

  return (
    <div className="dd-module-enter">
      {showPayment && (
        <PaymentModal
          cart={cart}
          totalAmount={totalAmount}
          distributor={distributor}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {successData && (
        <SuccessModal
          requestNumber={successData.requestNumber}
          method={successData.method}
          onClose={() => setSuccessData(null)}
        />
      )}

      <div className="dd-module-header">
        <div className="dd-header-info">
          <h1 className="dd-module-title">Stock Indenting</h1>
          <p className="dd-module-subtitle">Request new stock directly from A2P Admin.</p>
        </div>
        <div className="dd-header-btns">
          <button className="dd-btn dd-btn-outline" onClick={() => { fetchProducts(); fetchRequests(); }}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="dd-dashboard-grid">
        {/* Product Catalog */}
        <div className="dd-card" style={{ padding: 24, borderRadius: 24 }}>
          <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
            <div className="dd-search-inline" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <Search size={14} color="#94a3b8" />
              <input placeholder="Search main inventory..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
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

        {/* Cart + Requests */}
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
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}</p>
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
                    <span style={{ color: '#a855f7' }}>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Options Preview */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[
                    { icon: <Smartphone size={14} />, label: 'UPI' },
                    { icon: <CreditCard size={14} />, label: 'Card' },
                    { icon: <Banknote size={14} />, label: 'Cash' }
                  ].map(opt => (
                    <div key={opt.label} style={{
                      flex: 1, padding: '8px 4px', border: '1.5px solid #f1f5f9', borderRadius: 10,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      fontSize: '0.65rem', fontWeight: 700, color: '#64748b', background: '#fafafa'
                    }}>
                      {opt.icon}
                      {opt.label}
                    </div>
                  ))}
                </div>

                <button
                  className="dd-btn dd-btn-primary"
                  style={{
                    width: '100%', height: 48, borderRadius: 14,
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                  onClick={() => setShowPayment(true)}
                >
                  <CreditCard size={18} /> Proceed to Payment
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
                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#94a3b8' }}>
                      {new Date(r.created_at).toLocaleDateString()} · ₹{r.total_amount?.toLocaleString()}
                    </p>
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
