import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import {
  BadgeDollarSign, Zap, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Users, Wallet, Filter, Download, ChevronDown, X
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const levelColor = (level) => {
  if (!level) return { bg: '#f3eeff', color: '#7c3aed' };
  if (level.includes('1') || level.includes('Sales Rep'))   return { bg: '#eff6ff', color: '#0ea5e9' };
  if (level.includes('2') || level.includes('Sub'))         return { bg: '#f0fdf4', color: '#16a34a' };
  if (level.includes('3') || level.includes('Master'))      return { bg: '#fffbeb', color: '#d97706' };
  return { bg: '#f3eeff', color: '#7c3aed' };
};

const CommissionHistory = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent' || !agentId;
  const agentParams = isAdmin ? '' : `?agent_id=${agentId}&role=${encodeURIComponent(agentRole)}`;

  const [commissions, setCommissions]   = useState([]);
  const [summary, setSummary]           = useState([]);
  const [agents, setAgents]             = useState([]);
  const [referralWiseCommission, setReferralWiseCommission] = useState([]);
  const [levelWiseCommission, setLevelWiseCommission] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calculating, setCalculating]   = useState(false);
  const [calcResult, setCalcResult]     = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAgent, setFilterAgent]   = useState('All');
  const [viewMode, setViewMode]         = useState('all'); // 'all', 'referral', 'level'
  const [calcForm, setCalcForm]         = useState({
    agent_id: '', order_amount: '', category_name: '', order_id: ''
  });

  const fetchAll = async () => {
    try {
      const [cRes, sRes, aRes, rwRes, lwRes] = await Promise.all([
        axios.get(`${API_BASE}/commissions${agentParams}`),
        axios.get(`${API_BASE}/commissions/summary${agentParams}`),
        axios.get(`${API_BASE}/applicants`),
        axios.get(`${API_BASE}/commissions/referral-wise${agentParams}`),
        axios.get(`${API_BASE}/commissions/level-wise${agentParams}`)
      ]);
      setCommissions(cRes.data);
      setSummary(sRes.data);
      setAgents(aRes.data.filter(a => a.status === 'Active'));
      setReferralWiseCommission(rwRes.data || []);
      setLevelWiseCommission(lwRes.data || []);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setReferralWiseCommission([]);
      setLevelWiseCommission([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCalculate = async () => {
    if (!calcForm.agent_id || !calcForm.order_amount) {
      return alert('Agent and Order Amount are required!');
    }
    setCalculating(true);
    setCalcResult(null);
    try {
      const res = await axios.post(`${API_BASE}/commissions/calculate`, calcForm);
      setCalcResult(res.data);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await axios.put(`${API_BASE}/commissions/${id}/status`, { status: 'Paid' });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const totalEarned  = commissions.reduce((a, c) => a + parseFloat(c.commission_amount || 0), 0);
  const totalPaid    = commissions.filter(c => c.status === 'Paid').reduce((a, c) => a + parseFloat(c.commission_amount || 0), 0);
  const totalPending = commissions.filter(c => c.status === 'Earned').reduce((a, c) => a + parseFloat(c.commission_amount || 0), 0);

  // All agents who have at least one commission record
  const agentsWithCommission = [...new Map(
    commissions.map(c => [c.agent_id, { id: c.agent_id, name: c.agent_name }])
  ).values()];

  const filtered = commissions
    .filter(c => filterStatus === 'All' || c.status === filterStatus)
    .filter(c => filterAgent === 'All' || String(c.agent_id) === String(filterAgent));

  if (loading) return <div className="ag-loading">Loading Commission History...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">Commission History</h1>
          <p className="ag-module-subtitle">Auto-calculated referral commissions across all hierarchy levels.</p>
        </div>
        <div className="ag-header-btns">
          <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
            <button
              className={`ag-btn ${viewMode === 'all' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              onClick={() => setViewMode('all')}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              All Transactions
            </button>
            <button
              className={`ag-btn ${viewMode === 'referral' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              onClick={() => setViewMode('referral')}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Referral-wise
            </button>
            <button
              className={`ag-btn ${viewMode === 'level' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              onClick={() => setViewMode('level')}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Level-wise
            </button>
          </div>
          <button className="ag-btn ag-btn-primary" onClick={() => { setShowCalcModal(true); setCalcResult(null); }}>
            <Zap size={16} /> Calculate Commission
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ag-stats-grid">
        {[
          { label: 'Total Earned',   value: `Rs.${totalEarned.toLocaleString('en-IN', {maximumFractionDigits:0})}`,   icon: BadgeDollarSign, color: '#0ea5e9' },
          { label: 'Total Paid',     value: `Rs.${totalPaid.toLocaleString('en-IN', {maximumFractionDigits:0})}`,     icon: CheckCircle2,    color: '#16a34a' },
          { label: 'Pending Payout', value: `Rs.${totalPending.toLocaleString('en-IN', {maximumFractionDigits:0})}`, icon: Clock,           color: '#f59e0b' },
          { label: 'Transactions',   value: commissions.length,                                                        icon: TrendingUp,      color: '#6366f1' },
        ].map((s, i) => (
          <div className="ag-stat-card" key={i}>
            <div className="ag-stat-icon" style={{ background: `${s.color}15` }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="ag-stat-value" style={{ fontWeight: 800 }}>{s.value}</div>
            <div className="ag-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="ag-dashboard-grid">
        {/* Commission Transactions Table */}
        {viewMode === 'all' && (
          <div className="ag-card" style={{ gridColumn: '1 / -1' }}>
          <div className="ag-card-header">
            <h3 className="ag-card-title">All Commission Transactions</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Agent Filter Dropdown */}
              <select
                value={filterAgent}
                onChange={e => setFilterAgent(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none', minWidth: 160 }}
              >
                <option value="All">All Agents</option>
                {agentsWithCommission.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none' }}
              >
                <option value="All">All Status</option>
                <option value="Earned">Earned (Pending)</option>
                <option value="Paid">Paid</option>
              </select>
              {/* Reset filters */}
              {(filterAgent !== 'All' || filterStatus !== 'All') && (
                <button
                  className="ag-btn ag-btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  onClick={() => { setFilterAgent('All'); setFilterStatus('All'); }}
                >Clear</button>
              )}
            </div>
          </div>
          <div className="ag-table-wrap">
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <BadgeDollarSign size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p>No commission records yet. Click <strong>"Calculate Commission"</strong> to trigger the engine after a sale.</p>
              </div>
            ) : (
              <table className="ag-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Agent</th>
                    <th>Role</th>
                    <th>Level</th>
                    <th>Order Amt</th>
                    <th>Rate</th>
                    <th>Commission</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const lc = levelColor(c.referral_level);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: '#0ea5e9' }}>#{c.id}</td>
                        <td style={{ fontWeight: 700 }}>{c.agent_name}</td>
                        <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.agent_role}</td>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: lc.bg, color: lc.color }}>
                            {c.referral_level || 'Level 1'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>Rs.{parseFloat(c.order_amount).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#6366f1', fontWeight: 700 }}>{c.commission_rate}</td>
                        <td style={{ fontWeight: 800, color: '#16a34a' }}>Rs.{parseFloat(c.commission_amount).toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '0.78rem' }}>{c.category_name || '-'}</td>
                        <td>
                          <span className={`ag-badge ${c.status === 'Paid' ? 'ag-badge-green' : 'ag-badge-yellow'}`}>
                            {c.status === 'Paid' ? <CheckCircle2 size={11} style={{ marginRight: 3 }} /> : <Clock size={11} style={{ marginRight: 3 }} />}
                            {c.status}
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                        <td>
                          {c.status === 'Earned' && (
                            <button
                              className="ag-btn ag-btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                              onClick={() => handleMarkPaid(c.id)}
                            >Mark Paid</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        )}

        {/* Referral-wise Commission */}
        {viewMode === 'referral' && (
          <div className="ag-card" style={{ gridColumn: '1 / -1' }}>
            <div className="ag-card-header">
              <h3 className="ag-card-title">Referral-wise Commission</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Commission breakdown by referral code and source</p>
            </div>
            <div className="ag-table-wrap">
              <table className="ag-table">
                <thead>
                  <tr>
                    <th>Referral Code</th>
                    <th>Agent Owner</th>
                    <th>Total Orders</th>
                    <th>Total Commission</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {referralWiseCommission.length > 0 ? referralWiseCommission.map((rc, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700,
                          background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', border: '1px dashed #cbd5e1'
                        }}>{rc.referral_code}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{rc.agent_name}</td>
                      <td style={{ fontWeight: 700 }}>{rc.total_orders}</td>
                      <td style={{ fontWeight: 800, color: '#16a34a' }}>Rs.{parseFloat(rc.total_commission).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`ag-badge ${rc.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>
                          {rc.status}
                        </span>
                      </td>
                      <td>
                        <button className="ag-btn ag-btn-outline" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No referral-wise commission data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Level-wise Commission */}
        {viewMode === 'level' && (
          <div className="ag-card" style={{ gridColumn: '1 / -1' }}>
            <div className="ag-card-header">
              <h3 className="ag-card-title">Level-wise Commission</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Commission breakdown by hierarchy level</p>
            </div>
            <div className="ag-table-wrap">
              <table className="ag-table">
                <thead>
                  <tr>
                    <th>Referral Level</th>
                    <th>Total Commission</th>
                    <th>Number of Agents</th>
                    <th>Average Commission</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {levelWiseCommission.length > 0 ? levelWiseCommission.map((lw, i) => {
                    const lc = levelColor(lw.level);
                    return (
                      <tr key={i}>
                        <td>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: lc.bg, color: lc.color }}>
                            {lw.level}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#16a34a' }}>Rs.{parseFloat(lw.total_commission).toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700 }}>{lw.agents_count}</td>
                        <td style={{ fontWeight: 700, color: '#0ea5e9' }}>Rs.{parseFloat(lw.avg_commission).toLocaleString('en-IN')}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                            <TrendingUp size={12} style={{ marginRight: 4 }} /> +12%
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No level-wise commission data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Agent-wise Summary */}
        {summary.length > 0 && (
          <div className="ag-card" style={{ gridColumn: '1 / -1' }}>
            <div className="ag-card-header">
              <h3 className="ag-card-title">Agent-wise Commission Summary</h3>
            </div>
            <div className="ag-table-wrap">
              <table className="ag-table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Role</th>
                    <th>Transactions</th>
                    <th>Total Earned</th>
                    <th>Paid</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{s.name}</td>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.role}</td>
                      <td style={{ fontWeight: 600 }}>{s.total_transactions || 0}</td>
                      <td style={{ fontWeight: 800, color: '#0ea5e9' }}>Rs.{parseFloat(s.total_earned || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>Rs.{parseFloat(s.total_paid || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 700, color: '#f59e0b' }}>Rs.{parseFloat(s.total_pending || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Calculate Commission Modal */}
      {showCalcModal && (
        <div className="ag-modal-overlay" onClick={() => setShowCalcModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 'min(500px, 95%)' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title"><Zap size={18} style={{ marginRight: 8, color: '#f59e0b' }} />Calculate Commission</h2>
              <button className="ag-modal-close" onClick={() => setShowCalcModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              {!calcResult ? (
                <>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 16 }}>
                    Enter sale details. The engine will automatically walk the referral hierarchy and calculate commission for each eligible level.
                  </p>
                  <div className="ag-form-grid">
                    <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Selling Agent *</label>
                      <select value={calcForm.agent_id} onChange={e => setCalcForm({ ...calcForm, agent_id: e.target.value })}>
                        <option value="">Select agent who made the sale</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                        ))}
                      </select>
                    </div>
                    <div className="ag-field">
                      <label>Order Amount (Rs.) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={calcForm.order_amount}
                        onChange={e => setCalcForm({ ...calcForm, order_amount: e.target.value })}
                      />
                    </div>
                    <div className="ag-field">
                      <label>Order ID (optional)</label>
                      <input
                        placeholder="e.g. ORD-1042"
                        value={calcForm.order_id}
                        onChange={e => setCalcForm({ ...calcForm, order_id: e.target.value })}
                      />
                    </div>
                    <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Product Category (optional)</label>
                      <input
                        placeholder="e.g. Skin Care"
                        value={calcForm.category_name}
                        onChange={e => setCalcForm({ ...calcForm, category_name: e.target.value })}
                      />
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>Leave blank to use default rule.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 10px' }} />
                    <h3 style={{ fontWeight: 800, color: '#0f172a' }}>Commission Calculated!</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>{calcResult.message}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {calcResult.commissions?.map((c, i) => {
                      const lc = levelColor(c.level);
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: `1px solid ${lc.bg}` }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>{c.agent_name}</p>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: lc.bg, color: lc.color }}>{c.level}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a', margin: 0 }}>Rs.{c.commission_amount}</p>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>@ {c.rate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowCalcModal(false)}>Close</button>
              {!calcResult && (
                <button className="ag-btn ag-btn-primary" onClick={handleCalculate} disabled={calculating}>
                  <Zap size={16} /> {calculating ? 'Calculating...' : 'Run Engine'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionHistory;
