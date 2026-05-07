import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Tag, Star, X, Save, Package, Upload } from 'lucide-react';

const API = API_BASE_URL;

const EMPTY_FORM = { name: '', category: '', price: '', stock: '', image_url: '', hover_image_url: '', description: '', status: 'Active' };

const ProductManager = ({ initialCategory = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, category: initialCategory || '' });
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
    setForm({ ...EMPTY_FORM, category: initialCategory || '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ 
      name: p.name, 
      category: p.category || '', 
      price: p.price, 
      stock: p.stock, 
      image_url: p.image_url || '', 
      hover_image_url: p.hover_image_url || '', 
      description: p.description || '', 
      status: p.status 
    });
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

  const handleFileUpload = async (file, field) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.imageUrl) {
        setForm(prev => ({ ...prev, [field]: data.imageUrl }));
        showToast('Image uploaded successfully!');
      }
    } catch (e) {
      showToast('Upload failed', 'danger');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(search.toLowerCase());
    if (initialCategory) {
      // If we are in category-specific view, only show products of that category slug
      return matchesSearch && (p.category?.toLowerCase() === initialCategory.toLowerCase());
    }
    return matchesSearch;
  });

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
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {initialCategory ? `${initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)} Products` : 'Master Product List'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {initialCategory ? `Showing all products in ${initialCategory} category.` : 'Manage all product details, pricing, and visibility.'}
          </p>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '640px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, #f8fafc, #fff)' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {editingProduct ? <Edit2 size={20} color="#3b82f6" /> : <Plus size={20} color="#3b82f6" />}
                  {editingProduct ? 'Update Product' : 'Add New Product'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Fill in the details below to {editingProduct ? 'modify' : 'create'} your product.</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)} style={{ borderRadius: '12px' }}><X size={18} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Section: Basic Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={14} />
                  </div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Information</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Product Name <span style={{ color: '#f43f5e' }}>*</span></label>
                    <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', transition: '0.2s', outline: 'none' }} 
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Face Wash Neem" 
                      onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="adm-field">
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Category</label>
                      <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                        value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Face Wash" 
                        onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                    <div className="adm-field">
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Status</label>
                      <select style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }} 
                        value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Inventory & Pricing */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={14} />
                  </div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory & Pricing</h4>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Price (₹) <span style={{ color: '#f43f5e' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                      <input type="number" style={{ width: '100%', padding: '12px 16px 12px 32px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                        value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" 
                        onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Stock Quantity</label>
                    <input type="number" style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                      value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" 
                      onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
              </div>

              {/* Section: Media */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef2f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={14} />
                  </div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Media</h4>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Primary Image */}
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Primary Image</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.8rem', outline: 'none' }} 
                          value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="URL or Upload..." />
                      </div>
                      <label className="adm-btn adm-btn-outline" style={{ padding: '0 14px', cursor: 'pointer', borderRadius: '12px' }}>
                        <Upload size={16} />
                        <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'image_url')} />
                      </label>
                    </div>
                    {form.image_url && <img src={form.image_url} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '8px', marginTop: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />}
                  </div>
                  
                  {/* Hover Image */}
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Hover Image</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.8rem', outline: 'none' }} 
                          value={form.hover_image_url} onChange={e => setForm({ ...form, hover_image_url: e.target.value })} placeholder="URL or Upload..." />
                      </div>
                      <label className="adm-btn adm-btn-outline" style={{ padding: '0 14px', cursor: 'pointer', borderRadius: '12px' }}>
                        <Upload size={16} />
                        <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'hover_image_url')} />
                      </label>
                    </div>
                    {form.hover_image_url && <img src={form.hover_image_url} alt="preview" style={{ width: '50px', height: '50px', borderRadius: '8px', marginTop: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />}
                  </div>
                </div>
              </div>

              {/* Section: Description */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '10px', display: 'block' }}>Product Description</label>
                <textarea style={{ width: '100%', padding: '16px', border: '1.5px solid #e2e8f0', borderRadius: '16px', fontSize: '0.9rem', minHeight: '120px', outline: 'none', resize: 'vertical', background: '#f8fafc' }} 
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Write a compelling description for your product..." 
                  onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)} style={{ borderRadius: '12px', padding: '12px 24px' }}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: '12px', padding: '12px 32px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save size={18} />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
