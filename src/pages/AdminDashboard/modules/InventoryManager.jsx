import React from 'react';
import { AlertCircle, ArrowDown, ArrowUp, Boxes, Package, RefreshCw, Truck } from 'lucide-react';

const InventoryManager = () => {
  const stockSummary = [
    { label: 'Total Qty', value: '4,821', icon: Boxes, color: '#3b82f6' },
    { label: 'Stock Value', value: '₹18.4L', icon: Package, color: '#8b5cf6' },
    { label: 'Low Stock', value: '12 Items', icon: AlertCircle, color: '#f59e0b' },
    { label: 'In-Transit', value: '850 units', icon: Truck, color: '#10b981' },
  ];

  const warehouseLogs = [
    { item: 'Face Serum Vit-C', type: 'Restock', qty: '+500', agent: 'Manish G.', date: 'Today, 10:45 AM' },
    { item: 'Face Wash Neem', type: 'Order #421', qty: '-42', agent: 'System', date: 'Today, 09:15 AM' },
    { item: 'Body Wash Rose', type: 'Return', qty: '+2', agent: 'Kiran K.', date: 'Yesterday, 04:30 PM' },
    { item: 'Lip Balm Berry', type: 'Adjustment', qty: '-5', agent: 'Surbhi S.', date: 'Yesterday, 11:00 AM' },
  ];

  return (
    <div className="adm-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Master Inventory Control</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time warehouse synchronization and stock adjustment.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="adm-btn adm-btn-outline"><RefreshCw size={18} /> Sync Warehouse</button>
          <button className="adm-btn adm-btn-primary"><Box size={18} /> Update Stock</button>
        </div>
      </div>

      <div className="adm-stats-grid">
        {stockSummary.map((s, i) => (
          <div key={i} className="adm-stat-box">
            <div className="adm-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="adm-stat-details">
              <span>{s.label}</span>
              <h3 style={{ fontSize: '1.2rem' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Detailed Stock Levels</h3>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Qty</th>
                  <th>Min Level</th>
                  <th>Lead Time</th>
                  <th>Sync Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 'Face Serum Vit-C', c: 42, m: 100, l: '3 Days', s: 'Syncing' },
                  { n: 'Face Wash Neem', c: 320, m: 50, l: '5 Days', s: 'Synced' },
                  { n: 'Body Wash Rose', c: 156, m: 40, l: '4 Days', s: 'Synced' },
                  { n: 'Moisturizer Aloe', c: 84, m: 30, l: '2 Days', s: 'Synced' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{row.n}</td>
                    <td style={{ color: row.c < row.m ? '#f43f5e' : 'inherit', fontWeight: 800 }}>{row.c}</td>
                    <td>{row.m}</td>
                    <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.l}</td>
                    <td><span style={{ fontSize: '0.7rem', fontWeight: 800, color: row.s === 'Synced' ? '#10b981' : '#3b82f6' }}>● {row.s}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">Recent Inventory Logs</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '0' }}>
            {warehouseLogs.map((log, i) => (
              <div key={i} style={{ 
                padding: '16px 20px', 
                borderBottom: i < warehouseLogs.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: log.qty.startsWith('+') ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {log.qty.startsWith('+') ? <ArrowUp size={16} color="#15803d" /> : <ArrowDown size={16} color="#b91c1c" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.item}</span>
                    <span style={{ fontWeight: 800, color: log.qty.startsWith('+') ? '#16a34a' : '#e11d48' }}>{log.qty}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    <span>By {log.agent}</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Box placeholder for the missing icon in lucide-react if any issue, using Boxes instead
const Box = Boxes;

export default InventoryManager;
