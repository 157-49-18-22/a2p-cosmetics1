import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Activity, Heart, Layers, AlertTriangle, Briefcase, Globe } from 'lucide-react';

const API = API_BASE_URL;

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
    { label: 'Total Products', value: stats.total_products, icon: Package, color: '#3b82f6', sub: 'In Inventory', isUp: true },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: '#10b981', sub: 'Processed orders', isUp: true },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: '#8b5cf6', sub: 'Registered users', isUp: true },
    { label: 'Total Agents', value: stats.total_agents, icon: Briefcase, color: '#f59e0b', sub: 'Active agents', isUp: true },
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

      <div className="adm-main-grid">
        {/* Quick Actions */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Admin Hub — Quick Actions</h3>
          </div>
          <div className="adm-card-body">
            <div className="adm-quick-actions-grid">
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

      <div className="adm-main-grid" style={{ marginTop: '24px' }}>
        {/* Recent Orders */}
        <div className="adm-card">
          <div className="adm-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={18} />
              </div>
              <h3 className="adm-card-title">Recent Orders</h3>
            </div>
            <button className="adm-btn adm-btn-outline" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>View Orders</button>
          </div>
          <div className="adm-card-body" style={{ padding: '0' }}>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: '24px' }}>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_orders?.map((o, i) => (
                    <tr key={i}>
                      <td style={{ paddingLeft: '24px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3b82f6' }}>#{o.order_number.split('-')[1] || o.order_number}</span>
                      </td>
                      <td>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{o.customer_name}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>{o.customer_email}</p>
                      </td>
                      <td style={{ fontWeight: 800 }}>₹{o.total_amount}</td>
                      <td>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 800, 
                          padding: '4px 10px', 
                          borderRadius: '20px',
                          background: o.order_status === 'Delivered' ? '#dcfce7' : '#fef9c3',
                          color: o.order_status === 'Delivered' ? '#15803d' : '#a16207'
                        }}>
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Joinees</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '0' }}>
            <div style={{ padding: '16px' }}>
              {stats?.recent_users?.map((u, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748b' }}>
                    {u.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{u.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{u.type}</span>
                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>{new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.recent_users || stats.recent_users.length === 0) && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No recent users</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
