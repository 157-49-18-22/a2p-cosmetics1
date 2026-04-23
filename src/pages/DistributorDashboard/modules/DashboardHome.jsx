import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, Package, Users, FileText,
  Star, Map, Megaphone, ArrowRight, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/distributor';

const DashboardHome = () => {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const distributorId = 1; // Default for now

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${API_BASE}/stats/${distributorId}`);
        const activityRes = await axios.get(`${API_BASE}/activity/${distributorId}`);

        const rawStats = statsRes.data;
        const formattedStats = [
          { label: 'Total Dealers', value: rawStats.total_dealers, change: '+8', up: true, icon: Users, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Active Orders', value: rawStats.active_orders, change: '+5', up: true, icon: Package, color: '#fff0f9', iconColor: '#ec4899' },
          { label: 'Monthly Revenue', value: `₹${(rawStats.monthly_revenue / 100000).toFixed(1)}L`, change: '+12%', up: true, icon: TrendingUp, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Pending Bills', value: rawStats.pending_bills, change: '-3', up: false, icon: FileText, color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Zones Covered', value: rawStats.zones_covered, change: '+1', up: true, icon: Map, color: '#eff6ff', iconColor: '#2563eb' },
          { label: 'Super Stockists', value: rawStats.super_stockists, change: '0', up: true, icon: Star, color: '#fdf4ff', iconColor: '#c026d3' },
        ];

        setStats(formattedStats);
        setActivities(activityRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return { icon: CheckCircle, color: '#16a34a' };
      case 'invoice': return { icon: FileText, color: '#2563eb' };
      case 'warning': return { icon: AlertCircle, color: '#d97706' };
      default: return { icon: Clock, color: '#6b7280' };
    }
  };

  const quickActions = [
    { label: 'Add Dealer', icon: Users, color: '#a855f7' },
    { label: 'Create Invoice', icon: FileText, color: '#ec4899' },
    { label: 'Update Stock', icon: Package, color: '#16a34a' },
    { label: 'Assign Area', icon: Map, color: '#2563eb' },
  ];

  if (loading) return <div className="dd-loading">Loading Dashboard...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Welcome back, Rahul 👋</h1>
          <p className="dd-module-subtitle">Here's what's happening with your distribution network today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline">Export Report</button>
          <button className="dd-btn dd-btn-primary">+ New Order</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid">
        {stats.map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <s.icon size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
            <div className={`dd-stat-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.change} this month
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Activity */}
        <div className="dd-card">
          <div className="dd-card-header">
            <span className="dd-card-title">Recent Activity</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>View All <ArrowRight size={13} /></button>
          </div>
          <div className="dd-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activities.length > 0 ? activities.map((a, i) => {
              const { icon: Icon, color } = getActivityIcon(a.activity_type);
              return (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Icon size={16} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.82rem', color: '#374151' }}>{a.activity_text}</p>
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            }) : <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>No recent activity</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dd-card">
          <div className="dd-card-header">
            <span className="dd-card-title">Quick Actions</span>
          </div>
          <div className="dd-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {quickActions.map((q, i) => (
              <button key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '18px 12px', borderRadius: 14, border: '1.5px solid #ede9f5',
                background: '#faf8ff', cursor: 'pointer', transition: 'all 0.22s', color: '#374151',
                fontSize: '0.78rem', fontWeight: 600
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = q.color; e.currentTarget.style.background = '#f5f0ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9f5'; e.currentTarget.style.background = '#faf8ff'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <q.icon size={18} color={q.color} />
                </div>
                {q.label}
              </button>
            ))}
          </div>

          <div className="dd-divider" style={{ margin: '0 22px' }} />
          <div className="dd-card-body" style={{ paddingTop: 0 }}>
            <p style={{ fontSize: '0.77rem', fontWeight: 700, color: '#4a0f8a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Performers</p>
            {[
              { name: 'Sharma Traders', zone: 'Zone A', rev: '₹82K' },
              { name: 'Mehta Co.', zone: 'Zone C', rev: '₹74K' },
              { name: 'Ravi Dist.', zone: 'Zone B', rev: '₹68K' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f5f4f9' : 'none' }}>
                <div>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e1b2e' }}>{p.name}</p>
                  <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{p.zone}</p>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>{p.rev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;


