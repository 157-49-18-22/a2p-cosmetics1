import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Search, Download, Send, CheckCircle, Clock, XCircle, Eye, Printer } from 'lucide-react';

const API_BASE = `${API_BASE_URL}/distributors`;

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

  const [newBill, setNewBill] = useState({ bill_number: '', amount: '', status: 'Unpaid', due_date: '' });
  const [selectedBill, setSelectedBill] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${distributorId}/bills`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    if (!newBill.bill_number || !newBill.amount) return alert('Bill number and amount are required');
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/bills`, { ...newBill, distributor_id: distributorId });
      setShowForm(false);
      setNewBill({ bill_number: '', amount: '', status: 'Unpaid', due_date: '' });
      fetchBills();
    } catch (err) {
      console.error('Error adding bill:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportBills = () => {
    if (bills.length === 0) return alert('No invoices to export');
    const headers = ['Invoice ID', 'Amount (₹)', 'Due Date', 'Status'];
    const rows = bills.map(b => [b.bill_number, b.amount, b.due_date, b.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `A2P_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadSingle = (bill) => {
    const content = `A2P COSMETICS - INVOICE\n\nInvoice No: ${bill.bill_number}\nAmount: ₹${bill.amount}\nDue Date: ${bill.due_date}\nStatus: ${bill.status}\n\nThank you for your business!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${bill.bill_number}.txt`;
    link.click();
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
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
          <button className="dd-btn dd-btn-outline" onClick={handleExportBills}><Download size={14} /> Export</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Invoice</button>
        </div>
      </div>

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

      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Generate New Invoice</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Invoice Number</label><input placeholder="e.g. INV-2024-001" value={newBill.bill_number} onChange={e => setNewBill({ ...newBill, bill_number: e.target.value })} /></div>
              <div className="dd-field"><label>Amount (₹)</label><input type="number" placeholder="25000" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} /></div>
              <div className="dd-field"><label>Due Date</label><input type="date" value={newBill.due_date} onChange={e => setNewBill({ ...newBill, due_date: e.target.value })} /></div>
              <div className="dd-field"><label>Status</label>
                <select value={newBill.status} onChange={e => setNewBill({ ...newBill, status: e.target.value })}><option>Unpaid</option><option>Paid</option><option>Overdue</option></select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleAddBill} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Generating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }} onClick={() => handleViewDetails(inv)}><Eye size={13} /></button>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }} onClick={() => handleDownloadSingle(inv)}><Download size={13} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No invoices found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedBill && (
        <div className="dd-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '30px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Invoice</h2>
                  <p style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: 4 }}>{selectedBill.bill_number}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{parseFloat(selectedBill.amount).toLocaleString()}</div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.05em' }}>Total Amount</span>
                </div>
              </div>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Issue Date</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(selectedBill.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Due Date</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedBill.status === 'Overdue' ? '#e11d48' : '#1f2937' }}>{new Date(selectedBill.due_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Status</label>
                  <div>{statusBadge(selectedBill.status)}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Payment Method</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bank Transfer</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 12px 0', color: '#64748b' }}>Distributor Info</h4>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                  <strong>Rahul Sharma</strong><br />
                  Senior Distributor (North Zone)<br />
                  rahul.sharma@example.com
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dd-btn dd-btn-outline" style={{ flex: 1 }} onClick={() => setShowViewModal(false)}>Close</button>
                <button className="dd-btn dd-btn-primary" style={{ flex: 1 }} onClick={() => window.print()}><Printer size={14} /> Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;


