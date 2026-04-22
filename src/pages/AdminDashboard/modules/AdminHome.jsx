import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Activity, Heart, Layers, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:5000/api';

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/admin/stats`);
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: 'Total Products', value: stats.total_products, icon: Package, color: '#3b82f6', sub: `${stats.out_of_stock} out of stock`, isUp: true },
    { label: 'Total Categories', value: stats.total_categories, icon: Layers, color: '#8b5cf6', sub: 'Active categories', isUp: true },
    { label: 'Cart Orders', value: stats.cart_orders, icon: ShoppingCart, color: '#10b981', sub: 'Items currently in carts', isUp: true },
    { label: 'Wishlist Items', value: stats.wishlist_count, icon: Heart, color: '#f43f5e', sub: 'Across all users', isUp: true },
  ] : [];

  const alertCards = stats ? [
    stats.low_stock > 0 && { type: 'warning', icon: AlertTriangle, msg: `${stats.low_stock} product(s) running low on stock (< 50 units)`, color: '#f59e0b' },
    stats.out_of_stock > 0 && { type: 'danger', icon: AlertTriangle, msg: `${stats.out_of_stock} product(s) are completely out of stock`, color: '#f43f5e' },
  ].filter(Boolean) : [];

  return (
    <div>
      {/* Alert Bar */}
      {alertCards.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alertCards.map((a, i) => (
            <div key={i} style={{ background: `${a.color}15`, border: `1px solid ${a.color}40`, borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a.icon size={18} color={a.color} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="adm-stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="adm-stat-box" style={{ opacity: 0.5 }}>
              <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '10px', width: '80px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ height: '22px', width: '60px', background: '#f1f5f9', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="adm-stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="adm-stat-box">
              <div className="adm-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={24} />
              </div>
              <div className="adm-stat-details">
                <span>{s.label}</span>
                <h3>{s.value}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', marginTop: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>{s.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Quick Actions */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Admin Hub — Quick Actions</h3>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Add New Product', desc: 'Create product listing with price & stock', color: '#3b82f6', icon: Package },
                { label: 'Add Category', desc: 'Create a new product category', color: '#8b5cf6', icon: Layers },
                { label: 'Edit Hero Banner', desc: 'Update home page headline & CTA', color: '#10b981', icon: Activity },
                { label: 'Update Inventory', desc: 'Adjust stock quantities for products', color: '#f59e0b', icon: TrendingUp },
              ].map((action, i) => (
                <div key={i} style={{ padding: '18px', borderRadius: '14px', border: `1.5px solid ${action.color}20`, background: `${action.color}08`, cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{ width: '36px', height: '36px', background: `${action.color}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                    <action.icon size={18} color={action.color} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 4px' }}>{action.label}</p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{action.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Channel */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Revenue by Channel</h3>
          </div>
          <div className="adm-card-body">
            {[
              { l: 'Direct Sales', p: 45, c: '#3b82f6' },
              { l: 'Distributors', p: 30, c: '#8b5cf6' },
              { l: 'Agent Referrals', p: 15, c: '#10b981' },
              { l: 'Offline Stores', p: 10, c: '#f59e0b' },
            ].map((ch, i) => (
              <div key={i} style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ch.l}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ch.p}%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <div style={{ width: `${ch.p}%`, height: '100%', background: ch.c, borderRadius: '10px', transition: '1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
