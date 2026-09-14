import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useSession } from '../../../hooks/useSession.js';
import { 
  Package, Search, AlertTriangle, 
  CheckCircle, X, ShoppingBag, ShoppingCart, Download, Eye, Layers
} from 'lucide-react';

const API_BASE = API_BASE_URL;

const statusBadge = (stock, minStock = 50) => {
  if (stock === 0) return <span className="dd-badge dd-badge-red">Out of Stock</span>;
  if (stock < minStock) return <span className="dd-badge dd-badge-yellow"><AlertTriangle size={10} style={{ marginRight: 4 }} />Low Stock</span>;
  return <span className="dd-badge dd-badge-green">In Stock</span>;
};

const InventoryManagement = ({ setActiveModule }) => {
  const { user: authUser } = useAuth();
  const { user: sessionUser } = useSession();
  const localDist = JSON.parse(localStorage.getItem('active_distributor') || localStorage.getItem('distributor_user') || '{}');
  const distributor = authUser || sessionUser || localDist;
  const distId = distributor?.id || 1;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const id = distId || 1;
      let prods = [];
      try {
        const res = await axios.get(`${API_BASE}/distributors/${id}/inventory`);
        prods = res.data.products || (Array.isArray(res.data) ? res.data : []);
      } catch (e1) {
        const res2 = await axios.get(`${API_BASE}/inventory?distributor_id=${id}`);
        prods = res2.data.products || (Array.isArray(res2.data) ? res2.data : []);
      }
      setProducts(prods);
      const cats = ['All', ...new Set(prods.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [distId]);

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
    link.setAttribute('download', `A2P_Distributor_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
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
        <div className="dd-header-info">
          <h1 className="dd-module-title">Inventory Management</h1>
          <p className="dd-module-subtitle">View your allocated stock levels and request new stock from Admin.</p>
        </div>
        <div className="dd-header-btns">
          <button className="dd-btn dd-btn-outline" onClick={handleExport} style={{ borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Export Catalog
          </button>
          <button 
            className="dd-btn dd-btn-primary" 
            onClick={() => setActiveModule && setActiveModule('stock_request')} 
            style={{ borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ShoppingCart size={16} /> Request Stock (Indent)
          </button>
        </div>
      </div>

      <div className="dd-stats-grid">
        {[
          { label: 'Total Catalog Products', value: products.length, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'In Stock (>50)', value: products.filter(p => p.stock >= 50).length, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Low / Out of Stock', value: lowStockCount, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Total Units Available', value: products.reduce((a, p) => a + (p.stock || 0), 0).toLocaleString(), color: '#eff6ff', iconColor: '#2563eb' },
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
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 16, padding: '20px 24px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'stretch' : 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`cat-pill ${filter === c ? 'active' : ''}`}>{c}</button>
            ))}
          </div>
          <div className="dd-search-inline" style={{ width: window.innerWidth <= 768 ? '100%' : 300, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="dd-table-wrap" style={{ padding: '0 24px 24px' }}>
          <table className="dd-table">
            <thead>
              <tr><th>ID</th><th>Product</th><th>Category</th><th>Distributor Stock</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#7c3aed', fontWeight: 800 }}>#{p.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={18} color="#64748b" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>₹{p.price}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cat-tag">{p.category || 'General'}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                            <span style={{ color: (p.stock || 0) === 0 ? '#ef4444' : (p.stock || 0) < 50 ? '#d97706' : '#10b981' }}>
                              {p.stock || 0} Units
                            </span>
                            <span style={{ color: '#94a3b8' }}>Min: 50</span>
                         </div>
                         <div className="stock-progress-bg">
                            <div className="stock-progress-bar" style={{ 
                              width: `${Math.min(100, ((p.stock || 0) / 200) * 100)}%`,
                              background: (p.stock || 0) === 0 ? '#ef4444' : (p.stock || 0) < 50 ? '#f59e0b' : '#10b981'
                            }} />
                         </div>
                      </div>
                    </td>
                    <td>{statusBadge(p.stock || 0)}</td>
                    <td>
                       <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button 
                            className="row-btn" 
                            onClick={() => setSelectedProduct(p)} 
                            title="View Product Details"
                            style={{ color: '#475569' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            className="dd-btn-sm" 
                            onClick={() => setActiveModule && setActiveModule('stock_request')} 
                            title="Request Stock via Indenting"
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              background: '#f3eeff', 
                              color: '#7c3aed', 
                              border: '1px solid #ddd6fe', 
                              fontWeight: 700, 
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ShoppingCart size={13} /> Indent
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="dd-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="dd-modal-box adm-fade-in" style={{ width: 'min(440px, 95%)' }} onClick={e => e.stopPropagation()}>
             <div className="dd-modal-header-fancy">
                <div>
                   <h3 className="modal-title">Product Details</h3>
                   <p className="modal-subtitle">Catalog & Stock Information</p>
                </div>
                <button className="dd-modal-close" onClick={() => setSelectedProduct(null)}><X size={20} /></button>
             </div>
             <div className="dd-modal-content-fancy" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selectedProduct.image_url && (
                  <div style={{ textAlign: 'center' }}>
                    <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                   <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Product Name:</span>
                   <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 800 }}>{selectedProduct.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                   <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
                   <span className="cat-tag">{selectedProduct.category || 'General'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                   <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Retail Price:</span>
                   <span style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>₹{selectedProduct.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                   <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Your Available Stock:</span>
                   <span style={{ fontSize: '1rem', color: (selectedProduct.stock || 0) > 0 ? '#7c3aed' : '#ef4444', fontWeight: 900 }}>
                     {selectedProduct.stock || 0} Units
                   </span>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                  ℹ️ <strong>Stock Policy:</strong> Products and pricing are managed centrally by Admin CMS. To add stock to your warehouse, please submit a request via <strong>Stock Indenting</strong>.
                </div>
                <div className="dd-modal-actions-fancy" style={{ marginTop: 6 }}>
                   <button 
                     className="dd-btn-pri" 
                     style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }} 
                     onClick={() => {
                       setSelectedProduct(null);
                       setActiveModule && setActiveModule('stock_request');
                     }}
                   >
                      <ShoppingCart size={16} /> Request Stock for this Product
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .cat-pill { padding: 6px 16px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; border: 1.5px solid #f1f5f9; background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .cat-pill.active { background: #f3eeff; border-color: #a855f7; color: #7c3aed; }
        .cat-tag { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
        .stock-progress-bg { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .stock-progress-bar { height: 100%; border-radius: 10px; transition: width 0.4s; }
        .row-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .row-btn:hover { background: #f8fafc; color: #7c3aed; border-color: #a855f7; }
        
        .dd-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .dd-modal-box { background: #fff; border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }
        .dd-modal-header-fancy { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-title { margin: 0; font-weight: 900; font-size: 1.15rem; color: #1e293b; }
        .modal-subtitle { margin: 4px 0 0; font-size: 0.78rem; color: #64748b; }
        .dd-modal-close { background: #f1f5f9; border: none; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
        .dd-input-group { display: flex; flex-direction: column; gap: 8px; }
        .dd-input-group label { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
        .dd-input-group input, .dd-input-group select { height: 48px; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 0 16px; font-size: 0.9rem; font-weight: 600; outline: none; }
        .dd-modal-actions-fancy { display: flex; gap: 12px; }
        .dd-btn-pri { height: 46px; border-radius: 14px; border: none; color: #fff; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; }
        .dd-btn-sec { height: 46px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #fff; color: #64748b; font-weight: 800; cursor: pointer; font-size: 0.85rem; }
      `}</style>
    </div>
  );
};

export default InventoryManagement;
