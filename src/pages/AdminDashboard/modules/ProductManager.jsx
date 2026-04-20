import React from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Tag, Star } from 'lucide-react';

const ProductManager = () => {
  const products = [
    { id: 'PROD-001', name: 'Face Wash Neem', cat: 'Face Wash', price: '₹149', stock: 320, rating: 4.8, status: 'Active' },
    { id: 'PROD-002', name: 'Face Serum Vit-C', cat: 'Serums', price: '₹399', stock: 42, rating: 4.9, status: 'Active' },
    { id: 'PROD-003', name: 'Moisturizer Rose', cat: 'Moisturizers', price: '₹249', stock: 156, rating: 4.7, status: 'Active' },
    { id: 'PROD-004', name: 'Body Lotion Aloe', cat: 'Body Care', price: '₹199', stock: 0, rating: 4.5, status: 'Out of Stock' },
    { id: 'PROD-005', name: 'Lip Balm Berry', cat: 'Face Wash', price: '₹89', stock: 27, rating: 4.6, status: 'Active' },
  ];

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Master Product List</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage all product details, pricing, and visibility.</p>
        </div>
        <button className="adm-btn adm-btn-primary"><Plus size={18} /> New Product</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
            <div className="adm-search" style={{ width: '380px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search product name, SKU, or category..." />
            </div>
            <button className="adm-btn adm-btn-outline"><Filter size={16} /> Filters</button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="adm-btn adm-btn-outline">Bulk Action</button>
            <button className="adm-btn adm-btn-outline">Export</button>
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700 }}>{p.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>SKU: {p.id}</span>
                    </div>
                  </td>
                  <td><span className="adm-badge adm-badge-info" style={{ fontWeight: 600 }}>{p.cat}</span></td>
                  <td><span style={{ fontWeight: 800 }}>{p.price}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
                        <div style={{ 
                          width: `${Math.min(p.stock / 2, 100)}%`, 
                          height: '100%', 
                          background: p.stock === 0 ? '#f43f5e' : (p.stock < 50 ? '#f59e0b' : '#10b981'), 
                          borderRadius: '4px' 
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.stock}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 700 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge-${p.status === 'Active' ? 'success' : 'danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adm-icon-btn"><Edit2 size={14} /></button>
                      <button className="adm-icon-btn"><Tag size={14} /></button>
                      <button className="adm-icon-btn" style={{ color: '#f43f5e' }}><Trash2 size={14} /></button>
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

export default ProductManager;
