import React from 'react';
import { 
  Users, 
  TrendingUp, 
  BadgeDollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AgentHome = () => {
  const stats = [
    { label: 'Total Agents', value: '1,280', change: '+12%', up: true, icon: Users, color: '#0ea5e9' },
    { label: 'Active Referrals', value: '450', change: '+5%', up: true, icon: TrendingUp, color: '#6366f1' },
    { label: 'Total Commission', value: '₹12.5L', change: '+18%', up: true, icon: BadgeDollarSign, color: '#f59e0b' },
    { label: 'Pending Payouts', value: '₹1.2L', change: '-2%', up: false, icon: Wallet, color: '#e11d48' },
  ];

  const recentRequests = [
    { id: 'REQ-101', agent: 'Sneha Rao', type: 'Payout', amount: '₹15,000', status: 'Pending', time: '2 hrs ago' },
    { id: 'REQ-102', agent: 'Rahul Jain', type: 'Onboarding', amount: '-', status: 'Approved', time: '4 hrs ago' },
    { id: 'REQ-103', agent: 'Amit Shah', type: 'Commission', amount: '₹2,500', status: 'Rejected', time: '6 hrs ago' },
    { id: 'REQ-104', agent: 'Priya Verma', type: 'Payout', amount: '₹8,000', status: 'Approved', time: '1 day ago' },
  ];

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Agent Overview</h1>
          <p className="ag-module-subtitle">Monitor agent performance, commissions, and payouts at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ag-btn ag-btn-outline">Export Stats</button>
          <button className="ag-btn ag-btn-primary">Add New Agent</button>
        </div>
      </div>

      <div className="ag-stats-grid">
        {stats.map((stat, i) => (
          <div className="ag-stat-card" key={i}>
            <div className="ag-stat-icon" style={{ background: `${stat.color}15` }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className="ag-stat-value">{stat.value}</div>
            <div className="ag-stat-label">{stat.label}</div>
            <div className={`ag-stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.change} since last month
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '12px' }}>
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Recent Requests</h3>
            <button className="ag-btn ag-btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>View All</button>
          </div>
          <div className="ag-table-wrap">
            <table className="ag-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Agent</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#0ea5e9' }}>{req.id}</td>
                    <td>{req.agent}</td>
                    <td>{req.type}</td>
                    <td style={{ fontWeight: 600 }}>{req.amount}</td>
                    <td>
                      <span className={`ag-badge ${
                        req.status === 'Approved' ? 'ag-badge-green' : 
                        req.status === 'Pending' ? 'ag-badge-yellow' : 'ag-badge-red'
                      }`}>
                        {req.status === 'Approved' ? <CheckCircle2 size={12} style={{marginRight: 4}} /> : 
                         req.status === 'Pending' ? <Clock size={12} style={{marginRight: 4}} /> : 
                         <AlertCircle size={12} style={{marginRight: 4}} />}
                        {req.status}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{req.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Top Performing Agents</h3>
          </div>
          <div className="ag-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'Karan Mehra', tier: 'Platinum', rev: '₹2.4L', img: 'https://ui-avatars.com/api/?name=Karan+Mehra&background=6366f1&color=fff' },
              { name: 'Surbhi Gupta', tier: 'Gold', rev: '₹1.8L', img: 'https://ui-avatars.com/api/?name=Surbhi+Gupta&background=f59e0b&color=fff' },
              { name: 'Vikram Singh', tier: 'Silver', rev: '₹1.2L', img: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=94a3b8&color=fff' },
              { name: 'Anita Desai', tier: 'Gold', rev: '₹1.1L', img: 'https://ui-avatars.com/api/?name=Anita+Desai&background=f59e0b&color=fff' },
            ].map((agent, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={agent.img} alt={agent.name} style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>{agent.name}</p>
                  <span className={`ag-tier-${agent.tier.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{agent.tier}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>{agent.rev}</p>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>this month</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHome;
