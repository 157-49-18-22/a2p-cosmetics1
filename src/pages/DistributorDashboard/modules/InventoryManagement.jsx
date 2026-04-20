import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingDown, ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';

const products = [
  { id: 'SKU001', name: 'A2P Face Wash Neem', category: 'Face Care', stock: 320, minStock: 50, price: '₹149', status: 'In Stock' },
  { id: 'SKU002', name: 'A2P Face Serum Vit-C', category: 'Face Care', stock: 42, minStock: 50, price: '₹399', status: 'Low Stock' },
  { id: 'SKU003', name: 'A2P Body Wash Rose', category: 'Body Care', stock: 0, minStock: 30, price: '₹249', status: 'Out of Stock' },
  { id: 'SKU004', name: 'A2P Face Cream SPF', category: 'Face Care', stock: 185, minStock: 40, price: '₹299', status: 'In Stock' },
  { id: 'SKU005', name: 'A2P Lip Balm Berry', category: 'Lips', stock: 27, minStock: 30, price: '₹89', status: 'Low Stock' },
  { id: 'SKU006', name: 'A2P Hair Serum Argan', category: 'Hair Care', stock: 210, minStock: 60, price: '₹349', status: 'In Stock' },
];

const statusBadge = (s) => ({
  'In Stock': <span className="dd-badge dd-badge-green">{s}</span>,
  'Low Stock': <span className="dd-badge dd-badge-yellow"><AlertTriangle size={10} style={{ marginRight: 4 }} />{s}</span>,
  'Out of Stock': <span className="dd-badge dd-badge-red">{s}</span>,
}[s]);

const InventoryManagement = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Face Care', 'Body Care', 'Lips', 'Hair Care'];
  const filtered = products.filter(p =>
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const lowStock = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;

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
          { label: 'In Stock', value: products.filter(p => p.status === 'In Stock').length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Low / Out of Stock', value: lowStock, color: '#fffbeb', iconColor: '#d97706' },
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

      {/* Add Product Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Add New Product</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Product Name</label><input placeholder="e.g. A2P Face Wash" /></div>
              <div className="dd-field"><label>SKU ID</label><input placeholder="e.g. SKU007" /></div>
              <div className="dd-field"><label>Category</label><select>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="dd-field"><label>MRP (₹)</label><input placeholder="e.g. 299" type="number" /></div>
              <div className="dd-field"><label>Opening Stock</label><input placeholder="Units" type="number" /></div>
              <div className="dd-field"><label>Minimum Stock Level</label><input placeholder="Alert below this" type="number" /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><Package size={14} /> Save Product</button>
            </div>
          </div>
        </div>
      )}

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
              <tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Stock</th><th>Min. Stock</th><th>MRP</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 600 }}>{p.id}</td>
                  <td style={{ fontWeight: 600, color: '#1e1b2e' }}>{p.name}</td>
                  <td><span className="dd-badge dd-badge-blue">{p.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 70, height: 5, background: '#f0eef8', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${Math.min(100, (p.stock / (p.minStock * 5)) * 100)}%`,
                          background: p.stock === 0 ? '#e11d48' : p.stock < p.minStock ? '#d97706' : '#16a34a'
                        }} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.stock}</span>
                    </div>
                  </td>
                  <td style={{ color: '#9ca3af' }}>{p.minStock}</td>
                  <td style={{ fontWeight: 600 }}>{p.price}</td>
                  <td>{statusBadge(p.status)}</td>
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
