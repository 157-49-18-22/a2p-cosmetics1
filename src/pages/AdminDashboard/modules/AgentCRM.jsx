import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, UserCheck, Star, Shield, ExternalLink, Mail, Phone, X, Check, Trash2, AlertCircle, RefreshCcw, TrendingUp, Users, Wallet, Clock, Filter, Trophy, ChevronRight, BadgeDollarSign } from 'lucide-react';
import CommissionSetup from '../../AgentDashboard/modules/CommissionSetup';

const API = API_BASE_URL;

const AgentCRM = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({ total_agents: 0, active_referrals: 0, total_commission: 0, pending_payouts: 0 });
  const [topAgents, setTopAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminAgentModal, setShowAdminAgentModal] = useState(false);
  const [adminAgentForm, setAdminAgentForm] = useState({ name: '', email: '', password: '', phone: '', city: '' });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentNotes, setAgentNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [approvalFields, setApprovalFields] = useState({}); // { id: { email, password } }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsRes, statsRes, topRes, logsRes] = await Promise.all([
        fetch(`${API}/agent/applicants`),
        fetch(`${API}/agent/stats`),
        fetch(`${API}/agent/top`),
        fetch(`${API}/agent/requests`)
      ]);

      const [agentsData, statsData, topData, logsData] = await Promise.all([
        agentsRes.json(),
        statsRes.json(),
        topRes.json(),
        logsRes.json()
      ]);

      setAgents(agentsData);
      setStats(statsData);
      setTopAgents(topData);
      setLogs(logsData);
    } catch (e) {
      showToast('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setProcessing(id);
    try {
      const agent = agents.find(a => a.id === id);
      const creds = approvalFields[id] || { email: agent?.email || '', password: '' };
      const res = await fetch(`${API}/agent/applicants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          email: creds.email, 
          password: creds.password 
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      showToast(`Agent ${newStatus === 'Active' ? 'Approved' : 'Rejected'}!`);
      setShowApproveModal(false);
      fetchData();
      if (selectedAgent && selectedAgent.id === id) {
        setSelectedAgent({ ...selectedAgent, status: newStatus });
      }
    } catch (e) {
      showToast(e.message || 'Failed to update status', 'danger');
    } finally {
      setProcessing(null);
    }
  };

  const saveNotes = async () => {
    if (!selectedAgent) return;
    try {
      const res = await fetch(`${API}/agent/${selectedAgent.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: agentNotes })
      });
      if (!res.ok) throw new Error('Failed to save notes');
      showToast('Notes saved successfully');
      setSelectedAgent({ ...selectedAgent, admin_notes: agentNotes });
      setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, admin_notes: agentNotes } : a));
    } catch (e) {
      showToast('Error saving notes', 'danger');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete agent "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/agent/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Agent deleted successfully');
      fetchData();
      if (selectedAgent && selectedAgent.id === id) setShowProfileModal(false);
    } catch (e) {
      showToast('Failed to delete agent', 'danger');
    }
  };

  const handleCreateAdminAgent = async () => {
    const { name, email, password, phone, city } = adminAgentForm;
    if (!name || !email || !password) return showToast('Name, Email & Password required', 'danger');
    setProcessing('admin_create');
    try {
      // 1. Create agent via onboard (Pending)
      const onboardRes = await fetch(`${API}/agent/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, city, address: '', role: 'Admin Agent', parent_id: null })
      });
      const onboardData = await onboardRes.json();
      if (!onboardRes.ok) throw new Error(onboardData.error || 'Failed to create agent');
      
      // 2. Immediately approve with credentials
      const approveRes = await fetch(`${API}/agent/applicants/${onboardData.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active', email, password })
      });
      if (!approveRes.ok) throw new Error('Approval failed');
      
      showToast(`Admin Agent "${name}" created successfully!`);
      setShowAdminAgentModal(false);
      setAdminAgentForm({ name: '', email: '', password: '', phone: '', city: '' });
      fetchData();
    } catch (e) {
      showToast(e.message || 'Failed to create admin agent', 'danger');
    } finally {
      setProcessing(null);
    }
  };

  const handleEmail = (email) => {
    if (!email) return showToast('No email found', 'warning');
    window.location.href = `mailto:${email}?subject=A2P%20Cosmetics%20Agent%20Update`;
  };

  const handleViewProfile = (agent) => {
    setSelectedAgent(agent);
    setAgentNotes(agent.admin_notes || '');
    setShowProfileModal(true);
  };

  const pendingAgents = agents.filter(a => a.status === 'Pending');
  const filteredAgents = agents.filter(ag => {
    const matchesSearch = ag.name.toLowerCase().includes(search.toLowerCase()) || 
                          ag.id?.toString().includes(search) ||
                          ag.city?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterTier === 'All' || ag.tier === filterTier;
    const matchesStatus = filterStatus === 'All' || ag.status === filterStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="adm-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <UserCheck size={18} /> : <AlertCircle size={18} />} {toast.msg}
        </div>
      )}

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
        {[
          { id: 'agents', label: 'Agent Management', icon: Users },
          { id: 'commission', label: 'Commission Rules', icon: BadgeDollarSign },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', fontWeight: 700, fontSize: '0.88rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === id ? '#3b82f6' : '#64748b',
              borderBottom: activeTab === id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s'
            }}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Commission Rules Tab — Admin Only */}
      {activeTab === 'commission' && <CommissionSetup />}

      {/* Agents Tab */}
      {activeTab === 'agents' && (<>
      <div className="adm-module-header">
        <div className="adm-header-title-wrap">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Agent CRM</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your field network, verify applicants, and track performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', width: window.innerWidth <= 768 ? '100%' : 'auto' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchData} disabled={loading} style={{ flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }}>
            <RefreshCcw size={16} className={loading ? 'adm-spin' : ''} />
          </button>
          <button
            className="adm-btn adm-btn-outline"
            onClick={() => setShowAdminAgentModal(true)}
            style={{ flex: window.innerWidth <= 768 ? 2 : 'none', justifyContent: 'center', borderColor: '#6366f1', color: '#6366f1' }}
          >
            <Shield size={16} /> Create Admin Agent
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowApproveModal(true)} style={{ flex: window.innerWidth <= 768 ? 4 : 'none', justifyContent: 'center' }}>
            <UserCheck size={18} /> Approvals {pendingAgents.length > 0 && <span style={{ background: '#fff', color: '#3b82f6', padding: '2px 8px', borderRadius: '8px', marginLeft: '8px', fontSize: '0.8rem', fontWeight: 800 }}>{pendingAgents.length}</span>}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="adm-stats-grid">
        {[
          { label: 'Total Agents', val: stats.total_agents, icon: Users, color: '#3b82f6' },
          { label: 'Active Referrals', val: stats.active_referrals, icon: TrendingUp, color: '#10b981' },
          { label: 'Total Commission', val: `₹${(stats.total_commission || 0).toLocaleString()}`, icon: Wallet, color: '#f59e0b' },
          { label: 'Pending Payouts', val: `₹${(stats.pending_payouts || 0).toLocaleString()}`, icon: Clock, color: '#ef4444' }
        ].map((s, i) => (
          <div key={i} className="adm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-main-grid">
        {/* Main Content: Table & Filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="adm-card">
            <div className="adm-card-header adm-card-header-flex">
              <div className="adm-search-container">
                <div className="adm-search">
                  <Search size={16} />
                  <input type="text" placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Filter size={14} color="#94a3b8" />
                  <select className="adm-btn adm-btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }} value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                    <option value="All">All Tiers</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                  <select className="adm-btn adm-btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <button className="adm-btn adm-btn-outline" style={{ padding: '8px 16px' }}>Export</button>
              </div>
            </div>
            
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Agent Name</th>
                    <th>Tier</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading agents...</td></tr>
                  ) : filteredAgents.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No agents match your criteria.</td></tr>
                  ) : filteredAgents.map(ag => (
                    <tr key={ag.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{ag.name[0]}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{ag.name}</span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ID: AG-{ag.id.toString().padStart(3, '0')}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: ag.tier === 'Platinum' ? '#3b82f6' : (ag.tier === 'Gold' ? '#f59e0b' : '#64748b'), fontSize: '0.85rem' }}>{ag.tier || 'Silver'}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{ag.city}</td>
                      <td>
                        <span className={`adm-badge adm-badge-${ag.status === 'Active' ? 'success' : (ag.status === 'Pending' ? 'info' : 'warning')}`}>
                          {ag.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="adm-icon-btn" title="View Profile" onClick={() => handleViewProfile(ag)}><ExternalLink size={14} /></button>
                          <button className="adm-icon-btn" title="Email" onClick={() => handleEmail(ag.email)}><Mail size={14} /></button>
                          <button className="adm-icon-btn" title="Delete Agent" style={{ color: '#f43f5e' }} onClick={() => handleDelete(ag.id, ag.name)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Top Performers & Recent Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Performers */}
          <div className="adm-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Trophy size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Top Performers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topAgents.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '12px', background: i === 0 ? '#fefce8' : '#f8fafc', border: i === 0 ? '1px solid #fef08a' : '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={a.img} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{a.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{a.tier}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>{a.rev}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="adm-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Clock size={18} color="#3b82f6" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Activity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '4px', height: 'auto', background: l.activity_type === 'Payout' ? '#ef4444' : '#10b981', borderRadius: '10px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{l.activity_text}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {l.agent_name}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="adm-btn adm-btn-outline" style={{ width: '100%', marginTop: '16px', fontSize: '0.8rem' }}>View All Logs</button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedAgent && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '800px', height: 'auto', display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
            <div style={{ background: '#f8fafc', borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #f1f5f9', borderBottom: window.innerWidth <= 768 ? '1px solid #f1f5f9' : 'none', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
                {selectedAgent.name[0]}
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{selectedAgent.name}</h4>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>AG-{selectedAgent.id.toString().padStart(3, '0')}</div>
                <span className={`adm-badge adm-badge-${selectedAgent.status === 'Active' ? 'success' : (selectedAgent.status === 'Pending' ? 'info' : 'warning')}`} style={{ marginTop: '10px' }}>
                  {selectedAgent.status}
                </span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                <button className="adm-btn adm-btn-primary" style={{ width: '100%' }} onClick={() => handleEmail(selectedAgent.email)}><Mail size={16} /> Send Email</button>
                <button className="adm-btn adm-btn-outline" style={{ width: '100%', color: '#f43f5e', borderColor: '#fecaca' }} onClick={() => handleDelete(selectedAgent.id, selectedAgent.name)}><Trash2 size={16} /> Delete Agent</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Agent Details</h3>
                <button className="adm-icon-btn" onClick={() => setShowProfileModal(false)}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Contact Number</div>
                    <div style={{ fontWeight: 700 }}>{selectedAgent.phone}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>City / Region</div>
                    <div style={{ fontWeight: 700 }}>{selectedAgent.city}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Login Email</div>
                    <div style={{ fontWeight: 700, wordBreak: 'break-all' }}>{selectedAgent.email}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Login Password</div>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedAgent.password || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Admin Notes</div>
                  <textarea 
                    value={agentNotes} 
                    onChange={e => setAgentNotes(e.target.value)}
                    style={{ width: '100%', height: '100px', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', fontSize: '0.9rem', resize: 'none' }}
                    placeholder="Enter private notes about this agent..."
                  />
                  <button className="adm-btn adm-btn-outline" style={{ marginTop: '10px' }} onClick={saveNotes}>Save Notes</button>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Onboarding Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></div>
                      <div style={{ fontSize: '0.85rem' }}>Application Submitted • {new Date(selectedAgent.created_at).toLocaleDateString()}</div>
                    </div>
                    {selectedAgent.status !== 'Pending' && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: selectedAgent.status === 'Active' ? '#10b981' : '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></div>
                        <div style={{ fontSize: '0.85rem' }}>Status Updated to {selectedAgent.status}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '600px' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Pending Applicants</h3>
              <button className="adm-icon-btn" onClick={() => setShowApproveModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingAgents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No pending applications.</div>
              ) : pendingAgents.map(ag => {
                const creds = approvalFields[ag.id] || { email: ag.email, password: '' };
                return (
                  <div key={ag.id} style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{ag.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{ag.city} • {ag.phone}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="adm-btn adm-btn-outline" style={{ color: '#ef4444' }} onClick={() => handleStatusUpdate(ag.id, 'Rejected')}>Reject</button>
                        <button 
                          className="adm-btn adm-btn-primary" 
                          style={{ background: '#10b981' }} 
                          disabled={!creds.email || !creds.password}
                          onClick={() => handleStatusUpdate(ag.id, 'Active')}
                        >
                          Approve & Set Access
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Login Email</label>
                        <input 
                          type="email" 
                          placeholder="Email" 
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem' }} 
                          value={creds.email} 
                          onChange={e => setApprovalFields({ ...approvalFields, [ag.id]: { ...creds, email: e.target.value } })} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Login Password</label>
                        <input 
                          type="text" 
                          placeholder="Password" 
                          style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem' }} 
                          value={creds.password} 
                          onChange={e => setApprovalFields({ ...approvalFields, [ag.id]: { ...creds, password: e.target.value } })} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '0 0 24px 24px', textAlign: 'right' }}>
              <button className="adm-btn adm-btn-outline" onClick={() => setShowApproveModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      </>)}

      {/* Create Admin Agent Modal */}
      {showAdminAgentModal && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '520px' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Create Admin Agent</h3>
                <p style={{ fontSize: '0.8rem', color: '#6366f1', margin: '4px 0 0', fontWeight: 600 }}>⚡ Full Dashboard Access</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowAdminAgentModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f0f1ff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #c7d2fe', fontSize: '0.8rem', color: '#4338ca' }}>
                <strong>ℹ️ Admin Agent</strong> — Login karne par inhe poora Agent Dashboard dikhega (sab modules).
              </div>
              {[['name','Full Name','e.g. Rahul Singh','text'],['email','Login Email','e.g. rahul@a2p.com','email'],['password','Login Password','Min 6 characters','text'],['phone','Phone Number','+91 98765 43210','tel'],['city','City','e.g. Delhi','text']]
                .map(([key, label, ph, type]) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{label} {['name','email','password'].includes(key) && <span style={{ color: '#ef4444' }}>*</span>}</label>
                    <input
                      type={type}
                      placeholder={ph}
                      value={adminAgentForm[key]}
                      onChange={e => setAdminAgentForm({ ...adminAgentForm, [key]: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
              ))}
            </div>
            <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderRadius: '0 0 24px 24px' }}>
              <button className="adm-btn adm-btn-outline" onClick={() => setShowAdminAgentModal(false)}>Cancel</button>
              <button
                className="adm-btn adm-btn-primary"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
                onClick={handleCreateAdminAgent}
                disabled={processing === 'admin_create'}
              >
                <Shield size={16} /> {processing === 'admin_create' ? 'Creating...' : 'Create Admin Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCRM;

