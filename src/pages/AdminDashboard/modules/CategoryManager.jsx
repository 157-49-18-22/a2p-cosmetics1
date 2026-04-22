import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ExternalLink, X, Save, Layers } from 'lucide-react';

const API = 'http://localhost:5000/api';
const EMPTY_FORM = { name: '', slug: '', image_url: '', status: 'Active' };

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      showToast('Failed to load categories', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openAdd = () => { setEditingCat(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => { setEditingCat(c); setForm({ name: c.name, slug: c.slug, image_url: c.image_url || '', status: c.status }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.slug) return showToast('Name and slug are required', 'danger');
    setSaving(true);
    try {
      const method = editingCat ? 'PUT' : 'POST';
      const url = editingCat ? `${API}/categories/${editingCat.id}` : `${API}/categories`;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Save failed');
      showToast(editingCat ? 'Category updated!' : 'Category added!');
      setShowModal(false);
      fetchCategories();
    } catch (e) {
      showToast('Save failed. Check backend.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
      showToast('Category deleted');
      fetchCategories();
    } catch (e) {
      showToast('Delete failed', 'danger');
    }
  };

  const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="adm-fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Category Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Organize and classify your entire product range.</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}><Plus size={18} /> Add Category</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-search">
            <Search size={16} />
            <input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{filtered.length} categories</span>
        </div>
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Layers size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Layers size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p>No categories found. Add your first category!</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0' }} onError={e => e.target.style.display='none'} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Layers size={18} color="#94a3b8" />
                        </div>
                      )}
                    </td>
                    <td><div style={{ fontWeight: 700 }}>{cat.name}</div></td>
                    <td><code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>/{cat.slug}</code></td>
                    <td>
                      <span className={`adm-badge adm-badge-${cat.status === 'Active' ? 'success' : 'danger'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="adm-icon-btn" title="Edit" onClick={() => openEdit(cat)}><Edit2 size={14} /></button>
                        <button className="adm-icon-btn" title="Delete" style={{ color: '#f43f5e' }} onClick={() => handleDelete(cat.id, cat.name)}><Trash2 size={14} /></button>
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
          <div style={{ background: '#fff', borderRadius: '20px', width: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="adm-field">
                <label>Category Name *</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value, slug: !editingCat ? autoSlug(e.target.value) : form.slug })} placeholder="e.g. Face Wash" />
              </div>
              <div className="adm-field">
                <label>Slug *</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'monospace' }} value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="face-wash" />
              </div>
              <div className="adm-field">
                <label>Image URL</label>
                <input style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="adm-field">
                <label>Status</label>
                <select style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }} value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : editingCat ? 'Update' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
