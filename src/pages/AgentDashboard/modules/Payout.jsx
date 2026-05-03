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
  Banknote,
  X,
  Printer,
  ChevronRight,
  FileText,
  Ban,
  Clock,
  AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/agent';

const Payout = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payouts`);
      setPayouts(res.data.length > 0 ? res.data : [
        { id: 1, agent_name: 'Karan Mehra', amount: 15000, request_time: '2026-04-25T10:00:00Z', status: 'Pending' },
        { id: 2, agent_name: 'Surbhi Gupta', amount: 5000, request_time: '2026-04-24T12:00:00Z', status: 'Paid' },
        { id: 3, agent_name: 'Rahul Sharma', amount: 8500, request_time: '2026-04-23T15:00:00Z', status: 'Rejected' }
      ]);
    } catch (err) {
      console.error('Error fetching payouts:', err);
      // Fallback
      setPayouts([
        { id: 1, agent_name: 'Karan Mehra', amount: 15000, request_time: '2026-04-25T10:00:00Z', status: 'Pending' },
        { id: 2, agent_name: 'Surbhi Gupta', amount: 5000, request_time: '2026-04-24T12:00:00Z', status: 'Paid' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setProcessing(true);
    try {
      await axios.put(`${API_BASE}/payouts/${id}/status`, { status });
      fetchPayouts();
    } catch (err) {
      console.error(err);
      setPayouts(payouts.map(p => p.id === id ? { ...p, status } : p));
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessBatch = async () => {
    setProcessing(true);
    try {
      await axios.post(`${API_BASE}/payouts/process-batch`, { status: 'Approved' });
      setShowBatchModal(false);
      fetchPayouts();
    } catch (err) {
      console.error(err);
      setPayouts(payouts.map(p => p.status === 'Pending' ? { ...p, status: 'Approved' } : p));
      setShowBatchModal(false);
    } finally {
      setProcessing(false);
    }
  };

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
          <button className="ag-btn ag-btn-outline" onClick={() => setShowStatementModal(true)}><Download size={16} /> Statement</button>
          <button className="ag-btn ag-btn-primary" onClick={() => setShowBatchModal(true)}><CreditCard size={16} /> Process Batch</button>
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
              <input placeholder="Filter by name..." value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
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
              {payouts.filter(p => p.agent_name.toLowerCase().includes(filter.toLowerCase())).map((pay, i) => (
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {pay.status === 'Pending' && (
                        <>
                          <button 
                            className="ag-btn ag-btn-primary" 
                            style={{ padding: '5px 12px', fontSize: '0.7rem' }}
                            onClick={() => handleUpdateStatus(pay.id, 'Approved')}
                            disabled={processing}
                          >Approve</button>
                          <button 
                            className="ag-btn ag-btn-danger" 
                            style={{ padding: '5px', borderRadius: '8px' }}
                            onClick={() => handleUpdateStatus(pay.id, 'Rejected')}
                            disabled={processing}
                          ><Ban size={14} /></button>
                        </>
                      )}
                      {pay.status === 'Approved' && (
                        <button 
                          className="ag-btn ag-btn-success" 
                          style={{ padding: '5px 12px', fontSize: '0.7rem' }}
                          onClick={() => handleUpdateStatus(pay.id, 'Paid')}
                          disabled={processing}
                        >Mark Paid</button>
                      )}
                      <button 
                        className="ag-btn ag-btn-outline" 
                        style={{ padding: '5px 12px', fontSize: '0.7rem' }}
                        onClick={() => setViewingReceipt(pay)}
                      >Receipt</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Modal */}
      {showStatementModal && (
        <div className="ag-modal-overlay" onClick={() => setShowStatementModal(false)}>
          <div className="ag-modal-content" onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Download Statement</h2>
              <button className="ag-modal-close" onClick={() => setShowStatementModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div className="ag-form-grid">
                <div className="ag-field"><label>Start Date</label><input type="date" /></div>
                <div className="ag-field"><label>End Date</label><input type="date" /></div>
                <div className="ag-field" style={{ gridColumn: '1 / -1' }}>
                  <label>Format</label>
                  <select>
                    <option>PDF Document</option>
                    <option>Excel Spreadsheet</option>
                    <option>CSV (Text)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowStatementModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={() => { alert('Statement generating...'); setShowStatementModal(false); }}>
                <Download size={16} /> Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Batch Modal */}
      {showBatchModal && (
        <div className="ag-modal-overlay" onClick={() => setShowBatchModal(false)}>
          <div className="ag-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Process Payout Batch</h2>
              <button className="ag-modal-close" onClick={() => setShowBatchModal(false)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body" style={{ textAlign: 'center' }}>
              <div style={{ background: '#eff6ff', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 20px', justifyContent: 'center' }}>
                <CreditCard size={30} color="#0ea5e9" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Approve all Pending?</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>
                This will mark all <strong>{payouts.filter(p => p.status === 'Pending').length}</strong> pending payouts as <strong>Approved</strong> and queue them for payment.
              </p>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => setShowBatchModal(false)}>Cancel</button>
              <button className="ag-btn ag-btn-primary" onClick={handleProcessBatch} disabled={processing}>
                {processing ? 'Processing...' : 'Confirm Batch Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {viewingReceipt && (
        <div className="ag-modal-overlay" onClick={() => setViewingReceipt(null)}>
          <div className="ag-modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Transaction Receipt</h2>
              <button className="ag-modal-close" onClick={() => setViewingReceipt(null)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body" style={{ padding: '0' }}>
              <div style={{ padding: '30px 24px', textAlign: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
                  {viewingReceipt.status === 'Paid' ? <CheckCircle2 size={32} color="#16a34a" /> : <Clock size={32} color="#f59e0b" />}
                </div>
                <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Transferred</h4>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>₹{Number(viewingReceipt.amount).toLocaleString()}</div>
                <span className={`ag-badge ${viewingReceipt.status === 'Paid' ? 'ag-badge-green' : 'ag-badge-yellow'}`}>{viewingReceipt.status}</span>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Transaction ID</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>PAY-{viewingReceipt.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Recipient</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{viewingReceipt.agent_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Date</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{new Date(viewingReceipt.request_time).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Payment Method</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Bank Transfer</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '24px', padding: '16px', border: '1.5px dashed #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="#94a3b8" />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>This is a computer-generated receipt and does not require a signature.</span>
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-outline" onClick={() => window.print()}><Printer size={16} /> Print</button>
              <button className="ag-btn ag-btn-primary" onClick={() => setViewingReceipt(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payout;
