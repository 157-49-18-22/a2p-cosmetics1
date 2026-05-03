import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  QrCode, 
  Copy, 
  Share2, 
  RefreshCw, 
  Plus, 
  Users, 
  TrendingUp, 
  Gift,
  CheckCircle,
  Eye,
  X,
  ChevronRight,
  Send,
  Zap,
  Award
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/agent';

const ReferralCode = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [newCode, setNewCode] = useState({ code: '', agent_id: '' });
  const [recognitionMsg, setRecognitionMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [codeRes, agentRes] = await Promise.all([
        axios.get(`${API_BASE}/referral-codes`),
        axios.get(`${API_BASE}/top`) // Get agents to assign codes to
      ]);
      setCodes(codeRes.data.length > 0 ? codeRes.data : [
        { id: 1, code: 'SUMMER2026', agent_name: 'Karan Mehra', usage_count: 45, status: 'Active' },
        { id: 2, code: 'GLOWAGENT', agent_name: 'Surbhi Gupta', usage_count: 22, status: 'Active' },
        { id: 3, code: 'NEWJOINER', agent_name: 'Rahul Sharma', usage_count: 12, status: 'Expired' }
      ]);
      setAgents(agentRes.data.length > 0 ? agentRes.data : [
        { id: 1, name: 'Karan Mehra' }, { id: 2, name: 'Surbhi Gupta' }, { id: 3, name: 'Rahul Sharma' }
      ]);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      // Fallback
      setCodes([
        { id: 1, code: 'SUMMER2026', agent_name: 'Karan Mehra', usage_count: 45, status: 'Active' },
        { id: 2, code: 'GLOWAGENT', agent_name: 'Surbhi Gupta', usage_count: 22, status: 'Active' }
      ]);
      setAgents([{ id: 1, name: 'Karan Mehra' }, { id: 2, name: 'Surbhi Gupta' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    if (!newCode.code || !newCode.agent_id) return alert('Fill all fields');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/referral-codes`, newCode);
      setShowCreateModal(false);
      setNewCode({ code: '', agent_id: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setCodes([...codes, { id: Date.now(), code: newCode.code, agent_name: agents.find(a => a.id == newCode.agent_id)?.name, usage_count: 0, status: 'Active' }]);
      setShowCreateModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSendRecognition = async () => {
    if (!recognitionMsg) return alert('Enter a message');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/referral-codes/1/recognize`, { message: recognitionMsg });
      setShowRecognitionModal(false);
      setRecognitionMsg('');
      alert('Recognition sent to Karan Mehra!');
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

  const totalUses = codes.reduce((acc, c) => acc + (c.usage_count || 0), 0);
  const activeCodes = codes.filter(c => c.status === 'Active').length;

  if (loading) return <div className="ag-loading">Loading Codes...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Referral Codes</h1>
          <p className="ag-module-subtitle">Generate and track referral codes for agent marketing campaigns.</p>
        </div>
         <button className="ag-btn ag-btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Create Code</button>
      </div>

      <div className="ag-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Active Codes', value: activeCodes, icon: QrCode, color: '#0ea5e9' },
          { label: 'Total Uses', value: totalUses, icon: TrendingUp, color: '#16a34a' },
          { label: 'Network Size', value: codes.length, icon: Users, color: '#6366f1' },
          { label: 'Rewards Claimed', value: '₹45K', icon: Gift, color: '#f59e0b' },
        ].map((stat, i) => (
          <div className="ag-stat-card" key={i}>
            <div className="ag-stat-icon" style={{ background: `${stat.color}15` }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div className="ag-stat-value" style={{ fontSize: '1.4rem' }}>{stat.value}</div>
            <div className="ag-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginTop: '24px' }}>
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
                  <th>Total Uses</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => (
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
                    <td style={{ fontWeight: 700 }}>{c.usage_count}</td>
                    <td>
                      <span className={`ag-badge ${c.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>{c.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="ag-icon-btn"
                          title="View Details"
                          onClick={() => alert(`Referral Code Details:\n\nCode: ${c.code}\nAgent: ${c.agent_name}\nUses: ${c.usage_count}\nStatus: ${c.status}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="ag-icon-btn"
                          title={c.status === 'Active' ? 'Deactivate Code' : 'Activate Code'}
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to mark this code as ${c.status === 'Active' ? 'Expired' : 'Active'}?`)) {
                              try {
                                const newStatus = c.status === 'Active' ? 'Expired' : 'Active';
                                await axios.put(`${API_BASE}/referral-codes/${c.id}/status`, { status: newStatus });
                                fetchData();
                              } catch (err) {
                                console.error('Error updating status:', err);
                                // Fallback for local testing if API fails
                                setCodes(codes.map(code => code.id === c.id ? { ...code, status: code.status === 'Active' ? 'Expired' : 'Active' } : code));
                              }
                            }
                          }}
                        >
                          <RefreshCw size={14} color={c.status === 'Active' ? '#e11d48' : '#16a34a'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Top Referral Agent</h3>
          </div>
          <div className="ag-card-body" style={{ textAlign: 'center' }}>
            <img 
              src="https://ui-avatars.com/api/?name=Karan+Mehra&background=0ea5e9&color=fff&size=80" 
              alt="top agent" 
              style={{ borderRadius: '20px', marginBottom: '16px', border: '4px solid #eff6ff' }}
            />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Karan Mehra</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Level 3 • Super Agent</p>
            
            <div className="ag-divider" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{codes[0]?.usage_count || 0}</p>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Signups</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>₹1.1L</p>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Sales</span>
              </div>
            </div>
            
            <button className="ag-btn ag-btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }} onClick={() => setShowRecognitionModal(true)}>
               <Award size={14} /> Send Recognition
             </button>
          </div>
        </div>
      </div>

      {/* Create Code Modal */}
      {showCreateModal && (
        <div className="ag-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
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
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Assign to Agent *</label>
                  <select value={newCode.agent_id} onChange={e => setNewCode({ ...newCode, agent_id: e.target.value })}>
                    <option value="">Select Agent</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
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
          <div className="ag-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Send Agent Recognition</h2>
              <button className="ag-modal-close" onClick={() => setShowRecognitionModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', padding: '12px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <Zap size={20} color="#0284c7" />
                <p style={{ fontSize: '0.8rem', color: '#0369a1', margin: 0 }}>Recognizing <strong>Karan Mehra</strong> for outstanding referral performance.</p>
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
