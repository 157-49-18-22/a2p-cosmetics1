import React, { useState } from 'react';
import { FileText, Download, Eye, Search, Filter, Calendar, DollarSign } from 'lucide-react';

const InvoiceManagement = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const invoices = [
    { id: 'INV-2024-089', orderId: 'ORD-2024-089', date: '21/08/2026', amount: '₹12,500', status: 'Paid', dueDate: '21/08/2026' },
    { id: 'INV-2024-088', orderId: 'ORD-2024-088', date: '20/08/2026', amount: '₹8,750', status: 'Pending', dueDate: '27/08/2026' },
    { id: 'INV-2024-087', orderId: 'ORD-2024-087', date: '19/08/2026', amount: '₹15,200', status: 'Paid', dueDate: '19/08/2026' },
    { id: 'INV-2024-086', orderId: 'ORD-2024-086', date: '18/08/2026', amount: '₹6,800', status: 'Overdue', dueDate: '18/08/2026' },
    { id: 'INV-2024-085', orderId: 'ORD-2024-085', date: '17/08/2026', amount: '₹22,100', status: 'Paid', dueDate: '17/08/2026' },
    { id: 'INV-2024-084', orderId: 'ORD-2024-084', date: '16/08/2026', amount: '₹9,450', status: 'Pending', dueDate: '23/08/2026' },
  ];

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (invoiceId) => {
    alert(`Downloading invoice: ${invoiceId}`);
  };

  const handleView = (invoiceId) => {
    alert(`Viewing invoice details: ${invoiceId}`);
  };

  return (
    <div className="dl-enter">
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Invoice Management</h2>
          <p className="dl-module-subtitle">View, download, and track your invoices</p>
        </div>
      </div>

      {/* Stats */}
      <div className="dl-stats-grid">
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <FileText size={20} />
          </div>
          <div className="dl-stat-value">{invoices.length}</div>
          <div className="dl-stat-label">Total Invoices</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <DollarSign size={20} />
          </div>
          <div className="dl-stat-value">{invoices.filter(i => i.status === 'Pending').length}</div>
          <div className="dl-stat-label">Pending Payments</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Calendar size={20} />
          </div>
          <div className="dl-stat-value">{invoices.filter(i => i.status === 'Overdue').length}</div>
          <div className="dl-stat-label">Overdue</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <DollarSign size={20} />
          </div>
          <div className="dl-stat-value">₹75,800</div>
          <div className="dl-stat-label">Total Amount</div>
        </div>
      </div>

      {/* Filters */}
      <div className="dl-card">
        <div className="dl-card-header">
          <h3 className="dl-card-title">All Invoices</h3>
        </div>
        <div className="dl-card-body">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="dl-search-inline" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search by invoice ID or order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="dl-field" 
              style={{ padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="dl-table-wrap">
            <table className="dl-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>{invoice.id}</td>
                    <td>{invoice.orderId}</td>
                    <td>{invoice.date}</td>
                    <td>{invoice.dueDate}</td>
                    <td style={{ fontWeight: '600' }}>{invoice.amount}</td>
                    <td>
                      <span className={`dl-badge ${
                        invoice.status === 'Paid' ? 'dl-badge-green' : 
                        invoice.status === 'Pending' ? 'dl-badge-yellow' : 'dl-badge-red'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="dl-btn dl-btn-outline" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleView(invoice.id)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="dl-btn dl-btn-primary" 
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleDownload(invoice.id)}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;
