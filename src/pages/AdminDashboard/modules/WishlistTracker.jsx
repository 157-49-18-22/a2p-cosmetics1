import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Heart, Search, RefreshCw, TrendingUp, Users, Package } from 'lucide-react';

const WishlistTracker = () => {
  const [wishlists, setWishlists] = useState([]);
  const [stats, setStats] = useState({ total: 0, topProducts: [], topCustomers: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wlRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/wishlist-tracker/admin/all`),
        fetch(`${API_BASE_URL}/wishlist-tracker/admin/stats`)
      ]);
      const wlData = await wlRes.json();
      const statsData = await statsRes.json();
      if (Array.isArray(wlData)) setWishlists(wlData);
      if (statsData) setStats(statsData);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const grouped = wishlists.reduce((acc, item) => {
    const key = item.customer_id || 'guest';
    if (!acc[key]) {
      acc[key] = {
        customer_id: item.customer_id,
        name: item.customer_name || 'Guest',
        email: item.customer_email || '',
        phone: item.customer_phone || '',
        tier: item.customer_tier || 'Bronze',
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const groupedList = Object.values(grouped).filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    g.phone?.includes(search) ||
    g.items.some(i => i.product_name?.toLowerCase().includes(search.toLowerCase()))
  );

  const uniqueProducts = [...new Set(wishlists.map(w => w.product_name).filter(Boolean))];

  const stockBadge = (stock, status) => {
    if (status === 'Out of Stock' || stock === 0) return { label: 'Out of Stock', color: '#f43f5e' };
    if (stock < 10) return { label: 'Low Stock', color: '#f97316' };
    return { label: 'In Stock', color: '#10b981' };
  };

  const tierColor = (tier) => {
    if (tier === 'Gold') return '#f59e0b';
    if (tier === 'Silver') return '#94a3b8';
    return '#cd7c4f';
  };

  return (
    <div className="adm-fade-in">
      {/* Header */}
      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Wishlist Tracker</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>See which customers saved which products to their wishlist.</p>
        </div>
        <button className="adm-btn adm-btn-outline" onClick={fetchData} style={{ borderRadius: '10px', gap: '6px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Wishlist Items', value: stats.total || 0, icon: Heart, color: '#f43f5e', bg: '#fef2f2' },
          { label: 'Unique Customers', value: Object.keys(grouped).length, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Products Wishlisted', value: uniqueProducts.length, icon: Package, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Top Product Saves', value: stats.topProducts?.[0]?.wishlist_count || 0, icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</span>
              <div style={{ background: s.bg, color: s.color, borderRadius: '8px', padding: '6px', display: 'flex' }}><s.icon size={16} /></div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="adm-card">
        <div className="adm-card-header adm-card-header-flex">
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Customer Wishlists</h3>
          <div className="adm-search">
            <Search size={14} />
            <input type="text" placeholder="Search by customer name, phone or product..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading wishlist data...</div>
          ) : groupedList.length === 0 ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
              <Heart size={48} style={{ opacity: 0.15, display: 'block', margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 600 }}>No wishlist data yet.</p>
              <p style={{ fontSize: '0.82rem' }}>Customers must be logged in and add products to wishlist for tracking to work.</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Image</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {groupedList.map((customer) =>
                  customer.items.map((item, i) => {
                    const badge = stockBadge(item.product_stock, item.product_status);
                    return (
                      <tr key={`${customer.customer_id}-${i}`}>
                        {/* Product Image */}
                        <td>
                          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.product_image
                              ? <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                              : <Package size={20} style={{ color: '#cbd5e1' }} />
                            }
                          </div>
                        </td>

                        {/* Product Name */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{item.product_name || '—'}</div>
                        </td>

                        {/* SKU */}
                        <td>
                          <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', color: '#475569' }}>
                            {item.product_sku || '—'}
                          </code>
                        </td>

                        {/* Category */}
                        <td style={{ fontSize: '0.83rem', color: '#64748b' }}>{item.product_category || '—'}</td>

                        {/* Price */}
                        <td style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          ₹{parseFloat(item.product_price || 0).toFixed(0)}
                        </td>

                        {/* Stock Badge */}
                        <td>
                          <span style={{ fontSize: '0.72rem', background: badge.color + '18', color: badge.color, borderRadius: '8px', padding: '3px 10px', fontWeight: 700 }}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                              {customer.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{customer.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{customer.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td style={{ fontSize: '0.83rem', color: '#475569', fontWeight: 600 }}>
                          {customer.phone || <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>

                        {/* Date */}
                        <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {item.added_at ? new Date(item.added_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistTracker;
