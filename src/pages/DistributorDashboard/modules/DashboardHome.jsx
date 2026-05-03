import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, Package, Users, FileText,
  Star, Map, ArrowRight, CheckCircle, Clock, AlertCircle, X, Plus, Download, Printer,
  Calendar, CreditCard, Building2, Sparkles, ShoppingBag, Trash2, Search, Minus, RefreshCcw
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/distributors';
const PRODUCTS_API = 'http://localhost:5000/api/products';

const DashboardHome = ({ setActiveModule }) => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const distributorId = 1;

  // Modal States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Order State
  const [orderDealer, setOrderDealer] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [searchProd, setSearchProd] = useState('');

  // Invoice State
  const [invoiceForm, setInvoiceForm] = useState({ dealerId: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
  
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, productsRes, dealersRes, topRes] = await Promise.all([
        axios.get(`${API_BASE}/${distributorId}/stats`),
        axios.get(`${API_BASE}/${distributorId}/activity`),
        axios.get(PRODUCTS_API),
        axios.get(`${API_BASE}/${distributorId}/dealers`),
        axios.get(`${API_BASE}/${distributorId}/top-performers`)
      ]);

      const rawStats = statsRes.data;
      setStats([
        { label: 'Total Dealers', value: rawStats.total_dealers, change: '+8', up: true, icon: Users, color: '#f3eeff', iconColor: '#a855f7' },
        { label: 'Active Orders', value: rawStats.active_orders, change: '+5', up: true, icon: Package, color: '#fff0f9', iconColor: '#ec4899' },
        { label: 'Monthly Revenue', value: `₹${(rawStats.monthly_revenue / 100000).toFixed(1)}L`, change: '+12%', up: true, icon: TrendingUp, color: '#f0fdf4', iconColor: '#16a34a' },
        { label: 'Pending Bills', value: rawStats.pending_bills || 0, change: '-3', up: false, icon: FileText, color: '#fffbeb', iconColor: '#d97706' },
        { label: 'Zones Covered', value: rawStats.zones_covered || 2, change: '+1', up: true, icon: Map, color: '#eff6ff', iconColor: '#2563eb' },
        { label: 'Super Stockists', value: rawStats.super_stockists || 1, change: '0', up: true, icon: Star, color: '#fdf4ff', iconColor: '#c026d3' },
      ]);
      setActivities(activityRes.data);
      setProducts(productsRes.data);
      setDealers(dealersRes.data);
      setTopPerformers(topRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addToOrder = (prod) => {
    const existing = orderItems.find(i => i.id === prod.id);
    if (existing) {
      setOrderItems(orderItems.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setOrderItems([...orderItems, { id: prod.id, name: prod.name, price: prod.price, qty: 1 }]);
    }
  };

  const removeFromOrder = (id) => setOrderItems(orderItems.filter(i => i.id !== id));
  const updateQty = (id, delta) => setOrderItems(orderItems.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const totalOrderValue = orderItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  const submitOrder = async () => {
    if (!orderDealer) return alert('Please select a dealer');
    if (orderItems.length === 0) return alert('Please add products to your order');
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/orders`, { distributor_id: distributorId, amount: totalOrderValue, items_count: orderItems.length });
      setShowOrderModal(false);
      setOrderItems([]);
      setOrderDealer('');
      fetchData();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const submitInvoice = async () => {
    if (!invoiceForm.dealerId) return alert('Please select a dealer');
    if (!invoiceForm.amount) return alert('Please enter billing amount');
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/invoices`, { distributor_id: distributorId, amount: invoiceForm.amount, due_date: invoiceForm.dueDate });
      setShowInvoiceModal(false);
      setInvoiceForm({ dealerId: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleQuickAction = (label) => {
    if (label === 'Create Invoice') setShowInvoiceModal(true);
    else if (label === 'Add Dealer') setActiveModule('dealer');
    else if (label === 'Update Stock') setActiveModule('inventory');
    else if (label === 'Assign Area') setActiveModule('area');
  };

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Welcome back, Rahul 👋</h1>
          <p className="dd-module-subtitle">Here's your distribution network status for today.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="dd-btn dd-btn-outline" onClick={fetchData}><RefreshCcw size={15} /> Refresh</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowOrderModal(true)} style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}><Plus size={18} /> New Order</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid">
        {stats.map((s, i) => (
          <div className="dd-stat-card" key={i} style={{ borderRadius: 20 }}>
            <div className="dd-stat-icon" style={{ background: s.color }}><s.icon size={18} color={s.iconColor} /></div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
            <div className={`dd-stat-change ${s.up ? 'up' : 'down'}`} style={{ fontWeight: 800 }}>
              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Activity */}
        <div className="dd-card" style={{ borderRadius: 24 }}>
           <div className="dd-card-header" style={{ padding: '24px 28px' }}>
              <span className="dd-card-title">Recent Activity</span>
              <button className="dd-btn dd-btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>View History</button>
           </div>
           <div className="dd-card-body" style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {activities.length > 0 ? activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: a.activity_type === 'Success' ? '#f0fdf4' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {a.activity_type === 'Success' ? <CheckCircle size={16} color="#16a34a" /> : <FileText size={16} color="#2563eb" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{a.activity_text}</p>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : <p style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No recent activity</p>}
           </div>
        </div>

        {/* Sidebar Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div className="dd-card" style={{ borderRadius: 24 }}>
              <div className="dd-card-header" style={{ padding: '20px 24px' }}><span className="dd-card-title">Quick Actions</span></div>
              <div className="dd-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
                {[
                  { label: 'Add Dealer', icon: Users, color: '#a855f7' },
                  { label: 'Create Invoice', icon: FileText, color: '#ec4899' },
                  { label: 'Update Stock', icon: Package, color: '#16a34a' },
                  { label: 'Assign Area', icon: Map, color: '#2563eb' }
                ].map((q, i) => (
                  <button key={i} onClick={() => handleQuickAction(q.label)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 10px',
                    borderRadius: 18, border: '1.5px solid #f1f5f9', background: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = q.color} onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: q.color + '10', color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><q.icon size={20} /></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{q.label}</span>
                  </button>
                ))}
              </div>
           </div>

           <div className="dd-card" style={{ borderRadius: 24 }}>
              <div className="dd-card-header" style={{ padding: '20px 24px' }}><span className="dd-card-title">Top Dealers</span></div>
              <div className="dd-card-body" style={{ padding: '0 24px 24px' }}>
                {topPerformers.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < topPerformers.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #f3eeff, #fff)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{p.name[0]}</div>
                      <div><p style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.name}</p><p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.zone}</p></div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.85rem' }}>₹{Math.floor(p.revenue/1000)}K</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* ALL MODALS ARE NOW FULLY VERTICAL & NO HORIZONTAL SCROLL */}
      {(showOrderModal || showInvoiceModal) && (
        <div className="dd-modal-overlay">
           <div className="dd-modal-box adm-fade-in" style={{ width: showOrderModal ? '550px' : '450px' }}>
              <div className="dd-modal-header-fancy">
                 <div>
                    <h3 className="modal-title">{showOrderModal ? 'New Bulk Order' : 'Generate Smart Invoice'}</h3>
                    <p className="modal-subtitle">{showOrderModal ? 'Create an inventory request for your dealer.' : 'Bill your network dealers with GST compliance.'}</p>
                 </div>
                 <button className="dd-modal-close" onClick={() => { setShowOrderModal(false); setShowInvoiceModal(false); }}><X size={20} /></button>
              </div>

              <div className="dd-modal-content-fancy" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '32px' }}>
                 
                 {/* SHARED DEALER SELECTOR */}
                 <div className="dd-input-group">
                    <label><Building2 size={14} /> Dealer Account</label>
                    <select 
                      value={showOrderModal ? orderDealer : invoiceForm.dealerId} 
                      onChange={e => showOrderModal ? setOrderDealer(e.target.value) : setInvoiceForm({ ...invoiceForm, dealerId: e.target.value })}
                    >
                       <option value="">-- Select Dealer --</option>
                       {dealers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.zone})</option>)}
                    </select>
                 </div>

                 {showOrderModal && (
                   <>
                     {/* PRODUCT SELECTION IN ORDER MODAL */}
                     <div className="dd-input-group">
                        <label><ShoppingBag size={14} /> Add Products</label>
                        <div className="prod-search-mini">
                           <Search size={14} />
                           <input placeholder="Search product..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
                        </div>
                        <div className="prod-scroll-list">
                           {products.filter(p => p.name.toLowerCase().includes(searchProd.toLowerCase())).slice(0, 5).map(p => (
                             <div key={p.id} className="prod-row-mini">
                                <span>{p.name} (₹{p.price})</span>
                                <button onClick={() => addToOrder(p)}><Plus size={14} /></button>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* CART IN ORDER MODAL */}
                     {orderItems.length > 0 && (
                       <div className="order-cart-mini">
                          <p className="section-tag">Cart Items</p>
                          {orderItems.map(item => (
                            <div key={item.id} className="cart-row-mini">
                               <div style={{ flex: 1 }}>
                                  <p className="cr-name">{item.name}</p>
                                  <p className="cr-price">₹{item.price * item.qty}</p>
                               </div>
                               <div className="qty-box">
                                  <button onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                                  <span>{item.qty}</span>
                                  <button onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                               </div>
                               <button className="cr-del" onClick={() => removeFromOrder(item.id)}><Trash2 size={14} /></button>
                            </div>
                          ))}
                          <div className="cart-total-bar">
                             <span>Grand Total:</span>
                             <span>₹{totalOrderValue}</span>
                          </div>
                       </div>
                     )}
                   </>
                 )}

                 {showInvoiceModal && (
                   <>
                     <div className="dd-input-group">
                        <label><CreditCard size={14} /> Billing Amount (₹)</label>
                        <input type="number" placeholder="Enter amount" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
                     </div>
                     <div className="dd-input-group">
                        <label><Calendar size={14} /> Payment Due Date</label>
                        <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                     </div>
                   </>
                 )}

                 {/* ACTION BUTTONS */}
                 <div className="dd-modal-actions-fancy">
                    <button className="dd-btn-sec" style={{ flex: 1 }} onClick={() => { setShowOrderModal(false); setShowInvoiceModal(false); }}>Discard</button>
                    <button className="dd-btn-pri" style={{ flex: 2, background: showOrderModal ? '#7c3aed' : 'linear-gradient(135deg, #ec4899, #d946ef)' }} onClick={showOrderModal ? submitOrder : submitInvoice} disabled={submitting}>
                       {submitting ? 'Processing...' : (showOrderModal ? 'Place Order' : 'Print & Save Invoice')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .dd-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
        .dd-modal-box { background: #fff; border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.25); overflow: hidden; border: 1px solid rgba(255,255,255,0.8); max-height: 90vh; overflow-y: auto; }
        .dd-modal-header-fancy { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; background: #fafafa; }
        .modal-title { margin: 0; fontWeight: 900; fontSize: 1.15rem; color: #1e293b; }
        .modal-subtitle { margin: 4px 0 0; fontSize: 0.78rem; color: #64748b; }
        .dd-modal-close { background: #fff; border: 1px solid #e2e8f0; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
        
        .dd-input-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .dd-input-group label { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; fontWeight: 800; color: #94a3b8; text-transform: uppercase; }
        .dd-input-group input, .dd-input-group select { height: 48px; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 0 16px; font-size: 0.9rem; fontWeight: 600; color: #1e293b; outline: none; background: #fff; }
        .dd-input-group input:focus { border-color: #a855f7; box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.08); }

        .prod-search-mini { display: flex; align-items: center; gap: 10px; background: #f8fafc; height: 40px; border-radius: 10px; padding: 0 12px; border: 1px solid #e2e8f0; margin-bottom: 8px; }
        .prod-search-mini input { border: none; background: transparent; outline: none; font-size: 0.8rem; flex: 1; }
        .prod-scroll-list { border: 1px solid #f1f5f9; border-radius: 12px; max-height: 150px; overflow-y: auto; }
        .prod-row-mini { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; font-size: 0.8rem; fontWeight: 600; }
        .prod-row-mini button { background: #f3eeff; border: none; width: 26px; height: 26px; border-radius: 6px; color: #7c3aed; cursor: pointer; }
        
        .order-cart-mini { background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .section-tag { font-size: 0.65rem; fontWeight: 800; color: #a855f7; text-transform: uppercase; margin-bottom: 12px; }
        .cart-row-mini { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; background: #fff; padding: 8px 12px; border-radius: 10px; border: 1px solid #f1f5f9; }
        .cr-name { font-size: 0.78rem; fontWeight: 700; color: #1e293b; margin: 0; }
        .cr-price { font-size: 0.7rem; color: #64748b; margin: 2px 0 0; }
        .qty-box { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 3px 6px; border-radius: 6px; }
        .qty-box button { border: none; background: transparent; cursor: pointer; color: #64748b; font-size: 10px; }
        .qty-box span { font-size: 0.75rem; fontWeight: 800; min-width: 12px; text-align: center; }
        .cr-del { background: transparent; border: none; color: #ef4444; cursor: pointer; }
        .cart-total-bar { margin-top: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-weight: 800; font-size: 0.9rem; color: #1e293b; }

        .dd-modal-actions-fancy { display: flex; gap: 12px; margin-top: 10px; }
        .dd-btn-pri { height: 50px; border-radius: 14px; border: none; color: #fff; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .dd-btn-sec { height: 50px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-weight: 800; cursor: pointer; }
        .dd-btn-pri:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>
    </div>
  );
};

export default DashboardHome;
