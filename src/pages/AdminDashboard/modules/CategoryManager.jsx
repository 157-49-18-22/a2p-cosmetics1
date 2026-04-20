import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, ExternalLink } from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Face Wash', slug: 'face-wash', count: 12, status: 'Active', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100&h=100&fit=crop' },
    { id: 2, name: 'Serums', slug: 'serums', count: 8, status: 'Active', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop' },
    { id: 3, name: 'Moisturizers', slug: 'moisturizers', count: 15, status: 'Active', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=100&h=100&fit=crop' },
    { id: 4, name: 'Body Care', slug: 'body-care', count: 20, status: 'Active', image: 'https://images.unsplash.com/photo-1552046122-03184de85e08?w=100&h=100&fit=crop' },
    { id: 5, name: 'Sun Protection', slug: 'sun-protection', count: 6, status: 'Inactive', image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=100&h=100&fit=crop' },
  ]);

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Category Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Organize and classify your entire product range.</p>
        </div>
        <button className="adm-btn adm-btn-primary"><Plus size={18} /> Add Category</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-search">
            <Search size={16} />
            <input type="text" placeholder="Search categories..." />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="adm-btn adm-btn-outline">Import</button>
            <button className="adm-btn adm-btn-outline">Export</button>
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <img src={cat.image} alt={cat.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'crop' }} />
                  </td>
                  <td><div style={{ fontWeight: 700 }}>{cat.name}</div></td>
                  <td><code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>/{cat.slug}</code></td>
                  <td style={{ fontWeight: 600 }}>{cat.count}</td>
                  <td>
                    <span className={`adm-badge adm-badge-${cat.status === 'Active' ? 'success' : 'danger'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adm-icon-btn"><Edit2 size={14} /></button>
                      <button className="adm-icon-btn"><ExternalLink size={14} /></button>
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

export default CategoryManager;
