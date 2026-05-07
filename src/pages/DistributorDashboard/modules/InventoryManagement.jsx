import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, Search, AlertTriangle, TrendingDown, ArrowDown, ArrowUp, 
  Edit2, Trash2, CheckCircle, X, ShoppingBag, CreditCard, Tag, Layers
} from 'lucide-react';

const API_BASE = API_BASE_URL;

const statusBadge = (stock, minStock = 50) => {
  if (stock === 0) return <span className="dd-badge dd-badge-red">Out of Stock</span>;
  if (stock < minStock) return <span className="dd-badge dd-badge-yellow"><AlertTriangle size={10} style={{ marginRight: 4 }} />Low Stock</span>;
  return <span className="dd-badge dd-badge-green">In Stock</span>;
};

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const [newProduct, setNewProduct] = useState({ name: '', category: 'Face Care', price: '', stock: '', status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory`);
      setProducts(res.data.products || []);
      const cats = ['All', ...new Set((res.data.products || []).map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert('Name and price are required');
    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/products/${editId}`, newProduct);
      } else {
        await axios.post(`${API_BASE}/products`, newProduct);
      }
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setNewProduct({ name: '', category: 'Face Care', price: '', stock: '', status: 'Active' });
      fetchInventory();
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (p) => {
    setNewProduct({
      name: p.name,
      category: p.category || 'Face Care',
      price: p.price,
      stock: p.stock,
      status: p.status || 'Active'
    });
    setEditId(p.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      fetchInventory();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleUpdateStock = async (id, currentStock, type) => {
    const change = type === 'up' ? 10 : -10;
    try {
      await axios.put(`${API_BASE}/inventory/${id}`, {
        quantity_change: change,
        change_type: 'Manual Update',
        agent: 'Distributor'
      });
      fetchInventory();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleExport = () => {
    if (products.length === 0) return alert('No products to export');
    
    const headers = ['ID', 'Product Name', 'Category', 'Price (₹)', 'Stock Level', 'Status'];
    const rows = products.map(p => [
      p.id,
      p.name,
      p.category || 'General',
      p.price,
      p.stock,
      p.stock === 0 ? 'Out of Stock' : p.stock < 50 ? 'Low Stock' : 'In Stock'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `A2P_Inventory_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = products.filter(p =>
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.id && p.id.toString().includes(search.toLowerCase())))
  );

  const lowStockCount = products.filter(p => p.stock < 50).length;

  if (loading) return <div className="dd-loading">Loading Inventory System...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Inventory Management</h1>
          <p className="dd-module-subtitle">Control your stock levels and product catalog.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="dd-btn dd-btn-outline" onClick={handleExport} style={{ borderRadius: 12 }}>Export Catalog</button>
          <button className="dd-btn dd-btn-primary" onClick={() => { setIsEditing(false); setNewProduct({ name: '', category: 'Face Care', price: '', stock: '', status: 'Active' }); setShowForm(true); }} style={{ borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: products.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'In Stock', value: products.filter(p => p.stock >= 50).length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Low / Out', value: lowStockCount, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Units', value: products.reduce((a, p) => a + p.stock, 0).toLocaleString(), color: '#eff6ff', iconColor: '#2563eb' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i} style={{ borderRadius: 20 }}>
            <div className="dd-stat-icon" style={{ background: s.color, borderRadius: 12 }}>
              <Package size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label" style={{ fontWeight: 700, opacity: 0.7 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="dd-card" style={{ borderRadius: 24, marginBottom: 24 }}>
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`cat-pill ${filter === c ? 'active' : ''}`}>{c}</button>
            ))}
          </div>
          <div className="dd-search-inline" style={{ width: 300, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="dd-table-wrap" style={{ padding: '0 24px 24px' }}>
          <table className="dd-table">
            <thead>
              <tr><th>ID</th><th>Product</th><th>Category</th><th>Stock Level</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 800 }}>#{p.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={18} color="#64748b" /></div>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="cat-tag">{p.category || 'General'}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span style={{ color: p.stock < 50 ? '#ef4444' : '#64748b' }}>{p.stock} Units</span>
                          <span style={{ color: '#94a3b8' }}>Limit: 50</span>
                       </div>
                       <div className="stock-progress-bg">
                          <div className="stock-progress-bar" style={{ 
                            width: `${Math.min(100, (p.stock / 200) * 100)}%`,
                            background: p.stock === 0 ? '#ef4444' : p.stock < 50 ? '#f59e0b' : '#10b981'
                          }} />
                       </div>
                    </div>
                  </td>
                  <td>{statusBadge(p.stock)}</td>
                  <td>
                     <div style={{ display: 'flex', gap: 8 }}>
                        <button className="row-btn" onClick={() => handleUpdateStock(p.id, p.stock, 'up')} title="Add 10"><ArrowUp size={14} /></button>
                        <button className="row-btn" onClick={() => handleUpdateStock(p.id, p.stock, 'down')} title="Remove 10"><ArrowDown size={14} /></button>
                        <button className="row-btn" onClick={() => handleEditClick(p)} title="Edit"><Edit2 size={14} /></button>
                        <button className="row-btn" style={{ color: '#ef4444' }} onClick={() => handleDeleteProduct(p.id)} title="Delete"><Trash2 size={14} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showForm && (
        <div className="dd-modal-overlay">
          <div className="dd-modal-box adm-fade-in" style={{ width: 480 }}>
             <div className="dd-modal-header-fancy">
                <div>
                   <h3 className="modal-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                   <p className="modal-subtitle">{isEditing ? 'Update details for this item.' : 'Define catalog details for new items.'}</p>
                </div>
                <button className="dd-modal-close" onClick={() => setShowForm(false)}><X size={20} /></button>
             </div>
             <div className="dd-modal-content-fancy" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="dd-input-group">
                   <label><Tag size={14} /> Product Name</label>
                   <input placeholder="e.g. Vitamin C Serum" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="dd-input-group">
                   <label><Layers size={14} /> Category</label>
                   <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                      <option>Face Care</option><option>Body Care</option><option>Hair Care</option><option>Fragrance</option>
                   </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                   <div className="dd-input-group">
                      <label><CreditCard size={14} /> Price (₹)</label>
                      <input type="number" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                   </div>
                   <div className="dd-input-group">
                      <label><Package size={14} /> Stock</label>
                      <input type="number" placeholder="0" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                   </div>
                </div>
                <div className="dd-modal-actions-fancy" style={{ marginTop: 10 }}>
                   <button className="dd-btn-sec" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                   <button className="dd-btn-pri" style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={handleSaveProduct} disabled={saving}>
                      <CheckCircle size={16} /> {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .cat-pill { padding: 6px 16px; border-radius: 10px; font-size: 0.8rem; fontWeight: 700; border: 1.5px solid #f1f5f9; background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .cat-pill.active { background: #f3eeff; border-color: #a855f7; color: #7c3aed; }
        .cat-tag { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; fontWeight: 800; }
        .stock-progress-bg { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .stock-progress-bar { height: 100%; border-radius: 10px; transition: width 0.4s; }
        .row-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #f1f5f9; background: #fff; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .row-btn:hover { background: #f8fafc; color: #7c3aed; border-color: #a855f7; }
        
        .dd-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .dd-modal-box { background: #fff; border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }
        .dd-modal-header-fancy { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-title { margin: 0; fontWeight: 900; fontSize: 1.15rem; color: #1e293b; }
        .modal-subtitle { margin: 4px 0 0; fontSize: 0.78rem; color: #64748b; }
        .dd-modal-close { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
        .dd-input-group { display: flex; flex-direction: column; gap: 8px; }
        .dd-input-group label { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; fontWeight: 800; color: #94a3b8; text-transform: uppercase; }
        .dd-input-group input, .dd-input-group select { height: 48px; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 0 16px; font-size: 0.9rem; fontWeight: 600; outline: none; }
        .dd-modal-actions-fancy { display: flex; gap: 12px; }
        .dd-btn-pri { height: 50px; border-radius: 14px; border: none; color: #fff; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .dd-btn-sec { height: 50px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-weight: 800; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default InventoryManagement;
