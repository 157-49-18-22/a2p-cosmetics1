import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, MessageSquareQuote, Star } from 'lucide-react';

const API = API_BASE_URL;
const EMPTY_FORM = { name: '', rating: 5, content: '', product_name: '', status: 'Active' };

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/testimonials`);
      const data = await res.json();
      setTestimonials(data);
    } catch (e) {
      showToast('Failed to load testimonials', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setEditingTest(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (t) => { setEditingTest(t); setForm({ ...t }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.content) return showToast('Name and content are required', 'danger');
    setSaving(true);
    try {
      const method = editingTest ? 'PUT' : 'POST';
      const url = editingTest ? `${API}/testimonials/${editingTest.id}` : `${API}/testimonials`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      showToast(editingTest ? 'Testimonial updated!' : 'Testimonial added!');
      setShowModal(false);
      fetchTestimonials();
    } catch (e) {
      showToast('Save failed. Check backend.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await fetch(`${API}/testimonials/${id}`, { method: 'DELETE' });
      showToast('Testimonial deleted');
      fetchTestimonials();
    } catch (e) {
      showToast('Delete failed', 'danger');
    }
  };

  const filtered = testimonials.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.content?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Testimonials Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage customer reviews and feedback shown on the website.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}><Plus size={18} /> Add Testimonial</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header adm-card-header-flex">
          <div className="adm-search-container">
            <div className="adm-search">
              <Search size={16} />
              <input type="text" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <span className="adm-count-badge">{filtered.length} reviews</span>
        </div>
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <MessageSquareQuote size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <MessageSquareQuote size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p>No testimonials found.</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Review Content</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((test) => (
                  <tr key={test.id}>
                    <td style={{ minWidth: '150px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#3b82f6' }}>
                          {test.name.charAt(0)}
                        </div>
                        <div style={{ fontWeight: 700 }}>{test.name}</div>
                      </div>
                    </td>
                    <td><p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '300px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{test.content}</p></td>
                    <td><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{test.product_name || 'General'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < test.rating ? '#fbbf24' : 'none'} color={i < test.rating ? '#fbbf24' : '#e2e8f0'} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${test.status === 'Active' ? 'success' : 'danger'}`}>
                        {test.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="adm-icon-btn" title="Edit" onClick={() => openEdit(test)}><Edit2 size={14} /></button>
                        <button className="adm-icon-btn" title="Delete" style={{ color: '#f43f5e' }} onClick={() => handleDelete(test.id, test.name)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '500px' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{editingTest ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="adm-field">
                  <label>Customer Name *</label>
                  <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sarah Mitchell" />
                </div>
                <div className="adm-field">
                  <label>Rating (1-5)</label>
                  <select style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.rating}
                    onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>
              <div className="adm-field">
                <label>Review Content *</label>
                <textarea style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', minHeight: '100px', resize: 'vertical' }} value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write the review text..." />
              </div>
              <div className="adm-field">
                <label>Product Name (Optional)</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Velvet Matte Lipstick" />
              </div>
              <div className="adm-field">
                <label>Status</label>
                <select style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : editingTest ? 'Update' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialManager;
