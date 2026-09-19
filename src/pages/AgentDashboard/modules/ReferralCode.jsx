import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import {
  QrCode,
  Copy,
  RefreshCw,
  Plus,
  Users,
  TrendingUp,
  Gift,
  CheckCircle,
  Eye,
  X,
  Send,
  Zap,
  Award
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const ReferralCode = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = Boolean(agentRole && agentRole.toLowerCase().includes('admin'));
  // Admin sees ALL data; sub-agents see only their own
  const agentParams = (!isAdmin && agentId) ? `?agent_id=${agentId}` : '';

  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [agentStats, setAgentStats] = useState({ total_commission: 0, paid_commission: 0, pending_payouts: 0 });
  const [newCode, setNewCode] = useState({ code: '', agent_id: agentId || '', discount_type: 'percentage', discount_value: '10' });
  const [recognitionMsg, setRecognitionMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agentId) {
      setNewCode(prev => ({ ...prev, agent_id: prev.agent_id || agentId }));
    }
    fetchData();
  }, [agentId]);

  useEffect(() => {
    if (!newCode.agent_id && Array.isArray(agents) && agents.length > 0) {
      setNewCode(prev => ({ ...prev, agent_id: agents[0].id }));
    }
  }, [agents]);

  const fetchData = async () => {
    try {
      const [codeRes, agentRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/referral-codes${agentParams}`),
        axios.get(`${API_BASE}/applicants${agentParams}`),
        axios.get(`${API_BASE}/stats${agentParams}`)
      ]);
      setCodes(Array.isArray(codeRes.data) ? codeRes.data : []);
      setAgents(Array.isArray(agentRes.data) ? agentRes.data : []);
      setAgentStats(statsRes.data && typeof statsRes.data === 'object' && !Array.isArray(statsRes.data) ? statsRes.data : { total_commission: 0, paid_commission: 0, pending_payouts: 0 });
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setCodes([]);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    const targetAgentId = newCode.agent_id || agentId;
    if (!newCode.code || !targetAgentId) return alert('Fill all required fields');
    if (!newCode.discount_value || parseFloat(newCode.discount_value) <= 0) {
      return alert('Please enter a valid discount amount or percentage');
    }
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/referral-codes`, { ...newCode, agent_id: targetAgentId });
      setShowCreateModal(false);
      setNewCode({ code: '', agent_id: agentId, discount_type: 'percentage', discount_value: '10' });
      await fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create referral code';
      console.error('Error creating referral code:', errorMsg);
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Agent's own stats for the side card
  const topAgentName = loggedAgent?.name || 'My Profile';
  const topAgentTier = loggedAgent?.tier ? `${loggedAgent.tier} Tier` : 'Silver Tier';
  const topAgentRole = loggedAgent?.role || 'Agent';
  const topAgentUses = (Array.isArray(codes) ? codes : []).reduce((sum, c) => sum + (parseInt(c.usage_count) || 0), 0);
  const topAgentCodesCount = (Array.isArray(codes) ? codes : []).filter(c => c.status === 'Active').length;

  const handleSendRecognition = async () => {
    if (!recognitionMsg) return alert('Enter a message');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/referral-codes/${topAgentSummary?.id || 1}/recognize`, { message: recognitionMsg });
      setShowRecognitionModal(false);
      setRecognitionMsg('');
      alert(`Recognition sent to ${topAgentName}!`);
    } catch (err) {
      console.error(err);
      setShowRecognitionModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalUses = (Array.isArray(codes) ? codes : []).reduce((acc, c) => acc + (c.usage_count || 0), 0);
  const activeCodes = (Array.isArray(codes) ? codes : []).filter(c => c.status === 'Active').length;

  if (loading) return <div className="ag-loading">Loading Codes...</div>;

  return (
    <div className="ag-enter">
      {/* Header */}
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">Referral Codes</h1>
          <p className="ag-module-subtitle">
            {isAdmin
              ? 'Generate and track referral codes for agent marketing campaigns.'
              : 'Your active referral codes. Share them to earn commissions.'}
          </p>
        </div>
        <div className="ag-header-btns">
          <button className="ag-btn ag-btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Code
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ag-stats-grid">
        {[
          { label: 'Active Codes', value: activeCodes, icon: QrCode, color: '#0ea5e9' },
          { label: 'Total Uses', value: totalUses, icon: TrendingUp, color: '#16a34a' },
          { label: 'Total Commission', value: `₹${parseFloat(agentStats.total_commission || 0).toLocaleString('en-IN')}`, icon: Gift, color: '#f59e0b' },
          { label: 'Paid Commission', value: `₹${parseFloat(agentStats.paid_commission || 0).toLocaleString('en-IN')}`, icon: CheckCircle, color: '#6366f1' },
        ].map((stat, i) => (
          <div className="ag-stat-card" key={i}>
            <div className="ag-stat-icon" style={{ background: `${stat.color}15` }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div className="ag-stat-value" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
            <div className="ag-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="ag-dashboard-grid">
        {/* Management Console */}
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Management Console</h3>
          </div>
          <div className="ag-table-wrap">
            <table className="ag-table">
              <thead>
                <tr>
                  <th>Referral Code</th>
                  <th>Agent Owner</th>
                  <th>Customer Offer</th>
                  <th>Total Uses</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => {
                  const offerText = c.discount_type === 'fixed'
                    ? `₹${parseFloat(c.discount_value || 0)} OFF`
                    : `${parseFloat(c.discount_value || 10)}% OFF`;
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700,
                            background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', border: '1px dashed #cbd5e1'
                          }}>{c.code}</span>
                          <button
                            className="ag-icon-btn"
                            style={{ padding: '4px', background: copied === c.code ? '#dcfce7' : '' }}
                            onClick={() => handleCopy(c.code)}
                          >
                            {copied === c.code ? <CheckCircle size={12} color="#16a34a" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.agent_name}</td>
                      <td>
                        <span style={{
                          background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '12px',
                          fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          <Gift size={11} /> {offerText}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{c.usage_count}</td>
                      <td>
                        <span className={`ag-badge ${c.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>{c.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="ag-icon-btn"
                            title="View Details"
                            onClick={() => alert(`Code: ${c.code}\nAgent: ${c.agent_name}\nUses: ${c.usage_count}\nStatus: ${c.status}`)}
                          >
                            <Eye size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="ag-icon-btn"
                              title={c.status === 'Active' ? 'Deactivate' : 'Activate'}
                              onClick={async () => {
                                if (window.confirm(`Mark this code as ${c.status === 'Active' ? 'Expired' : 'Active'}?`)) {
                                  try {
                                    const newStatus = c.status === 'Active' ? 'Expired' : 'Active';
                                    await axios.put(`${API_BASE}/referral-codes/${c.id}/status`, { status: newStatus });
                                    fetchData();
                                  } catch (err) {
                                    setCodes(codes.map(code => code.id === c.id ? { ...code, status: code.status === 'Active' ? 'Expired' : 'Active' } : code));
                                  }
                                }
                              }}
                            >
                              <RefreshCw size={14} color={c.status === 'Active' ? '#e11d48' : '#16a34a'} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referral Agent - Admin only */}
        {isAdmin && (
          <div className="ag-card">
            <div className="ag-card-header">
              <h3 className="ag-card-title">Top Referral Agent</h3>
            </div>
            <div className="ag-card-body" style={{ textAlign: 'center' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(topAgentName)}&background=0ea5e9&color=fff&size=80`}
                alt={topAgentName}
                style={{ borderRadius: '20px', marginBottom: '16px', border: '4px solid #eff6ff', width: 80, height: 80 }}
              />
              <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'capitalize' }}>{topAgentName}</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                {topAgentTier} • {topAgentRole}
              </p>

              <div className="ag-divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0ea5e9' }}>{topAgentUses}</p>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Total Referrals</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>{topAgentCodesCount}</p>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Active Codes</span>
                </div>
              </div>

              <button
                className="ag-btn ag-btn-primary"
                style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}
                onClick={() => setShowRecognitionModal(true)}
              >
                <Award size={14} /> Send Recognition
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="ag-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 'min(450px, 95%)' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Generate Referral Code</h2>
              <button className="ag-modal-close" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div className="ag-form-grid">
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Referral Code *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      style={{ flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                      placeholder="e.g. SUMMER50"
                      value={newCode.code}
                      onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                    />
                    <button className="ag-btn ag-btn-outline" onClick={() => setNewCode({ ...newCode, code: Math.random().toString(36).substring(2, 10).toUpperCase() })}>Auto</button>
                  </div>
                </div>

                {(isAdmin || (Array.isArray(agents) && agents.length > 0)) && (
                  <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                    <label>Assign to Agent *</label>
                    <select value={newCode.agent_id} onChange={e => setNewCode({ ...newCode, agent_id: e.target.value })}>
                      <option value="">Select Agent</option>
                      {(Array.isArray(agents) ? agents : []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="ag-field" style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                  <label style={{ fontWeight: 700, color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Gift size={15} /> Customer Discount Type *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className={`ag-btn ${newCode.discount_type === 'percentage' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
                      style={{ justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}
                      onClick={() => setNewCode({ ...newCode, discount_type: 'percentage' })}
                    >
                      % Percentage Discount
                    </button>
                    <button
                      type="button"
                      className={`ag-btn ${newCode.discount_type === 'fixed' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
                      style={{ justifyContent: 'center', padding: '8px', fontSize: '0.82rem' }}
                      onClick={() => setNewCode({ ...newCode, discount_type: 'fixed' })}
                    >
                      ₹ Flat Amount (Rupees)
                    </button>
                  </div>
                </div>

                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>
                    {newCode.discount_type === 'fixed' ? 'Customer Discount Amount (₹) *' : 'Customer Discount Percentage (%) *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="1"
                      placeholder={newCode.discount_type === 'fixed' ? 'e.g. 100' : 'e.g. 15'}
                      value={newCode.discount_value}
                      onChange={e => setNewCode({ ...newCode, discount_value: e.target.value })}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#0ea5e9' }}>
                      {newCode.discount_type === 'fixed' ? '₹' : '%'}
                    </span>
                  </div>
                </div>

                <div style={{
                  gridColumn: '1 / -1',
                  background: '#f0f9ff',
                  border: '1px dashed #7dd3fc',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.78rem',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Zap size={16} color="#0284c7" />
                  <span>
                    Customer using code <strong>{newCode.code || 'CODE'}</strong> will get{' '}
                    <strong>
                      {newCode.discount_type === 'fixed' ? `₹${newCode.discount_value || 0} OFF` : `${newCode.discount_value || 0}% OFF`}
                    </strong>{' '}
                    on checkout.
                  </span>
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={handleCreateCode} disabled={saving}>
                {saving ? 'Creating...' : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recognition Modal */}
      {showRecognitionModal && (
        <div className="ag-modal-overlay" onClick={() => setShowRecognitionModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 'min(450px, 95%)' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Send Agent Recognition</h2>
              <button className="ag-modal-close" onClick={() => setShowRecognitionModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <Zap size={20} color="#0284c7" />
                <p style={{ fontSize: '0.8rem', color: '#0369a1', margin: 0 }}>
                  Recognizing <strong style={{ textTransform: 'capitalize' }}>{topAgentName}</strong> for outstanding referral performance.
                </p>
              </div>
              <div className="ag-field">
                <label>Message of Appreciation</label>
                <textarea
                  placeholder="e.g. Great work on the last campaign! Your referral numbers are impressive."
                  value={recognitionMsg}
                  onChange={e => setRecognitionMsg(e.target.value)}
                />
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowRecognitionModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={handleSendRecognition} disabled={saving}>
                <Send size={16} /> {saving ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCode;
