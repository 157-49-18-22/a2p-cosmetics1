import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import { 
  BadgeDollarSign, 
  Plus, 
  Trash2, 
  Info,
  Save,
  Layers,
  Zap,
  Target,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const CommissionSetup = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent';

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    referral_bonus_percent: 0,
    min_payout_threshold: 0,
    commission_cycle_days: 0
  });
  const [referralLevels, setReferralLevels] = useState([
    { id: 1, name: 'Level 1 (Master Agent)', enabled: true, description: 'Top-level agents who can refer sub-agents' },
    { id: 2, name: 'Level 2 (Sub Agent)', enabled: true, description: 'Middle-tier agents referred by master agents' },
    { id: 3, name: 'Level 3 (Sales Rep)', enabled: true, description: 'Field-level sales representatives' }
  ]);
  const [loading, setLoading] = useState(true);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState({
    category_name: '',
    base_rate: '',
    bonus_margin: '',
    referral_level: 'All Levels',
    status: 'Active',
    commission_type: 'percentage', // 'percentage' or 'fixed'
    campaign_name: '',
    start_date: '',
    end_date: ''
  });
  const [bulkPercent, setBulkPercent] = useState('');

  const tiers = [
    { name: 'Bronze', range: '₹0 - ₹50K', multiplier: '1.0x', color: '#c8a882' },
    { name: 'Silver', range: '₹50K - ₹2L', multiplier: '1.2x', color: '#9ca3af' },
    { name: 'Gold', range: '₹2L - ₹5L', multiplier: '1.5x', color: '#f59e0b' },
    { name: 'Platinum', range: '₹5L+', multiplier: '2.0x', color: '#6366f1' },
  ];

  useEffect(() => {
    fetchConfig();
  }, [agentId]);

  const fetchConfig = async () => {
    try {
      // Admin sees ALL rules; sub-agents see only their own
      const rulesUrl = (!isAdmin && agentId)
        ? `${API_BASE}/commission-rules?agent_id=${agentId}`
        : `${API_BASE}/commission-rules`;
      const [rulesRes, settingsRes] = await Promise.all([
        axios.get(rulesUrl),
        axios.get(`${API_BASE}/settings`)
      ]);
      setCategories(rulesRes.data || []);
      setSettings(settingsRes.data || settings);
    } catch (err) {
      console.error('Error fetching commission config:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.category_name || !newRule.base_rate) return alert('Please fill required fields');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/commission-rules`, { ...newRule, agent_id: agentId });
      setShowNewRuleModal(false);
      setNewRule({ 
        category_name: '', 
        base_rate: '', 
        bonus_margin: '', 
        referral_level: 'All Levels', 
        status: 'Active',
        commission_type: 'percentage',
        campaign_name: '',
        start_date: '',
        end_date: ''
      });
      fetchConfig();
    } catch (err) {
      console.error(err);
      setCategories([...categories, { 
        id: Date.now(), 
        ...newRule,
        agent_id: agentId,
        commission_type: newRule.commission_type || 'percentage',
        campaign_name: newRule.campaign_name || '',
        start_date: newRule.start_date || '',
        end_date: newRule.end_date || ''
      }]);
      setShowNewRuleModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkPercent) return alert('Enter a percentage');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/commission-rules/bulk-update`, { percentage: bulkPercent, agent_id: agentId });
      setShowBulkModal(false);
      setBulkPercent('');
      fetchConfig();
    } catch (err) {
      console.error(err);
      setCategories(categories.map(c => ({
        ...c,
        base_rate: (parseFloat(c.base_rate) + parseFloat(bulkPercent)) + '%'
      })));
      setShowBulkModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/settings`, settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Updated locally (API error)');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ag-loading">Loading Configuration...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">Commission Setup</h1>
          <p className="ag-module-subtitle">Configure commission percentages, bonuses, and performance tiers.</p>
        </div>
        <div className="ag-header-btns">
          <button className="ag-btn ag-btn-outline" onClick={() => setShowBulkModal(true)}><Layers size={16} /> Bulk Update</button>
          <button className="ag-btn ag-btn-primary" onClick={() => setShowNewRuleModal(true)}><Plus size={16} /> New Rule</button>
        </div>
      </div>

      <div className="ag-stats-grid">
        {tiers.map((tier, i) => (
          <div key={i} className="ag-stat-card" style={{ borderLeft: `4px solid ${tier.color}`, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: tier.color, textTransform: 'uppercase' }}>Tier • {tier.name}</span>
              <Target size={14} color={tier.color} />
            </div>
            <div className="ag-stat-value" style={{ fontSize: '1.25rem', marginTop: '6px', fontWeight: 800 }}>{tier.multiplier}</div>
            <div className="ag-stat-label" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{tier.range} sale</div>
          </div>
        ))}
      </div>

      <div className="ag-dashboard-grid">
        {/* Referral Levels Management */}
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Referral Levels Control</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Enable or disable entire referral hierarchy levels</p>
          </div>
          <div className="ag-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {referralLevels.map((level, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: level.enabled ? '#f0fdf4' : '#fef2f2',
                borderRadius: '12px',
                border: `1px solid ${level.enabled ? '#bbf7d0' : '#fecaca'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: level.enabled ? '#dcfce7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {level.enabled ? <CheckCircle size={20} color="#16a34a" /> : <AlertCircle size={20} color="#dc2626" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{level.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>{level.description}</p>
                  </div>
                </div>
                <button
                  className={`ag-btn ${level.enabled ? 'ag-btn-danger' : 'ag-btn-success'}`}
                  style={{ padding: '6px 16px', fontSize: '0.75rem' }}
                  onClick={async () => {
                    const newLevels = [...referralLevels];
                    newLevels[i].enabled = !newLevels[i].enabled;
                    setReferralLevels(newLevels);
                    try {
                      await axios.put(`${API_BASE}/referral-levels/${level.id}`, { enabled: newLevels[i].enabled });
                    } catch (err) {
                      console.error('Error updating level status:', err);
                      // Revert on error
                      newLevels[i].enabled = !newLevels[i].enabled;
                      setReferralLevels(newLevels);
                    }
                  }}
                >
                  {level.enabled ? 'Disable Level' : 'Enable Level'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Category Wise Commission */}
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Category Wise Commission</h3>
          </div>
          <div className="ag-table-wrap">
            <table className="ag-table">
              <thead>
                <tr>
                  <th>Product Category</th>
                  <th>Campaign</th>
                  <th>Referral Level</th>
                  <th>Type</th>
                  <th>Base Rate</th>
                  <th>Bonus Margin</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? categories.map((cat, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{cat.category_name}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{cat.campaign_name || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                        background: cat.referral_level === 'Level 1 (Master Agent)' ? '#eff6ff' : cat.referral_level === 'Level 2 (Sub Agent)' ? '#f0fdf4' : cat.referral_level === 'Level 3 (Sales Rep)' ? '#fffbeb' : '#f3eeff',
                        color: cat.referral_level === 'Level 1 (Master Agent)' ? '#0ea5e9' : cat.referral_level === 'Level 2 (Sub Agent)' ? '#16a34a' : cat.referral_level === 'Level 3 (Sales Rep)' ? '#d97706' : '#7c3aed'
                      }}>{cat.referral_level || 'All Levels'}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: cat.commission_type === 'percentage' ? '#eff6ff' : '#f0fdf4',
                        color: cat.commission_type === 'percentage' ? '#0ea5e9' : '#16a34a'
                      }}>
                        {cat.commission_type === 'percentage' ? '%' : '₹'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0ea5e9' }}>{cat.base_rate}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{cat.bonus_margin || '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cat.start_date && cat.end_date 
                        ? `${new Date(cat.start_date).toLocaleDateString()} - ${new Date(cat.end_date).toLocaleDateString()}`
                        : '—'
                      }
                    </td>
                    <td>
                      <span className={`ag-badge ${cat.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="ag-icon-btn"><Info size={14} /></button>
                        <button 
                          className="ag-icon-btn"
                          onClick={async () => {
                            if (window.confirm('Delete this rule?')) {
                              try {
                                await axios.delete(`${API_BASE}/commission-rules/${cat.id}`);
                                setCategories(categories.filter(c => c.id !== cat.id));
                              } catch (err) { console.error(err); }
                            }
                          }}
                        ><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <AlertCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      <p>No commission rules found. Create one to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Configuration */}
        <div className="ag-card">
          <div className="ag-card-header">
            <h3 className="ag-card-title">Global Rules</h3>
          </div>
          <div className="ag-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="ag-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" /> Referral Bonus (%)
              </label>
              <input type="number" value={settings.referral_bonus_percent} onChange={(e) => setSettings({...settings, referral_bonus_percent: e.target.value})} />
              <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Extra percentage for agents who bring in new sales through referrals.</p>
            </div>
            
            <div className="ag-field">
              <label>Minimum Payout Threshold (₹)</label>
              <input type="number" value={settings.min_payout_threshold} onChange={(e) => setSettings({...settings, min_payout_threshold: e.target.value})} />
            </div>

            <div className="ag-field">
              <label>Commission Cycle (Days)</label>
              <select value={settings.commission_cycle_days} onChange={(e) => setSettings({...settings, commission_cycle_days: e.target.value})}>
                <option value="7">Weekly (7 Days)</option>
                <option value="15">Bi-Weekly (15 Days)</option>
                <option value="30">Monthly (30 Days)</option>
              </select>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Info size={16} color="#0ea5e9" style={{ marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>Auto-Optimization</p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Turning this on will allow the AI to suggest commission adjustments based on sales velocity.</p>
                  <button className="ag-btn ag-btn-outline" style={{ marginTop: '10px', fontSize: '0.7rem', padding: '4px 10px' }}>Enable Smart Suggest</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button 
                className="ag-btn ag-btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleSaveSettings}
                disabled={saving}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="ag-modal-overlay" onClick={() => setShowNewRuleModal(false)}>
          <div className="ag-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(500px, 95%)' }}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Create New Commission Rule</h2>
              <button className="ag-modal-close" onClick={() => setShowNewRuleModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div className="ag-form-grid">
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Category Name *</label>
                  <input placeholder="e.g. Skin Care" value={newRule.category_name} onChange={e => setNewRule({...newRule, category_name: e.target.value})} />
                </div>
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Campaign Name (Optional)</label>
                  <input placeholder="e.g. Summer Sale 2026" value={newRule.campaign_name} onChange={e => setNewRule({...newRule, campaign_name: e.target.value})} />
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>Leave blank for standard commission rules.</p>
                </div>
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Applies to Level</label>
                  <select value={newRule.referral_level} onChange={e => setNewRule({...newRule, referral_level: e.target.value})}>
                    <option value="All Levels">All Levels</option>
                    <option value="Level 1 (Master Agent)">Level 1 — Master Agent (Top Level)</option>
                    <option value="Level 2 (Sub Agent)">Level 2 — Sub Agent (Middle Tier)</option>
                    <option value="Level 3 (Sales Rep)">Level 3 — Sales Rep (Field Level)</option>
                  </select>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>Commission will only apply to agents at this hierarchy level.</p>
                </div>
                <div className="ag-field">
                  <label>Commission Type *</label>
                  <select value={newRule.commission_type} onChange={e => setNewRule({...newRule, commission_type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="ag-field">
                  <label>{newRule.commission_type === 'percentage' ? 'Base Rate (%) *' : 'Fixed Amount (₹) *'}</label>
                  <input 
                    placeholder={newRule.commission_type === 'percentage' ? 'e.g. 10%' : 'e.g. 500'}
                    value={newRule.base_rate} 
                    onChange={e => {
                      if (newRule.commission_type === 'percentage') {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        setNewRule({...newRule, base_rate: val ? val + '%' : ''});
                      } else {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        setNewRule({...newRule, base_rate: val ? '₹' + val : ''});
                      }
                    }} 
                  />
                </div>
                <div className="ag-field">
                  <label>Bonus Margin (%)</label>
                  <input 
                    placeholder="e.g. 2%" 
                    value={newRule.bonus_margin} 
                    onChange={e => {
                      let val = e.target.value.replace(/[^0-9.]/g, '');
                      setNewRule({...newRule, bonus_margin: val ? val + '%' : ''});
                    }} 
                  />
                </div>
                <div className="ag-field">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={newRule.start_date} 
                    onChange={e => setNewRule({...newRule, start_date: e.target.value})} 
                  />
                </div>
                <div className="ag-field">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newRule.end_date} 
                    onChange={e => setNewRule({...newRule, end_date: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowNewRuleModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={handleAddRule} disabled={saving}>
                <CheckCircle size={16} /> {saving ? 'Saving...' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="ag-modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 'min(400px, 95%)' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Bulk Rate Adjustment</h2>
              <button className="ag-modal-close" onClick={() => setShowBulkModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>Adjust all active commission base rates by a specific percentage.</p>
              <div className="ag-field">
                <label>Percentage Change (+/-)</label>
                <input type="number" placeholder="e.g. 2" value={bulkPercent} onChange={e => setBulkPercent(e.target.value)} />
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={handleBulkUpdate} disabled={saving}>
                Apply to All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionSetup;
