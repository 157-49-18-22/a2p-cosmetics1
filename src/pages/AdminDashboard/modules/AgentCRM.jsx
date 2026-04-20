import React from 'react';
import { Search, MapPin, UserCheck, Star, Shield, ExternalLink, Mail, Phone } from 'lucide-react';

const AgentCRM = () => {
  const agents = [
    { id: 'AG-001', name: 'Karan Mehra', tier: 'Platinum', team: 24, commission: '₹12.5K', status: 'Active', zone: 'Zone A', city: 'Delhi' },
    { id: 'AG-002', name: 'Surbhi Gupta', tier: 'Gold', team: 18, commission: '₹8.2K', status: 'Active', zone: 'Zone C', city: 'Gurugram' },
    { id: 'AG-003', name: 'Vikram Singh', tier: 'Silver', team: 12, commission: '₹5.6K', status: 'Active', zone: 'Zone B', city: 'Noida' },
    { id: 'AG-004', name: 'Anita Desai', tier: 'Gold', team: 11, commission: '₹6.8K', status: 'On Leave', zone: 'Zone D', city: 'Jaipur' },
    { id: 'AG-005', name: 'Raj Kumar', tier: 'Bronze', team: 4, commission: '₹1.1K', status: 'Pending', zone: 'Zone E', city: 'Mumbai' },
  ];

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Agent CRM</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Comprehensive database of your field agents and referral network.</p>
        </div>
        <button className="adm-btn adm-btn-primary"><UserCheck size={18} /> Approve Agents</button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <div className="adm-search" style={{ width: '400px' }}>
            <Search size={16} />
            <input type="text" placeholder="Search by name, ID, zone or tier..." />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="adm-btn adm-btn-outline"><Shield size={16} /> Roles</button>
            <button className="adm-btn adm-btn-outline">Export</button>
          </div>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Agent Profile</th>
                <th>Performance Tier</th>
                <th>Coverage</th>
                <th>Earnings</th>
                <th>Team Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((ag) => (
                <tr key={ag.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b'
                      }}>
                        {ag.name[0]}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{ag.name}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {ag.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{ag.tier}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{ag.zone}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{ag.city}</div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: 800, color: '#16a34a' }}>{ag.commission}</span></td>
                  <td style={{ fontWeight: 700 }}>{ag.team} agents</td>
                  <td>
                    <span className={`adm-badge adm-badge-${ag.status === 'Active' ? 'success' : (ag.status === 'Pending' ? 'info' : 'warning')}`}>
                      {ag.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="adm-icon-btn"><ExternalLink size={14} /></button>
                      <button className="adm-icon-btn"><Mail size={14} /></button>
                      <button className="adm-icon-btn"><Phone size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentCRM;
