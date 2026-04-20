import React from 'react';
import { Building2, Search, Map as MapIcon, Package, LayoutDashboard, MoreVertical, CreditCard } from 'lucide-react';

const DistributorCRM = () => {
  const distributors = [
    { id: 'DIST-101', name: 'Sharma Enterprises', region: 'North', credit: '₹5.0L', used: '₹1.2L', orders: 42, status: 'Premium' },
    { id: 'DIST-102', name: 'Global Skin Supplies', region: 'West', credit: '₹8.0L', used: '₹4.5L', orders: 156, status: 'Premium' },
    { id: 'DIST-103', name: 'Mehta Distributors', region: 'South', credit: '₹3.0L', used: '₹0.5L', orders: 28, status: 'Standard' },
    { id: 'DIST-104', name: 'Indo Cosmetic Hub', region: 'East', credit: '₹2.0L', used: '₹2.1L', orders: 12, status: 'At Risk' },
  ];

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Distributor CRM</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Relationship management and credit tracking for bulk partners.</p>
        </div>
        <button className="adm-btn adm-btn-primary"><Building2 size={18} /> New Distributor</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {distributors.map((d, i) => (
          <div key={i} className="adm-card" style={{ transition: 'all 0.2s' }}>
            <div className="adm-card-header" style={{ borderBottom: 'none', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="#3b82f6" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>{d.name}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ID: {d.id} • Region: {d.region}</span>
                </div>
              </div>
              <button className="adm-icon-btn" style={{ border: 'none', background: 'transparent' }}><MoreVertical size={16} /></button>
            </div>
            <div className="adm-card-body" style={{ paddingTop: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span className={`adm-badge adm-badge-${d.status === 'Premium' ? 'success' : (d.status === 'Standard' ? 'info' : 'danger')}`}>
                  {d.status} Partner
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{d.orders} Orders</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>Credit Utilization</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{d.used} / {d.credit}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <div style={{ 
                    width: `${(parseFloat(d.used.replace(/[₹L]/g, '')) / parseFloat(d.credit.replace(/[₹L]/g, ''))) * 100}%`, 
                    height: '100%', 
                    background: '#3b82f6', 
                    borderRadius: '10px' 
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '8px' }}>
                  <CreditCard size={14} /> Credit Limit
                </button>
                <button className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '8px' }}>
                  <LayoutDashboard size={14} /> Portal View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributorCRM;
