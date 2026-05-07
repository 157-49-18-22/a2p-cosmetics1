import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Heart, Search, Filter, X, Trash2, MapPin, Mail, Phone, ArrowUpRight, TrendingUp, Clock, Plus, Eye, Sparkles, Brain, Zap } from 'lucide-react';

const API = API_BASE_URL;

const CustomerCRM = () => {
  const [customers, setCustomers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', status: 'Active', tier: 'Bronze' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([fetch(`${API}/customers`), fetch(`${API}/customers/activity`)]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setCustomers(Array.isArray(d1) ? d1 : []);
      setActivities(Array.isArray(d2) ? d2 : []);
    } catch (e) {
      setCustomers([]); setActivities([]);
    } finally { setLoading(false); }
  };

  const handleView = (c) => { setSelectedCustomer(c); setShowModal(true); };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this customer from CRM?')) return;
    try {
      await fetch(`${API}/customers/${id}`, { method: 'DELETE' });
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', location: '', status: 'Active', tier: 'Bronze' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    try {
      await fetch(`${API}/customers/${selectedCustomer.id}/notes`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: selectedCustomer.admin_notes })
      });
    } catch (e) { console.error(e); }
  };

  const getTierColor = (tier) => ({ Platinum: '#0f172a', Gold: '#eab308', Silver: '#94a3b8', Bronze: '#92400e' }[tier] || '#92400e');

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: '#3b82f6' },
    { label: 'Active Carts', value: activities.filter(a => a.type === 'Cart').length, icon: ShoppingCart, color: '#10b981' },
    { label: 'Total Revenue (LTV)', value: `₹${customers.reduce((s, c) => s + parseFloat(c.total_spend || 0), 0).toLocaleString()}`, icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Wishlist Items', value: activities.filter(a => a.type === 'Wishlist').length, icon: Heart, color: '#f43f5e' },
  ];

  return (
    <div className="adm-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Customer CRM <span style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', padding: '4px 12px', borderRadius: '20px', marginLeft: '12px', verticalAlign: 'middle' }}>PRO</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>Manage customers, track behavior, and boost retention.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Customer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {stats.map((s, i) => (
          <div key={i} className="adm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.04 }}><s.icon size={70} /></div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={22} /></div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card" style={{ borderRadius: '24px' }}>
        <div style={{ padding: '20px 28px', display: 'flex', gap: '16px' }}>
          <div className="adm-search" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Search size={16} color="#94a3b8" />
            <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn-outline"><Filter size={16} /> Filters</button>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '28px' }}>Customer</th>
                <th>Value & Tier</th>
                <th>Region</th>
                <th>Status</th>
                <th style={{ paddingRight: '28px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No customers found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }}>
                  <td style={{ paddingLeft: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', border: '1px solid #e2e8f0' }}>
                        {c.name?.[0] || '?'}
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>{c.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#1e293b', display: 'block' }}>₹{parseFloat(c.total_spend || 0).toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: getTierColor(c.tier), textTransform: 'uppercase' }}>{c.tier} Member</span>
                  </td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}><MapPin size={13} color="#94a3b8" /> {c.location || '—'}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.status === 'Active' ? '#10b981' : '#f43f5e' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.status}</span>
                    </div>
                  </td>
                  <td style={{ paddingRight: '28px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adm-icon-btn" style={{ background: '#eff6ff', color: '#3b82f6', borderRadius: '10px' }} onClick={() => handleView(c)} title="View Profile"><Eye size={16} /></button>
                      <button className="adm-icon-btn" style={{ background: '#fff1f2', color: '#f43f5e', borderRadius: '10px' }} onClick={(e) => handleDelete(c.id, e)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Modal */}
      {showModal && selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }} onClick={() => setShowModal(false)}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', borderRadius: '28px 28px 0 0' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 900, border: '2px solid #fff', boxShadow: '0 8px 20px rgba(59,130,246,0.15)' }}>
                  {selectedCustomer.name?.[0]}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>{selectedCustomer.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: '20px' }}>ID: #CUST-{selectedCustomer.id?.toString().padStart(3, '0')}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', background: getTierColor(selectedCustomer.tier), padding: '3px 10px', borderRadius: '20px' }}>{selectedCustomer.tier}</span>
                  </div>
                </div>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Contact Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[{ icon: Mail, label: 'Email', val: selectedCustomer.email }, { icon: Phone, label: 'Phone', val: selectedCustomer.phone || '—' }, { icon: MapPin, label: 'Location', val: selectedCustomer.location || '—' }].map((item, i) => (
                  <div key={i} style={{ padding: '14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#94a3b8' }}><item.icon size={13} /><span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</span></div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', wordBreak: 'break-all' }}>{item.val}</p>
                  </div>
                ))}
              </div>

              {/* AI Strategist */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '20px', padding: '24px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.06 }}><Brain size={100} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={16} /></div>
                  <h4 style={{ fontWeight: 800 }}>AI Sales Strategist</h4>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Churn Probability</span>
                    <span style={{ fontWeight: 800, color: parseFloat(selectedCustomer.total_spend) > 2000 ? '#10b981' : '#f59e0b' }}>
                      {parseFloat(selectedCustomer.total_spend) > 2000 ? 'Low Risk (12%)' : 'Medium Risk (45%)'}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                    <div style={{ width: parseFloat(selectedCustomer.total_spend) > 2000 ? '12%' : '45%', height: '100%', background: parseFloat(selectedCustomer.total_spend) > 2000 ? '#10b981' : '#f59e0b', borderRadius: '10px' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={11} /> Recommendation</p>
                  <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {activities.some(a => a.customer_id === selectedCustomer.id && a.type === 'Cart')
                      ? 'Customer has items in cart. Sending a Limited Time 10% Discount could trigger a purchase in next 12 hours.'
                      : 'Likely to respond to a New Product Alert in the Face Serum category based on past browsing.'}
                  </p>
                </div>
              </div>

              {/* Journey Timeline */}
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={13} /> Customer Journey</h4>
                <div style={{ position: 'relative', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: '5px', top: 0, bottom: 0, width: '2px', background: '#f1f5f9' }} />
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div style={{ position: 'absolute', left: '-17px', top: '4px', width: '9px', height: '9px', borderRadius: '50%', background: '#fff', border: '2px solid #3b82f6' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>Became a Member</p>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(selectedCustomer.joined_at).toLocaleDateString()}</p>
                  </div>
                  {activities.filter(a => a.customer_id === selectedCustomer.id).map((act, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
                      <div style={{ position: 'absolute', left: '-17px', top: '4px', width: '9px', height: '9px', borderRadius: '50%', background: '#fff', border: `2px solid ${act.type === 'Cart' ? '#10b981' : '#f43f5e'}` }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 800 }}>{act.type === 'Cart' ? 'Added to Cart' : 'Saved to Wishlist'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{act.product_name}</p>
                    </div>
                  ))}
                  {activities.filter(a => a.customer_id === selectedCustomer.id).length === 0 && (
                    <div style={{ position: 'relative', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ position: 'absolute', left: '-17px', top: '15px', width: '9px', height: '9px', borderRadius: '50%', background: '#cbd5e1' }} />
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> No activity recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Notes */}
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Admin Notes</span>
                  <button onClick={handleSaveNotes} style={{ color: '#3b82f6', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>Save</button>
                </div>
                <textarea style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.85rem', color: '#475569', minHeight: '60px', outline: 'none', resize: 'none' }}
                  placeholder="Private notes about this customer..."
                  value={selectedCustomer.admin_notes || ''}
                  onChange={e => setSelectedCustomer({ ...selectedCustomer, admin_notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`mailto:${selectedCustomer.email}`} className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center' }}><Mail size={16} /> Send Email</a>
                <button className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '480px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Add Customer</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Register a new customer profile.</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[{ label: 'Full Name', key: 'name', type: 'text', required: true }, { label: 'Email', key: 'email', type: 'email', required: true }, { label: 'Phone', key: 'phone', type: 'text' }, { label: 'City / Location', key: 'location', type: 'text' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>{f.label}</label>
                  <input type={f.type} required={f.required} className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '46px', padding: '0 14px' }} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
                </div>
              ))}
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                <button type="button" className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCRM;
