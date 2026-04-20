import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const AdminHome = () => {
  const stats = [
    { label: 'Net Revenue', value: '₹42.8L', icon: DollarSign, trend: '+12.5%', isUp: true, color: '#3b82f6' },
    { label: 'Total Orders', value: '1,482', icon: ShoppingCart, trend: '+4.2%', isUp: true, color: '#10b981' },
    { label: 'Active Retailers', value: '840', icon: Users, trend: '-1.8%', isUp: false, color: '#f59e0b' },
    { label: 'Site Traffic', value: '24K', icon: Activity, trend: '+22.4%', isUp: true, color: '#8b5cf6' },
  ];

  return (
    <div>
      <div className="adm-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="adm-stat-box">
            <div className="adm-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
              <s.icon size={24} />
            </div>
            <div className="adm-stat-details">
              <span>{s.label}</span>
              <h3>{s.value}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '4px' }}>
                {s.isUp ? <ArrowUpRight size={14} color="#10b981" /> : <ArrowDownRight size={14} color="#f43f5e" />}
                <span style={{ color: s.isUp ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{s.trend}</span>
                <span style={{ color: '#94a3b8' }}>vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent System Activity</h3>
            <button className="adm-btn adm-btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>View Logs</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { e: 'Product "Face Serum" updated', s: 'Admin Panel', st: 'Success', t: '2 mins ago' },
                  { e: 'Distributor "Sharma Ent." onboarded', s: 'CRM Module', st: 'Success', t: '15 mins ago' },
                  { e: 'Failed login attempt', s: 'Security', st: 'Warning', t: '42 mins ago' },
                  { e: 'Database backup completed', s: 'System', st: 'Success', t: '1 hr ago' },
                  { e: 'Inventory sync failure', s: 'API Gateway', st: 'Danger', t: '2 hrs ago' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.e}</td>
                    <td style={{ color: '#64748b' }}>{row.s}</td>
                    <td><span className={`adm-badge adm-badge-${row.st.toLowerCase()}`}>{row.st}</span></td>
                    <td style={{ color: '#94a3b8' }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                  <div style={{ width: `${ch.p}%`, height: '100%', background: ch.c, borderRadius: '10px' }} />
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
