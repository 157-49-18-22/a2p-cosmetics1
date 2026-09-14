import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Tag, Star, X, Save, Package, Upload, RefreshCw, MapPin, Globe, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const API = API_BASE_URL;

const EMPTY_FORM = { name: '', category: '', price: '', old_price: '', stock: '', image_url: '', hover_image_url: '', description: '', status: 'Active', images: [], images_360: [], meta_title: '', meta_description: '', meta_keywords: '', sirv_spin_url: '', delivery_pincodes: [], all_india_delivery: false };

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
      old_price: p.old_price || '',
      stock: p.stock, 
      image_url: p.image_url || '', 
      hover_image_url: p.hover_image_url || '', 
      description: p.description || '', 
      status: p.status,
      images: p.images || [],
      images_360: p.images_360 || [],
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      meta_keywords: p.meta_keywords || '',
      sirv_spin_url: p.sirv_spin_url || '',
      delivery_pincodes: Array.isArray(p.delivery_pincodes) ? p.delivery_pincodes : [],
      all_india_delivery: p.all_india_delivery === 1 || p.all_india_delivery === true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return showToast('Name and price are required', 'danger');
    setSaving(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${API}/products/${editingProduct.id}` : `${API}/products`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: parseFloat(form.price), old_price: form.old_price ? parseFloat(form.old_price) : null, stock: parseInt(form.stock) || 0 }) });
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

  const handleMultipleFileUpload = async (files, field) => {
    if (!files || files.length === 0) return;
    
    // Convert to array and sort by filename naturally (e.g. frame_1.jpg, frame_2.jpg, frame_10.jpg)
    const fileArray = Array.from(files).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    
    try {
      const uploadedUrls = [];
      showToast(`Uploading ${fileArray.length} images...`, 'info');
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), ...uploadedUrls] }));
        showToast(`${uploadedUrls.length} images uploaded!`);
      }
    } catch (e) {
      showToast('Multiple upload failed', 'danger');
    }
  };

  const removeImage = (field, indexToRemove) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // ─── Pincode Helpers ─────────────────────────────────────
  const [pincodeInput, setPincodeInput] = useState('');

  const addPincodesManually = () => {
    const raw = pincodeInput.split(/[,\n\s]+/).map(p => p.trim()).filter(p => /^\d{6}$/.test(p));
    if (raw.length === 0) return showToast('Enter valid 6-digit pincodes', 'danger');
    setForm(prev => {
      const existing = new Set(prev.delivery_pincodes || []);
      raw.forEach(p => existing.add(p));
      return { ...prev, delivery_pincodes: Array.from(existing) };
    });
    setPincodeInput('');
    showToast(`${raw.length} pincode(s) added!`);
  };

  const handleExcelUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const allPins = [];
        rows.forEach(row => {
          row.forEach(cell => {
            const pin = String(cell).trim();
            if (/^\d{6}$/.test(pin)) allPins.push(pin);
          });
        });
        if (allPins.length === 0) return showToast('No valid 6-digit pincodes found in file', 'danger');
        setForm(prev => {
          const existing = new Set(prev.delivery_pincodes || []);
          allPins.forEach(p => existing.add(p));
          return { ...prev, delivery_pincodes: Array.from(existing) };
        });
        showToast(`${allPins.length} pincodes loaded from Excel!`);
      } catch (err) {
        showToast('Failed to read Excel file', 'danger');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const removePin = (pinToRemove) => {
    setForm(prev => ({ ...prev, delivery_pincodes: prev.delivery_pincodes.filter(p => p !== pinToRemove) }));
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
      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
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
        <div className="adm-card-header adm-card-header-flex">
          <div className="adm-search-container">
            <div className="adm-search">
              <Search size={16} />
              <input type="text" placeholder="Search product name or category..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <span className="adm-count-badge">{filtered.length} products</span>
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
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in">
            
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
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Final Price (₹) <span style={{ color: '#f43f5e' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                      <input type="number" style={{ width: '100%', padding: '12px 16px 12px 32px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                        value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" 
                        onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Total Price (MRP)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>₹</span>
                      <input type="number" style={{ width: '100%', padding: '12px 16px 12px 32px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                        value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} placeholder="0.00" 
                        onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                  <div className="adm-field">
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Website Stock</label>
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

                  {/* Regular Product Gallery Images */}
                  <div className="adm-field" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        Product Gallery Images <span style={{ color: '#94a3b8', fontWeight: 500 }}>(These show in the side thumbnails)</span>
                      </label>
                      <label className="adm-btn adm-btn-primary" style={{ padding: '6px 14px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.75rem', gap: '6px', background: '#3b82f6' }}>
                        <Upload size={14} />
                        Upload Gallery Images
                        <input type="file" multiple hidden accept="image/*" onChange={e => handleMultipleFileUpload(e.target.files, 'images')} />
                      </label>
                    </div>
                    <div style={{ padding: '16px', border: '1.5px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc', display: 'flex', gap: '16px', flexWrap: 'wrap', minHeight: '90px' }}>
                      {(!form.images || form.images.length === 0) ? (
                        <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          No gallery images uploaded.
                        </div>
                      ) : (
                        form.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '64px', height: '64px' }}>
                            <img src={img} alt={`gallery-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} />
                            <button 
                              onClick={() => removeImage('images', idx)}
                              style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 360° Gallery Images */}
                  <div className="adm-field" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        360° View Sequence <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Upload 8 to 24 images for smooth rotation)</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <label className="adm-btn adm-btn-primary" style={{ padding: '6px 14px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.75rem', gap: '6px', background: '#3b82f6' }}>
                          <Upload size={14} />
                          Upload Files
                          <input type="file" multiple hidden accept="image/*" onChange={e => handleMultipleFileUpload(e.target.files, 'images_360')} />
                        </label>
                        <label className="adm-btn adm-btn-outline" style={{ padding: '6px 14px', cursor: 'pointer', borderRadius: '8px', fontSize: '0.75rem', gap: '6px' }}>
                          <Upload size={14} />
                          Upload Folder
                          <input type="file" webkitdirectory="true" directory="true" hidden accept="image/*" onChange={e => handleMultipleFileUpload(e.target.files, 'images_360')} />
                        </label>
                      </div>
                    </div>
                    <div style={{ padding: '16px', border: '1.5px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc', display: 'flex', gap: '16px', flexWrap: 'wrap', minHeight: '90px' }}>
                      {(!form.images_360 || form.images_360.length === 0) ? (
                        <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                          No frames uploaded yet. Select multiple images at once to create a 360° turntable sequence.
                        </div>
                      ) : (
                        form.images_360.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '16px' }}>
                            <img src={img} alt={`frame-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} />
                            <button 
                              onClick={() => removeImage('images_360', idx)}
                              style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={12} />
                            </button>
                            <div style={{ position: 'absolute', bottom: '-22px', left: 0, width: '100%', textAlign: 'center', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>
                              #{idx + 1}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sirv 360 URL */}
                  <div className="adm-field" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>Sirv API Spin URL (Option 2)</label>
                    <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                      value={form.sirv_spin_url} onChange={e => setForm({ ...form, sirv_spin_url: e.target.value })} placeholder="e.g. https://youraccount.sirv.com/spin/product.spin" 
                      onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>If you provide a Sirv API URL here, it will override the manual 360 frames above.</p>
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

              {/* Section: SEO Configuration */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={14} />
                  </div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEO Optimization</h4>
                </div>

                <div className="adm-field" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>SEO Meta Title</label>
                  <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                    value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} placeholder="e.g. Premium Face Wash - A2P Cosmetics" 
                    onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>

                <div className="adm-field" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>SEO Meta Description</label>
                  <textarea style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', minHeight: '80px', resize: 'vertical' }} 
                    value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} placeholder="Write a short description to show in Google search results (150-160 characters)..." 
                    onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>

                <div className="adm-field">
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>SEO Meta Keywords</label>
                  <input style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }} 
                    value={form.meta_keywords} onChange={e => setForm({ ...form, meta_keywords: e.target.value })} placeholder="e.g. face wash, organic, skincare, clean beauty" 
                    onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {/* Section: Delivery Availability */}
              <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={14} />
                  </div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Availability</h4>
                </div>

                {/* All India Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '14px', background: form.all_india_delivery ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : '#f8fafc', border: `1.5px solid ${form.all_india_delivery ? '#10b981' : '#e2e8f0'}`, marginBottom: '16px', transition: '0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={18} color={form.all_india_delivery ? '#10b981' : '#94a3b8'} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: form.all_india_delivery ? '#065f46' : '#334155' }}>Available All Over India</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Product will be deliverable to every pincode in India</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, all_india_delivery: !prev.all_india_delivery, delivery_pincodes: prev.all_india_delivery ? prev.delivery_pincodes : [] }))}
                    style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: form.all_india_delivery ? '#10b981' : '#cbd5e1', position: 'relative', transition: '0.25s', flexShrink: 0 }}
                  >
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: form.all_india_delivery ? '25px' : '3px', transition: '0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>

                {/* Pincode Entry — only shown if NOT all india */}
                {!form.all_india_delivery && (
                  <div>
                    {/* Manual Entry */}
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'block' }}>
                      Add Pincodes Manually <span style={{ color: '#94a3b8', fontWeight: 500 }}>(comma or newline separated)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <textarea
                        rows={2}
                        style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                        value={pincodeInput}
                        onChange={e => setPincodeInput(e.target.value)}
                        placeholder="e.g. 110001, 400001, 560001&#10;Or paste multiple pincodes..."
                        onFocus={e => e.target.style.borderColor = '#0ea5e9'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addPincodesManually(); } }}
                      />
                      <button
                        type="button"
                        onClick={addPincodesManually}
                        className="adm-btn adm-btn-primary"
                        style={{ padding: '0 18px', borderRadius: '12px', background: '#0ea5e9', alignSelf: 'stretch', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>

                    {/* Excel Upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>OR</span>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    </div>

                    <label className="adm-btn adm-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', cursor: 'pointer', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, borderColor: '#0ea5e9', color: '#0ea5e9', marginBottom: '16px' }}>
                      <FileSpreadsheet size={16} />
                      Upload Excel / CSV File
                      <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={e => handleExcelUpload(e.target.files[0])} />
                    </label>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '16px', marginTop: '-10px' }}>
                      Excel/CSV me pincodes ki list honi chahiye (kisi bhi column me). Sab 6-digit pincodes auto-detect ho jayenge.
                    </p>

                    {/* Pincode Chips */}
                    {form.delivery_pincodes && form.delivery_pincodes.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                            <MapPin size={13} style={{ display: 'inline', marginRight: '4px', color: '#0ea5e9' }} />
                            {form.delivery_pincodes.length} pincode{form.delivery_pincodes.length !== 1 ? 's' : ''} added
                          </span>
                          <button
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, delivery_pincodes: [] }))}
                            style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                          >
                            Clear All
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                          {form.delivery_pincodes.map(pin => (
                            <div key={pin} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #bae6fd' }}>
                              {pin}
                              <button type="button" onClick={() => removePin(pin)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#0369a1', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!form.delivery_pincodes || form.delivery_pincodes.length === 0) && (
                      <div style={{ padding: '16px', border: '1.5px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                        <MapPin size={20} style={{ opacity: 0.3, display: 'block', margin: '0 auto 6px' }} />
                        No pincodes added yet. Add manually or upload Excel.
                      </div>
                    )}
                  </div>
                )}
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
