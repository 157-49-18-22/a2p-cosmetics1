import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, AlertTriangle, TrendingDown, ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

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

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory`);
      setProducts(res.data.products);

      // Extract unique categories
      const cats = ['All', ...new Set(res.data.products.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = products.filter(p =>
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || (p.id && p.id.toString().includes(search.toLowerCase())))
  );

  const lowStockCount = products.filter(p => p.stock < 50).length;

  if (loading) return <div className="dd-loading">Loading Inventory...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Inventory Management</h1>
          <p className="dd-module-subtitle">Track stock levels, manage products and reorder alerts</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline">Export</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Product</button>
        </div>
      </div>

      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: products.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'In Stock', value: products.filter(p => p.stock >= 50).length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Low / Out of Stock', value: lowStockCount, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Stock Units', value: products.reduce((a, p) => a + p.stock, 0).toLocaleString(), color: '#eff6ff', iconColor: '#2563eb' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <Package size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid', borderColor: filter === c ? '#a855f7' : '#ede9f5',
                background: filter === c ? '#f3eeff' : '#fff', color: filter === c ? '#7c3aed' : '#6b7280',
                transition: 'all 0.2s'
              }}>{c}</button>
            ))}
          </div>
          <div className="dd-search-inline">
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead>
              <tr><th>ID</th><th>Product Name</th><th>Category</th><th>Stock</th><th>Min. Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 600 }}>#{p.id}</td>
                  <td style={{ fontWeight: 600, color: '#1e1b2e' }}>{p.name}</td>
                  <td><span className="dd-badge dd-badge-blue">{p.category || 'N/A'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 70, height: 5, background: '#f0eef8', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${Math.min(100, (p.stock / 250) * 100)}%`,
                          background: p.stock === 0 ? '#e11d48' : p.stock < 50 ? '#d97706' : '#16a34a'
                        }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{ color: '#9ca3af' }}>50</td>
                  <td>{statusBadge(p.stock)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><ArrowUp size={13} /></button>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Edit2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;


