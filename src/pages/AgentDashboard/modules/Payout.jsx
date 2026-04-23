import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API_BASE = 'http://localhost:5000/api/agent';

const Payout = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/payouts`);
        setPayouts(res.data);
      } catch (err) {
        console.error('Error fetching payouts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  const totalPaid = payouts.filter(p => p.status === 'Paid').reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingPaid = payouts.filter(p => p.status === 'Pending' || p.status === 'Approved').reduce((acc, p) => acc + Number(p.amount), 0);
  const failedPaid = payouts.filter(p => p.status === 'Rejected').reduce((acc, p) => acc + Number(p.amount), 0);

  if (loading) return <div className="ag-loading">Loading Payouts...</div>;

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
          <div className="ag-stat-value">₹{(totalPaid / 1000).toFixed(1)}K</div>
          <div className="ag-stat-label">Total Paid (All Time)</div>
          <div className="ag-stat-change up"><ArrowUpRight size={14} /> Overall history</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#f59e0b15' }}><Clock size={20} color="#f59e0b" /></div>
          <div className="ag-stat-value">₹{(pendingPaid / 1000).toFixed(1)}K</div>
          <div className="ag-stat-label">Pending Settlements</div>
          <div className="ag-stat-change">Awaiting bank verification</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#e11d4815' }}><AlertCircle size={20} color="#e11d48" /></div>
          <div className="ag-stat-value">₹{(failedPaid / 1000).toFixed(1)}K</div>
          <div className="ag-stat-label">Failed Transactions</div>
          <div className="ag-stat-change down">Action required for rejected</div>
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((pay, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>PAY-{pay.id}</td>
                  <td style={{ fontWeight: 600 }}>{pay.agent_name}</td>
                  <td style={{ fontWeight: 800 }}>₹{Number(pay.amount).toLocaleString()}</td>
                  <td style={{ color: '#64748b' }}>{new Date(pay.request_time).toLocaleDateString()}</td>
                  <td>
                    <span className={`ag-badge ${
                      pay.status === 'Paid' ? 'ag-badge-green' : 
                      pay.status === 'Pending' || pay.status === 'Approved' ? 'ag-badge-yellow' : 'ag-badge-red'
                    }`}>
                      {pay.status === 'Paid' ? <CheckCircle2 size={12} style={{marginRight: 4}} /> : 
                       pay.status === 'Pending' || pay.status === 'Approved' ? <Clock size={12} style={{marginRight: 4}} /> : 
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
