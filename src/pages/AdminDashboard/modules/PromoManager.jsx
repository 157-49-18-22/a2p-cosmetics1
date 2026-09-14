import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../apiConfig';
import { Tag, Plus, Trash2, Edit, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';

const PromoManager = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    applicable_to: 'all',
    applicable_product_ids: []
  });

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/promos`);
      setPromos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data.products || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPromos();
    fetchProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) return alert('Code and Discount Value are required');
    
    try {
      await axios.post(`${API_BASE_URL}/promos`, formData);
      setShowModal(false);
      setFormData({
        code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', usage_limit: '', start_date: '', end_date: '', applicable_to: 'all', applicable_product_ids: []
      });
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating promo code');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/promos/${id}/status`, { is_active: !currentStatus });
      fetchPromos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/promos/${id}`);
      fetchPromos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-module-container" style={{ padding: '20px' }}>
      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Tag size={24} color="#0ea5e9" /> Promo Code & Discount Manager
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '5px 0 0' }}>Create and manage discount codes, seasonal offers, and rules.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <Plus size={18} /> Create Promo Code
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>CODE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>DISCOUNT</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>APPLICABLE TO</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>RULES</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>USAGE</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>STATUS</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ padding: 20, textAlign: 'center' }}>Loading...</td></tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  <Tag size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <p>No promo codes found. Create one to run a sale!</p>
                </td>
              </tr>
            ) : promos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{p.code}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#16a34a' }}>
                  {p.discount_type === 'percentage' ? `${p.discount_value}%` : `₹${p.discount_value}`}
                </td>
                <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>
                  {p.applicable_to === 'all' ? 'All Products' : 'Specific Products'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#64748b' }}>
                  {p.min_order_value > 0 && <span style={{display:'block'}}>Min: ₹{p.min_order_value}</span>}
                  {p.max_discount && <span style={{display:'block'}}>Max off: ₹{p.max_discount}</span>}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.used_count} / {p.usage_limit || '∞'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button 
                    onClick={() => toggleStatus(p.id, p.is_active)}
                    style={{ border: 'none', background: p.is_active ? '#dcfce7' : '#fee2e2', color: p.is_active ? '#16a34a' : '#ef4444', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {p.is_active ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                    {p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(p.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 16, width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
              Create Promo Code
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={20} color="#94a3b8" /></button>
            </h3>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Promo Code *</label>
                  <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. DIWALI50" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Discount Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>
                    {formData.discount_type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input type="number" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === 'percentage' ? "e.g. 20" : "e.g. 500"} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Min Order Value (₹)</label>
                  <input type="number" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: e.target.value})} placeholder="e.g. 1000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Max Discount (₹) [For % Type]</label>
                  <input type="number" value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} placeholder="e.g. 2000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} disabled={formData.discount_type === 'fixed'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Total Usage Limit (Times)</label>
                  <input type="number" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} placeholder="e.g. 100" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Start Date (Optional)</label>
                  <input type="datetime-local" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>End Date (Optional)</label>
                  <input type="datetime-local" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Applicable To</label>
                <select value={formData.applicable_to} onChange={e => setFormData({...formData, applicable_to: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                  <option value="all">All Products (Site-wide/Seasonal Sale)</option>
                  <option value="specific_products">Specific Products Only</option>
                </select>
              </div>

              {formData.applicable_to === 'specific_products' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5 }}>Select Products</label>
                  <select 
                    multiple
                    value={formData.applicable_product_ids}
                    onChange={e => {
                      const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                      setFormData({...formData, applicable_product_ids: values});
                    }}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, minHeight: 100 }}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 5 }}>Hold Ctrl (or Cmd) to select multiple products.</p>
                </div>
              )}

              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, fontSize: '1rem', marginTop: 10, cursor: 'pointer' }}>
                Create Promo Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoManager;
