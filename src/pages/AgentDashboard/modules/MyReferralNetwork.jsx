import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import {
  Users,
  UserPlus,
  TrendingUp,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Star,
  Shield,
  Search,
  Filter,
  Calendar,
  Award,
  Eye
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const MyReferralNetwork = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent';
  // Admin sees full network; sub-agents see their own subtree
  const agentParams = (!isAdmin && agentId) ? `?agent_id=${agentId}` : '';

  const [network, setNetwork] = useState([]);
  const [stats, setStats] = useState({
    direct_referrals: 0,
    sub_agent_referrals: 0,
    total_referral_orders: 0,
    total_commission_from_referrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [viewMode, setViewMode] = useState('tree');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchReferralNetwork();
  }, [agentId]);

  const fetchReferralNetwork = async () => {
    try {
      const res = await axios.get(`${API_BASE}/my-referral-network${agentParams}`);
      setNetwork(res.data.network || []);
      setStats(res.data.stats || {
        direct_referrals: 0,
        sub_agent_referrals: 0,
        total_referral_orders: 0,
        total_commission_from_referrals: 0
      });
    } catch (err) {
      console.error('Error fetching referral network:', err);
      setNetwork([]);
      setStats({
        direct_referrals: 0,
        sub_agent_referrals: 0,
        total_referral_orders: 0,
        total_commission_from_referrals: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const toggleAll = (expand) => {
    const toggleRecursive = (nodes) => {
      nodes.forEach(node => {
        setExpandedNodes(prev => ({ ...prev, [node.id]: expand }));
        if (node.children && node.children.length > 0) {
          toggleRecursive(node.children);
        }
      });
    };
    toggleRecursive(network);
  };

  const getFilteredNetwork = (nodes) => {
    if (filterLevel === 'all') return nodes;
    return nodes.filter(node => {
      if (node.role === filterLevel) return true;
      if (node.children) {
        node.children = getFilteredNetwork(node.children);
        return node.children.length > 0;
      }
      return false;
    });
  };

  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] !== false; // default expanded

    return (
      <div key={node.id} style={{ marginLeft: depth * 24, marginBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: depth === 0 ? '#eff6ff' : '#fff',
            border: `1px solid ${depth === 0 ? '#0ea5e930' : '#e2e8f0'}`,
            transition: 'all 0.2s'
          }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {isExpanded ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
            </button>
          ) : (
            <div style={{ width: '16px' }} />
          )}

          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#64748b'
            }}
          >
            {node.name[0]}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{node.name}</span>
              <span
                className={`ag-tier-${node.tier.toLowerCase()}`}
                style={{ fontSize: '0.65rem', padding: '2px 8px' }}
              >
                {node.tier}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>{node.role}</span>
              <span>•</span>
              <span>Joined {new Date(node.join_date).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0ea5e9', margin: 0 }}>
                {node.total_orders}
              </p>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Orders</span>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>
                ₹{node.total_commission.toLocaleString()}
              </p>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Commission</span>
            </div>
          </div>

          <button
            className="ag-btn ag-btn-outline"
            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
            onClick={() => alert(`Referral Details:\n\nName: ${node.name}\nRole: ${node.role}\nTier: ${node.tier}\nOrders: ${node.total_orders}\nCommission: ₹${node.total_commission}`)}
          >
            <Eye size={12} />
          </button>
        </div>

        {isExpanded && hasChildren && node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  const renderListView = (nodes) => {
    const flattenNodes = (nodes, depth = 0) => {
      let result = [];
      nodes.forEach(node => {
        result.push({ ...node, depth });
        if (node.children && node.children.length > 0) {
          result = result.concat(flattenNodes(node.children, depth + 1));
        }
      });
      return result;
    };

    const flatList = flattenNodes(getFilteredNetwork(network));

    return (
      <table className="ag-table">
        <thead>
          <tr>
            <th>Referral</th>
            <th>Role</th>
            <th>Level</th>
            <th>Join Date</th>
            <th>Orders</th>
            <th>Commission</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flatList.map((node, i) => (
            <tr key={i}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#64748b'
                    }}
                  >
                    {node.name[0]}
                  </div>
                  <span style={{ fontWeight: 600 }}>{node.name}</span>
                  {node.depth > 0 && (
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      {'→'.repeat(node.depth)}
                    </span>
                  )}
                </div>
              </td>
              <td>{node.role}</td>
              <td>
                <span
                  className={`ag-tier-${node.tier.toLowerCase()}`}
                  style={{ fontSize: '0.65rem', padding: '2px 8px' }}
                >
                  {node.tier}
                </span>
              </td>
              <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                {new Date(node.join_date).toLocaleDateString()}
              </td>
              <td style={{ fontWeight: 700 }}>{node.total_orders}</td>
              <td style={{ fontWeight: 700, color: '#16a34a' }}>
                ₹{node.total_commission.toLocaleString()}
              </td>
              <td>
                <button
                  className="ag-btn ag-btn-outline"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  <Eye size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) return <div className="ag-loading">Loading Referral Network...</div>;

  const filteredNetwork = getFilteredNetwork(network);

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">My Referral Network</h1>
          <p className="ag-module-subtitle">View your complete referral hierarchy and performance.</p>
        </div>
        <div className="ag-header-btns">
          <button
            className={`ag-btn ${viewMode === 'tree' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
            onClick={() => setViewMode('tree')}
          >
            <GitBranch size={16} /> Tree View
          </button>
          <button
            className={`ag-btn ${viewMode === 'list' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
            onClick={() => setViewMode('list')}
          >
            <Users size={16} /> List View
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ag-stats-grid">
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#0ea5e915' }}>
            <UserPlus size={20} color="#0ea5e9" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.direct_referrals}
          </div>
          <div className="ag-stat-label">Direct Referrals</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#6366f115' }}>
            <Users size={20} color="#6366f1" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.sub_agent_referrals}
          </div>
          <div className="ag-stat-label">Sub-Agent Referrals</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#16a34a15' }}>
            <TrendingUp size={20} color="#16a34a" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.total_referral_orders}
          </div>
          <div className="ag-stat-label">Total Referral Orders</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#f59e0b15' }}>
            <Award size={20} color="#f59e0b" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            ₹{stats.total_commission_from_referrals.toLocaleString()}
          </div>
          <div className="ag-stat-label">Commission from Referrals</div>
        </div>
      </div>

      {/* Controls */}
      <div className="ag-card" style={{ marginTop: '24px' }}>
        <div className="ag-card-header">
          <h3 className="ag-card-title">Network Hierarchy</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="ag-search-inline" style={{ width: '200px' }}>
              <Search size={14} color="#94a3b8" />
              <input placeholder="Search referrals..." />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="all">All Levels</option>
              <option value="Sub-Agent">Sub-Agents Only</option>
              <option value="Sales Rep">Sales Reps Only</option>
            </select>
            {viewMode === 'tree' && (
              <>
                <button
                  className="ag-btn ag-btn-outline"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  onClick={() => toggleAll(true)}
                >
                  Expand All
                </button>
                <button
                  className="ag-btn ag-btn-outline"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  onClick={() => toggleAll(false)}
                >
                  Collapse All
                </button>
              </>
            )}
          </div>
        </div>
        <div className="ag-card-body" style={{ minHeight: '400px' }}>
          {filteredNetwork.length > 0 ? (
            viewMode === 'tree' ? (
              <div style={{ paddingTop: '16px' }}>
                {filteredNetwork.map(node => renderTreeNode(node))}
              </div>
            ) : (
              <div className="ag-table-wrap">{renderListView(filteredNetwork)}</div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p>No referrals yet. Start sharing your referral code to build your network!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReferralNetwork;