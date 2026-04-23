import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BadgeDollarSign, 
  Plus, 
  Trash2, 
  Info,
  Save,
  Layers,
  Zap,
  Target
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/agent';

const CommissionSetup = () => {
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    referral_bonus_percent: 0,
    min_payout_threshold: 0,
    commission_cycle_days: 0
  });
  const [loading, setLoading] = useState(true);

  const tiers = [
    { name: 'Bronze', range: '₹0 - ₹50K', multiplier: '1.0x', color: '#c8a882' },
    { name: 'Silver', range: '₹50K - ₹2L', multiplier: '1.2x', color: '#9ca3af' },
    { name: 'Gold', range: '₹2L - ₹5L', multiplier: '1.5x', color: '#f59e0b' },
    { name: 'Platinum', range: '₹5L+', multiplier: '2.0x', color: '#6366f1' },
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [rulesRes, settingsRes] = await Promise.all([
          axios.get(`${API_BASE}/commission-rules`),
          axios.get(`${API_BASE}/settings`)
        ]);
        setCategories(rulesRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error('Error fetching commission config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (loading) return <div className="ag-loading">Loading Configuration...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Commission Setup</h1>
          <p className="ag-module-subtitle">Configure commission percentages, bonuses, and performance tiers.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ag-btn ag-btn-outline"><Layers size={16} /> Bulk Update</button>
          <button className="ag-btn ag-btn-primary"><Plus size={16} /> New Rule</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {tiers.map((tier, i) => (
          <div key={i} className="ag-stat-card" style={{ borderLeft: `4px solid ${tier.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: tier.color, textTransform: 'uppercase' }}>Tier • {tier.name}</span>
              <Target size={14} color={tier.color} />
            </div>
            <div className="ag-stat-value" style={{ fontSize: '1.2rem', marginTop: '4px' }}>{tier.multiplier}</div>
            <div className="ag-stat-label">{tier.range} sale</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
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
                  <th>Base Rate</th>
                  <th>Bonus Margin</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{cat.category_name}</td>
                    <td style={{ fontWeight: 700, color: '#0ea5e9' }}>{cat.base_rate}</td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{cat.bonus_margin}</td>
                    <td>
                      <span className={`ag-badge ${cat.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="ag-icon-btn"><Info size={14} /></button>
                        <button className="ag-icon-btn"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ag-card-body" style={{ borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
            <button className="ag-btn ag-btn-primary"><Save size={16} /> Save Changes</button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSetup;
