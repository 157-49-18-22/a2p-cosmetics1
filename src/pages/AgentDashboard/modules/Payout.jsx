import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard, 
  History, 
  Download, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote
} from 'lucide-react';

const Payout = () => {
  const payouts = [
    { id: 'PAY-8821', agent: 'Sunita Sharma', amount: '₹12,450', date: '20 Apr 2026', method: 'Bank Transfer', status: 'Completed' },
    { id: 'PAY-8822', agent: 'Rahul Bose', amount: '₹8,200', date: '19 Apr 2026', method: 'UPI', status: 'Processing' },
    { id: 'PAY-8823', agent: 'Amit Malviya', amount: '₹5,600', date: '18 Apr 2026', method: 'Bank Transfer', status: 'Failed' },
    { id: 'PAY-8824', agent: 'Divya Khosla', amount: '₹22,100', date: '17 Apr 2026', method: 'UPI', status: 'Completed' },
    { id: 'PAY-8825', agent: 'Vikram Batra', amount: '₹15,000', date: '15 Apr 2026', method: 'Check', status: 'Completed' },
  ];

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Payout Management</h1>
          <p className="ag-module-subtitle">Process agent commissions and manage payment histories.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ag-btn ag-btn-outline"><Download size={16} /> Statement</button>
          <button className="ag-btn ag-btn-primary"><CreditCard size={16} /> Process Batch</button>
        </div>
      </div>

      <div className="ag-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#0ea5e915' }}><Wallet size={20} color="#0ea5e9" /></div>
          <div className="ag-stat-value">₹8.42L</div>
          <div className="ag-stat-label">Total Paid (This Month)</div>
          <div className="ag-stat-change up"><ArrowUpRight size={14} /> 15% increase</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#f59e0b15' }}><Clock size={20} color="#f59e0b" /></div>
          <div className="ag-stat-value">₹1.15L</div>
          <div className="ag-stat-label">Pending Settlements</div>
          <div className="ag-stat-change">Awaiting bank verification</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#e11d4815' }}><AlertCircle size={20} color="#e11d48" /></div>
          <div className="ag-stat-value">₹12.5K</div>
          <div className="ag-stat-label">Failed Transactions</div>
          <div className="ag-stat-change down">Action required for 3 IDs</div>
        </div>
      </div>

      <div className="ag-card" style={{ marginTop: '24px' }}>
        <div className="ag-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#0f2878" />
            <h3 className="ag-card-title">Payout Logs</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="ag-search-inline" style={{ width: '220px' }}>
              <Filter size={14} color="#94a3b8" />
              <input placeholder="Filter by status..." />
            </div>
            <button className="ag-btn ag-btn-outline" style={{ fontSize: '0.75rem' }}>Full History</button>
          </div>
        </div>
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Agent Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((pay, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>{pay.id}</td>
                  <td style={{ fontWeight: 600 }}>{pay.agent}</td>
                  <td style={{ fontWeight: 800 }}>{pay.amount}</td>
                  <td style={{ color: '#64748b' }}>{pay.date}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                      <Banknote size={14} color="#94a3b8" /> {pay.method}
                    </div>
                  </td>
                  <td>
                    <span className={`ag-badge ${
                      pay.status === 'Completed' ? 'ag-badge-green' : 
                      pay.status === 'Processing' ? 'ag-badge-yellow' : 'ag-badge-red'
                    }`}>
                      {pay.status === 'Completed' ? <CheckCircle2 size={12} style={{marginRight: 4}} /> : 
                       pay.status === 'Processing' ? <Clock size={12} style={{marginRight: 4}} /> : 
                       <AlertCircle size={12} style={{marginRight: 4}} />}
                      {pay.status}
                    </span>
                  </td>
                  <td>
                    <button className="ag-btn ag-btn-outline" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Receipt</button>
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

export default Payout;
