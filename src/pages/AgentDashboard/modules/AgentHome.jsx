import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import { 
  Users, 
  TrendingUp, 
  BadgeDollarSign, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const AgentHome = ({ onNavigate }) => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent';
  // Admin sees ALL data (no filter); sub-agents see only their own
  const agentParams = (!isAdmin && agentId) ? `?agent_id=${agentId}` : '';

  const [stats, setStats] = useState([
    { label: 'Total Agents', value: '0', change: '+0%', up: true, icon: Users, color: '#0ea5e9' },
    { label: 'Active Referrals', value: '0', change: '+0%', up: true, icon: TrendingUp, color: '#6366f1' },
    { label: 'Total Commission', value: '₹0', change: '+0%', up: true, icon: BadgeDollarSign, color: '#f59e0b' },
    { label: 'Pending Payouts', value: '₹0', change: '+0%', up: false, icon: Wallet, color: '#e11d48' },
    { label: 'Direct Referrals', value: '0', change: '+0%', up: true, icon: UserCheck, color: '#16a34a' },
    { label: 'Sub-Agent Referrals', value: '0', change: '+0%', up: true, icon: Users, color: '#8b5cf6' },
    { label: 'Total Referral Orders', value: '0', change: '+0%', up: true, icon: TrendingUp, color: '#06b6d4' },
    { label: 'Paid Commission', value: '₹0', change: '+0%', up: true, icon: CheckCircle2, color: '#22c55e' },
  ]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [topAgents, setTopAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, reqRes, topRes] = await Promise.all([
        axios.get(`${API_BASE}/stats${agentParams}`),
        axios.get(`${API_BASE}/requests${agentParams}`),
        axios.get(`${API_BASE}/top${agentParams}`)
      ]);

      const s = statsRes.data || {};
      setStats([
        { label: 'Total Agents', value: (s.total_agents || 0).toLocaleString('en-IN'), change: '+12%', up: true, icon: Users, color: '#0ea5e9' },
        { label: 'Active Referrals', value: (s.active_referrals || 0).toLocaleString('en-IN'), change: '+5%', up: true, icon: TrendingUp, color: '#6366f1' },
        { label: 'Total Commission', value: `₹${parseFloat(s.total_commission || 0).toLocaleString('en-IN')}`, change: '+18%', up: true, icon: BadgeDollarSign, color: '#f59e0b' },
        { label: 'Pending Payouts', value: `₹${parseFloat(s.pending_payouts || 0).toLocaleString('en-IN')}`, change: '-0%', up: false, icon: Wallet, color: '#e11d48' },
        { label: 'Direct Referrals', value: (s.direct_referrals || 0).toLocaleString('en-IN'), change: '+8%', up: true, icon: UserCheck, color: '#16a34a' },
        { label: 'Sub-Agent Referrals', value: (s.sub_agent_referrals || 0).toLocaleString('en-IN'), change: '+0%', up: true, icon: Users, color: '#8b5cf6' },
        { label: 'Total Referral Orders', value: (s.total_referral_orders || 0).toLocaleString('en-IN'), change: '+22%', up: true, icon: TrendingUp, color: '#06b6d4' },
        { label: 'Paid Commission', value: `₹${parseFloat(s.paid_commission || 0).toLocaleString('en-IN')}`, change: '+25%', up: true, icon: CheckCircle2, color: '#22c55e' },
      ]);

      const reqList = Array.isArray(reqRes.data) ? reqRes.data : [];
      setRecentRequests(reqList.slice(0, 5).map(r => ({
        id: `REQ-${r.id}`,
        agent: r.agent_name || 'Agent',
        type: r.activity_type || 'Activity',
        amount: r.amount ? `₹${parseFloat(r.amount).toLocaleString('en-IN')}` : '—',
        status: r.status || 'Active',
        time: new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      })));

      setTopAgents(Array.isArray(topRes.data) ? topRes.data : []);
    } catch (err) {
      console.error('Error fetching agent home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [agentId]);

  if (loading) return <div className="ag-loading">Loading Overview...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">{isAdmin ? 'Agent Overview' : 'My Dashboard'}</h1>
          <p className="ag-module-subtitle">
            {isAdmin
              ? 'Monitor agent performance, commissions, and payouts at a glance.'
              : 'Your personal performance: referrals, commissions, and payout summary.'}
          </p>
        </div>
        {isAdmin && (
          <div className="ag-header-btns">
            <button className="ag-btn ag-btn-outline">Export Stats</button>
            <button 
              className="ag-btn ag-btn-primary"
              onClick={() => onNavigate('onboarding')}
            >Add New Agent</button>
          </div>
        )}
      </div>

      <div className="ag-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {stats.map((stat, i) => (
          <div className="ag-stat-card" key={i}>
            <div className="ag-stat-icon" style={{ background: `${stat.color}15` }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className="ag-stat-value" style={{ fontWeight: 800 }}>{stat.value}</div>
            <div className="ag-stat-label">{stat.label}</div>
            <div className={`ag-stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.change} since last month
            </div>
          </div>
        ))}
      </div>

      <div className="ag-dashboard-grid">
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Recent Requests</h3>
            <button 
              className="ag-btn ag-btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              onClick={() => onNavigate('logs')}
            >View All</button>
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
            {topAgents.map((agent, i) => (
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
