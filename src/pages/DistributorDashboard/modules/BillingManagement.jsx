import React, { useState } from 'react';
import { FileText, Plus, Search, Download, Send, CheckCircle, Clock, XCircle, Eye, Printer } from 'lucide-react';

const invoices = [
  { id: 'INV-1042', dealer: 'Sharma Traders', zone: 'Zone A', amount: '₹24,500', date: '20 Apr 2026', due: '30 Apr 2026', status: 'Pending' },
  { id: 'INV-1041', dealer: 'Mehta Co.', zone: 'Zone C', amount: '₹18,200', date: '18 Apr 2026', due: '28 Apr 2026', status: 'Paid' },
  { id: 'INV-1040', dealer: 'Ravi Distribution', zone: 'Zone B', amount: '₹31,800', date: '15 Apr 2026', due: '25 Apr 2026', status: 'Overdue' },
  { id: 'INV-1039', dealer: 'Sunita Verma Stores', zone: 'Zone D', amount: '₹9,600', date: '12 Apr 2026', due: '22 Apr 2026', status: 'Paid' },
  { id: 'INV-1038', dealer: 'Kiran Agencies', zone: 'Zone A', amount: '₹15,000', date: '10 Apr 2026', due: '20 Apr 2026', status: 'Overdue' },
];

const statusBadge = (s) => ({
  Paid: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Pending: <span className="dd-badge dd-badge-yellow"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Overdue: <span className="dd-badge dd-badge-red"><XCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
}[s]);

const BillingManagement = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = invoices.filter(inv =>
    (filterStatus === 'All' || inv.status === filterStatus) &&
    (inv.dealer.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalBilled = invoices.reduce((a, i) => a + parseInt(i.amount.replace(/[₹,]/g, '')), 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((a, i) => a + parseInt(i.amount.replace(/[₹,]/g, '')), 0);
  const totalPending = invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + parseInt(i.amount.replace(/[₹,]/g, '')), 0);

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

      {/* Create Invoice Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">Create New Invoice</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="dd-card-body">
            <div className="dd-form-grid">
              <div className="dd-field"><label>Select Dealer</label>
                <select>{invoices.map(i => <option key={i.id}>{i.dealer}</option>)}</select>
              </div>
              <div className="dd-field"><label>Invoice Date</label><input type="date" /></div>
              <div className="dd-field"><label>Due Date</label><input type="date" /></div>
              <div className="dd-field"><label>Payment Terms</label>
                <select><option>Net 10</option><option>Net 15</option><option>Net 30</option></select>
              </div>
            </div>

            <div className="dd-divider" />

            {/* Line Items */}
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4a0f8a', marginBottom: 12 }}>Line Items</p>
            <table className="dd-table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Product</th><th>Qty</th><th>Rate (₹)</th><th>Amount</th></tr></thead>
              <tbody>
                {[0, 1].map(i => (
                  <tr key={i}>
                    <td><input style={{ border: '1px solid #ede9f5', borderRadius: 7, padding: '6px 10px', fontSize: '0.8rem', width: '100%' }} placeholder="Product name" /></td>
                    <td><input type="number" style={{ border: '1px solid #ede9f5', borderRadius: 7, padding: '6px 10px', fontSize: '0.8rem', width: 70 }} defaultValue={1} /></td>
                    <td><input type="number" style={{ border: '1px solid #ede9f5', borderRadius: 7, padding: '6px 10px', fontSize: '0.8rem', width: 90 }} /></td>
                    <td style={{ color: '#7c3aed', fontWeight: 600 }}>₹0</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <button className="dd-btn dd-btn-outline" style={{ fontSize: '0.77rem', padding: '7px 14px' }}><Plus size={12} /> Add Item</button>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Subtotal: <strong style={{ color: '#1e1b2e' }}>₹0</strong></p>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>GST (18%): <strong style={{ color: '#1e1b2e' }}>₹0</strong></p>
                <p style={{ fontSize: '1rem', color: '#7c3aed', fontWeight: 700 }}>Total: ₹0</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-outline"><Printer size={14} /> Preview</button>
              <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><Send size={14} /> Generate & Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Table */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
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
              <tr><th>Invoice ID</th><th>Dealer</th><th>Zone</th><th>Amount</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 700 }}>{inv.id}</td>
                  <td style={{ fontWeight: 600 }}>{inv.dealer}</td>
                  <td>{inv.zone}</td>
                  <td style={{ fontWeight: 700 }}>{inv.amount}</td>
                  <td>{inv.date}</td>
                  <td style={{ color: inv.status === 'Overdue' ? '#e11d48' : '#374151', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>{inv.due}</td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Eye size={13} /></button>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 9px' }}><Download size={13} /></button>
                      {inv.status !== 'Paid' && <button className="dd-btn dd-btn-success" style={{ padding: '5px 10px', fontSize: '0.73rem' }}>Mark Paid</button>}
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

export default BillingManagement;
