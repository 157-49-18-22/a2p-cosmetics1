import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Tag, Star, X, Save, Package } from 'lucide-react';

const API = 'http://localhost:5000/api';

const EMPTY_FORM = { name: '', category: '', price: '', stock: '', image_url: '', description: '', status: 'Active' };

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      showToast('Failed to load products', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category || '', price: p.price, stock: p.stock, image_url: p.image_url || '', description: p.description || '', status: p.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return showToast('Name and price are required', 'danger');
    setSaving(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${API}/products/${editingProduct.id}` : `${API}/products`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }) });
      if (!res.ok) throw new Error('Save failed');
      showToast(editingProduct ? 'Product updated!' : 'Product added!');
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      showToast('Save failed. Check backend.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`${API}/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted');
      fetchProducts();
    } catch (e) {
      showToast('Delete failed', 'danger');
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'adm-fade-slide 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Master Product List</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage all product details, pricing, and visibility.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}><Plus size={18} /> New Product</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
            <div className="adm-search" style={{ width: '380px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search product name or category..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{filtered.length} products</span>
        </div>

        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              Loading products...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p>No products found. Add your first product!</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display='none'} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={18} color="#94a3b8" />
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: 700, display: 'block' }}>{p.name}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: #{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="adm-badge adm-badge-info" style={{ fontWeight: 600 }}>{p.category || '—'}</span></td>
                    <td><span style={{ fontWeight: 800 }}>₹{parseFloat(p.price).toFixed(0)}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                          <div style={{ width: `${Math.min((p.stock / 200) * 100, 100)}%`, height: '100%', background: p.stock === 0 ? '#f43f5e' : p.stock < 50 ? '#f59e0b' : '#10b981', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.stock === 0 ? '#f43f5e' : 'inherit' }}>{p.stock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge adm-badge-${p.status === 'Active' ? 'success' : p.status === 'Out of Stock' ? 'warning' : 'danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="adm-icon-btn" title="Edit" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                        <button className="adm-icon-btn" title="Delete" style={{ color: '#f43f5e' }} onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="adm-field">
                <label>Product Name *</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Face Wash Neem" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="adm-field">
                  <label>Price (₹) *</label>
                  <input type="number" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="149" />
                </div>
                <div className="adm-field">
                  <label>Stock Quantity</label>
                  <input type="number" style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="100" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="adm-field">
                  <label>Category</label>
                  <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Face Wash" />
                </div>
                <div className="adm-field">
                  <label>Status</label>
                  <select style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="adm-field">
                <label>Image URL</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="adm-field">
                <label>Description</label>
                <textarea style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
