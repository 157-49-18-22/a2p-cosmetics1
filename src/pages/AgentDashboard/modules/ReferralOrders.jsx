import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
  Filter,
  Search,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  QrCode,
  Award
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const ReferralOrders = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent' || !agentId;
  const agentParams = isAdmin ? '' : `?agent_id=${agentId}&role=${encodeURIComponent(agentRole)}`;

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total_referral_orders: 0,
    total_referral_revenue: 0,
    active_referral_codes: 0,
    top_performing_code: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCode, setFilterCode] = useState('all');
  const [filterDate, setFilterDate] = useState({ start: '', end: '' });
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    fetchReferralOrders();
  }, []);

  const fetchReferralOrders = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/referral-orders${agentParams}`),
        axios.get(`${API_BASE}/referral-orders/stats${agentParams}`)
      ]);
      setOrders(ordersRes.data || []);
      setStats(statsRes.data || {
        total_referral_orders: 0,
        total_referral_revenue: 0,
        active_referral_codes: 0,
        top_performing_code: ''
      });
    } catch (err) {
      console.error('Error fetching referral orders:', err);
      setOrders([]);
      setStats({
        total_referral_orders: 0,
        total_referral_revenue: 0,
        active_referral_codes: 0,
        top_performing_code: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesCode = filterCode === 'all' || order.referral_code === filterCode;
    
    const matchesDate = 
      (!filterDate.start || new Date(order.order_date) >= new Date(filterDate.start)) &&
      (!filterDate.end || new Date(order.order_date) <= new Date(filterDate.end));
    
    return matchesSearch && matchesStatus && matchesCode && matchesDate;
  });

  const uniqueReferralCodes = [...new Set(orders.map(o => o.referral_code))];

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Referral Code', 'Agent', 'Customer', 'Category', 'Amount', 'Commission', 'Rate', 'Date', 'Status'];
    const csvData = filteredOrders.map(order => [
      order.order_id,
      order.referral_code,
      order.agent_name,
      order.customer_name,
      order.product_category,
      order.order_amount,
      order.commission_amount,
      order.commission_rate,
      order.order_date,
      order.status
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `referral_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="ag-badge ag-badge-green"><CheckCircle size={11} style={{ marginRight: 3 }} />{status}</span>;
      case 'Pending':
        return <span className="ag-badge ag-badge-yellow"><Clock size={11} style={{ marginRight: 3 }} />{status}</span>;
      case 'Cancelled':
        return <span className="ag-badge ag-badge-red"><AlertCircle size={11} style={{ marginRight: 3 }} />{status}</span>;
      default:
        return <span className="ag-badge">{status}</span>;
    }
  };

  if (loading) return <div className="ag-loading">Loading Referral Orders...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">Referral Orders</h1>
          <p className="ag-module-subtitle">View and manage orders generated through referral codes.</p>
        </div>
        <div className="ag-header-btns">
          <button className="ag-btn ag-btn-outline" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ag-stats-grid">
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#0ea5e915' }}>
            <ShoppingCart size={20} color="#0ea5e9" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.total_referral_orders}
          </div>
          <div className="ag-stat-label">Total Referral Orders</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#16a34a15' }}>
            <DollarSign size={20} color="#16a34a" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            ₹{stats.total_referral_revenue.toLocaleString()}
          </div>
          <div className="ag-stat-label">Total Referral Revenue</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#6366f115' }}>
            <QrCode size={20} color="#6366f1" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.active_referral_codes}
          </div>
          <div className="ag-stat-label">Active Referral Codes</div>
        </div>
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: '#f59e0b15' }}>
            <Award size={20} color="#f59e0b" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            {stats.top_performing_code}
          </div>
          <div className="ag-stat-label">Top Performing Code</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ag-card" style={{ marginTop: '24px' }}>
        <div className="ag-card-header">
          <h3 className="ag-card-title">Referral Orders Management</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="ag-search-inline" style={{ width: '200px' }}>
              <Search size={14} color="#94a3b8" />
              <input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              <option value="all">All Codes</option>
              {uniqueReferralCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={14} color="#94a3b8" />
              <input
                type="date"
                value={filterDate.start}
                onChange={(e) => setFilterDate({ ...filterDate, start: e.target.value })}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <span>to</span>
              <input
                type="date"
                value={filterDate.end}
                onChange={(e) => setFilterDate({ ...filterDate, end: e.target.value })}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>

            {(searchTerm || filterStatus !== 'all' || filterCode !== 'all' || filterDate.start || filterDate.end) && (
              <button
                className="ag-btn ag-btn-outline"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCode('all');
                  setFilterDate({ start: '', end: '' });
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Referral Code</th>
                <th>Agent</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Order Amount</th>
                <th>Commission</th>
                <th>Rate</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map((order, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>{order.order_id}</td>
                  <td>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700,
                      background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: '1px dashed #cbd5e1'
                    }}>{order.referral_code}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.agent_name}</td>
                  <td>{order.customer_name}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.product_category}</td>
                  <td style={{ fontWeight: 700 }}>₹{order.order_amount.toLocaleString()}</td>
                  <td style={{ fontWeight: 800, color: '#16a34a' }}>₹{order.commission_amount.toLocaleString()}</td>
                  <td style={{ color: '#6366f1', fontWeight: 700 }}>{order.commission_rate}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <button
                      className="ag-btn ag-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      onClick={() => setViewingOrder(order)}
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                    <p>No referral orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="ag-modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="ag-modal-content" style={{ maxWidth: 'min(500px, 95%)' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Order Details</h2>
              <button className="ag-modal-close" onClick={() => setViewingOrder(null)}><AlertCircle size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Order ID</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0ea5e9', margin: 0 }}>{viewingOrder.order_id}</p>
                  </div>
                  {getStatusBadge(viewingOrder.status)}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Order Amount</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>₹{viewingOrder.order_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Commission Earned</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>₹{viewingOrder.commission_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Referral Code</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{viewingOrder.referral_code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Agent</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{viewingOrder.agent_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Customer</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{viewingOrder.customer_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Product Category</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{viewingOrder.product_category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Commission Rate</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{viewingOrder.commission_rate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order Date</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{new Date(viewingOrder.order_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-primary" onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralOrders;