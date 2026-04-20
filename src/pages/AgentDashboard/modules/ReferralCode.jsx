import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';

const ReferralCode = () => {
  const codes = [
    { code: 'A2P-SUMMER-24', agent: 'Sneha Rao', uses: 124, revenue: '₹42,000', expiry: '30 Jun 2026', status: 'Active' },
    { code: 'A2P-GOLD-007', agent: 'Rahul Bose', uses: 86, revenue: '₹18,500', expiry: 'Unlimited', status: 'Active' },
    { code: 'A2P-RETAIL-X', agent: 'Amit Shah', uses: 42, revenue: '₹12,400', expiry: 'Expired', status: 'Inactive' },
  ];

  const [copied, setCopied] = useState(null);

  const handleCopy = (code) => {
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Referral Codes</h1>
          <p className="ag-module-subtitle">Generate and track referral codes for agent marketing campaigns.</p>
        </div>
        <button className="ag-btn ag-btn-primary"><Plus size={16} /> Create Code</button>
      </div>

      <div className="ag-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Active Codes', value: '1,240', icon: QrCode, color: '#0ea5e9' },
          { label: 'Referral Sales', value: '4.2K', icon: TrendingUp, color: '#16a34a' },
          { label: 'Network Size', value: '850', icon: Users, color: '#6366f1' },
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
                  <th>Revenue</th>
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
                    <td style={{ fontWeight: 600 }}>{c.agent}</td>
                    <td style={{ fontWeight: 700 }}>{c.uses}</td>
                    <td style={{ color: '#16a34a', fontWeight: 800 }}>{c.revenue}</td>
                    <td>
                      <span className={`ag-badge ${c.status === 'Active' ? 'ag-badge-green' : 'ag-badge-red'}`}>{c.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="ag-icon-btn"><Eye size={14} /></button>
                        <button className="ag-icon-btn"><RefreshCw size={14} /></button>
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
              src="https://ui-avatars.com/api/?name=Sneha+Rao&background=0ea5e9&color=fff&size=80" 
              alt="top agent" 
              style={{ borderRadius: '20px', marginBottom: '16px', border: '4px solid #eff6ff' }}
            />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sneha Rao</h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Level 3 • Super Agent</p>
            
            <div className="ag-divider" />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>412</p>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Signups</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>₹1.1L</p>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Sales</span>
              </div>
            </div>
            
            <button className="ag-btn ag-btn-primary" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
              <Share2 size={14} /> Send Recognition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCode;
