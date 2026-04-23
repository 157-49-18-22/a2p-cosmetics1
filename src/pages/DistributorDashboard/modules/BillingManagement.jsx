import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Search, Download, Send, CheckCircle, Clock, XCircle, Eye, Printer } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/distributor';

const statusBadge = (s) => ({
  Paid: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Unpaid: <span className="dd-badge dd-badge-yellow"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Overdue: <span className="dd-badge dd-badge-red"><XCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
}[s] || <span className="dd-badge dd-badge-yellow">{s}</span>);

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const distributorId = 1;

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE}/bills/${distributorId}`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const filtered = bills.filter(inv =>
    (filterStatus === 'All' || inv.status === filterStatus) &&
    (inv.bill_number?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBilled = bills.reduce((a, i) => a + parseFloat(i.amount), 0);
  const totalPaid = bills.filter(i => i.status === 'Paid').reduce((a, i) => a + parseFloat(i.amount), 0);
  const totalPending = bills.filter(i => i.status !== 'Paid').reduce((a, i) => a + parseFloat(i.amount), 0);

  if (loading) return <div className="dd-loading">Loading Billing...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Billing Management</h1>
          <p className="dd-module-subtitle">Create and manage invoices, payments & dues</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dd-btn dd-btn-outline"><Download size={14} /> Export</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Invoice</button>
        </div>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Billed', value: `₹${(totalBilled / 1000).toFixed(1)}K`, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Total Collected', value: `₹${(totalPaid / 1000).toFixed(1)}K`, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Outstanding Dues', value: `₹${(totalPending / 1000).toFixed(1)}K`, color: '#fff0f3', iconColor: '#e11d48' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <FileText size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Paid', 'Unpaid', 'Overdue'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid', borderColor: filterStatus === s ? '#a855f7' : '#ede9f5',
                background: filterStatus === s ? '#f3eeff' : '#fff', color: filterStatus === s ? '#7c3aed' : '#6b7280', transition: 'all 0.2s'
              }}>{s}</button>
            ))}
          </div>
          <div className="dd-search-inline">
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search invoice..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead>
              <tr><th>Invoice ID</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 700 }}>{inv.bill_number}</td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(inv.amount).toLocaleString()}</td>
                  <td style={{ color: inv.status === 'Overdue' ? '#e11d48' : '#374151', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Eye size={13} /></button>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;


