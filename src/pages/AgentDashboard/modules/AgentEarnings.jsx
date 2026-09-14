import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from '../../../hooks/useSession.js';
import {
  Wallet,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  X
} from 'lucide-react';

const API_BASE = `${API_BASE_URL}/agent`;

const AgentEarnings = () => {
  const { user: loggedAgent } = useSession();
  const agentId = loggedAgent?.id || '';
  const agentRole = loggedAgent?.role || '';
  const isAdmin = agentRole === 'Admin Agent';
  const agentParams = isAdmin ? '' : `?agent_id=${agentId}&role=${encodeURIComponent(agentRole)}`;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'all', 'this_week', 'this_month', 'last_month', 'custom'
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [codeFilter, setCodeFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchEarningsData();
  }, [agentId, agentRole]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/referral-orders${agentParams}`);
      const data = Array.isArray(res.data) ? res.data : [];
      
      // If sub-agent, strictly ensure only his orders
      const userOrders = !isAdmin && agentId
        ? data.filter(o => o.agent_name?.toLowerCase() === loggedAgent?.name?.toLowerCase() || !isAdmin)
        : data;

      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching referral orders for earnings:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Date filter helper
  const isDateInPeriod = (dateStr) => {
    if (!dateStr) return true;
    const orderDate = new Date(dateStr);
    const now = new Date();

    if (period === 'all') return true;

    if (period === 'this_week') {
      const firstDayOfWeek = new Date(now);
      const day = now.getDay() || 7; // Get current day (1=Mon, 7=Sun)
      firstDayOfWeek.setDate(now.getDate() - day + 1);
      firstDayOfWeek.setHours(0, 0, 0, 0);
      return orderDate >= firstDayOfWeek;
    }

    if (period === 'this_month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (period === 'last_month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        orderDate.getMonth() === prevMonth.getMonth() &&
        orderDate.getFullYear() === prevMonth.getFullYear()
      );
    }

    if (period === 'custom') {
      if (customRange.start && orderDate < new Date(customRange.start)) return false;
      if (customRange.end) {
        const endDay = new Date(customRange.end);
        endDay.setHours(23, 59, 59, 999);
        if (orderDate > endDay) return false;
      }
      return true;
    }

    return true;
  };

  // Filtered orders based on period, status, code, and search
  const filteredOrders = orders.filter(o => {
    if (!isDateInPeriod(o.order_date)) return false;
    if (statusFilter !== 'all' && (o.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (codeFilter !== 'all' && o.referral_code !== codeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchId = (o.order_id || '').toLowerCase().includes(q);
      const matchCode = (o.referral_code || '').toLowerCase().includes(q);
      const matchCust = (o.customer_name || '').toLowerCase().includes(q);
      if (!matchId && !matchCode && !matchCust) return false;
    }
    return true;
  });

  // Calculate dynamic stats
  const totalCommission = filteredOrders.reduce((sum, o) => sum + parseFloat(o.commission_amount || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.order_amount || 0), 0);
  const avgCommissionRate = totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(1) : '19.0';

  // Unique codes
  const uniqueCodes = [...new Set(orders.map(o => o.referral_code).filter(Boolean))];

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Referral Code', 'Customer', 'Order Amount (Rs)', 'Commission Earned (Rs)', 'Rate', 'Status'];
    const rows = filteredOrders.map(o => [
      o.order_id,
      new Date(o.order_date).toLocaleDateString('en-IN'),
      o.referral_code,
      o.customer_name || 'Customer',
      o.order_amount,
      o.commission_amount,
      o.commission_rate,
      o.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `my_earnings_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) return <div className="ag-loading">Loading Earnings & Commissions...</div>;

  return (
    <div className="ag-enter">
      {/* Header */}
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">My Earnings & Referrals</h1>
          <p className="ag-module-subtitle">
            Track your weekly and monthly referral sales, earned commissions, and performance stats.
          </p>
        </div>
        <div className="ag-header-btns">
          <button className="ag-btn ag-btn-outline" onClick={handleExportCSV}>
            <Download size={15} /> Export Statement
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="ag-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
              <Calendar size={16} color="#0ea5e9" /> Filter Period:
            </span>
            <button
              className={`ag-btn ${period === 'all' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
            <button
              className={`ag-btn ${period === 'this_week' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              onClick={() => setPeriod('this_week')}
            >
              This Week
            </button>
            <button
              className={`ag-btn ${period === 'this_month' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              onClick={() => setPeriod('this_month')}
            >
              This Month
            </button>
            <button
              className={`ag-btn ${period === 'last_month' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              onClick={() => setPeriod('last_month')}
            >
              Last Month
            </button>
            <button
              className={`ag-btn ${period === 'custom' ? 'ag-btn-primary' : 'ag-btn-outline'}`}
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              onClick={() => setPeriod('custom')}
            >
              Custom Range
            </button>
          </div>

          {period === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="date"
                value={customRange.start}
                onChange={e => setCustomRange({ ...customRange, start: e.target.value })}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
              <span style={{ color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={e => setCustomRange({ ...customRange, end: e.target.value })}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="ag-stats-grid">
        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
            <Wallet size={20} color="#10b981" />
          </div>
          <div className="ag-stat-value" style={{ color: '#10b981', fontWeight: 800 }}>
            ₹{totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="ag-stat-label">Total Commission Earned</div>
          <div className="ag-stat-change up">
            <ArrowUpRight size={14} /> {period === 'this_week' ? 'Per Week' : period === 'this_month' ? 'Per Month' : 'Selected Period'}
          </div>
        </div>

        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: 'rgba(14, 165, 233, 0.12)' }}>
            <ShoppingCart size={20} color="#0ea5e9" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>{totalOrdersCount}</div>
          <div className="ag-stat-label">Total Referral Orders</div>
          <div className="ag-stat-change up">
            <TrendingUp size={14} /> Orders converted
          </div>
        </div>

        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
            <TrendingUp size={20} color="#6366f1" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="ag-stat-label">Total Referral Sales</div>
          <div className="ag-stat-change up">
            <Sparkles size={14} /> Total cart volume
          </div>
        </div>

        <div className="ag-stat-card">
          <div className="ag-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
            <QrCode size={20} color="#f59e0b" />
          </div>
          <div className="ag-stat-value" style={{ fontWeight: 800 }}>{uniqueCodes.length}</div>
          <div className="ag-stat-label">Active Referral Codes</div>
          <div className="ag-stat-change up">
            <ArrowUpRight size={14} /> {avgCommissionRate}% Avg Rate
          </div>
        </div>
      </div>

      {/* Orders & Commission Table */}
      <div className="ag-card" style={{ marginTop: '24px' }}>
        <div className="ag-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="ag-card-title">Referral Orders & Commission Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
              Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'} for the selected filter
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search order ID, code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '7px 10px 7px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '100%' }}
              />
            </div>

            {/* Code Filter */}
            {uniqueCodes.length > 1 && (
              <select
                value={codeFilter}
                onChange={e => setCodeFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="all">All Codes</option>
                {uniqueCodes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
            >
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="ag-table-wrap">
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
              <ShoppingCart size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>No referral orders found for this period</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Share your referral code to start earning commissions!</p>
            </div>
          ) : (
            <table className="ag-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Referral Code</th>
                  <th>Customer</th>
                  <th>Order Amount</th>
                  <th>Commission Earned</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <tr key={order.id || idx}>
                    <td style={{ fontWeight: 700, color: '#0ea5e9' }}>{order.order_id}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem',
                        background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', border: '1px dashed #cbd5e1'
                      }}>
                        {order.referral_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.customer_name || 'Online Customer'}</td>
                    <td style={{ fontWeight: 700 }}>₹{parseFloat(order.order_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{
                        fontWeight: 800, color: '#16a34a', background: '#dcfce7',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem'
                      }}>
                        ₹{parseFloat(order.commission_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>{order.commission_rate || '19%'}</td>
                    <td>
                      <span className={`ag-badge ${
                        order.status === 'Delivered' || order.status === 'Completed' ? 'ag-badge-green' :
                        order.status === 'Processing' || order.status === 'Shipped' ? 'ag-badge-yellow' : 'ag-badge-red'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ag-icon-btn"
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="ag-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="ag-modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h2 className="ag-modal-title">Referral Commission Details</h2>
              <button className="ag-modal-close" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div className="ag-modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Order Number</span>
                  <strong style={{ color: '#0ea5e9' }}>{selectedOrder.order_id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Order Date</span>
                  <span>{new Date(selectedOrder.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Referral Code</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedOrder.referral_code}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Customer Name</span>
                  <strong>{selectedOrder.customer_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Order Status</span>
                  <span className={`ag-badge ${selectedOrder.status === 'Delivered' ? 'ag-badge-green' : 'ag-badge-yellow'}`}>{selectedOrder.status}</span>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#166534', fontSize: '0.85rem' }}>Gross Order Amount:</span>
                  <strong>₹{parseFloat(selectedOrder.order_amount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#166534', fontSize: '0.85rem' }}>Commission Rate:</span>
                  <strong>{selectedOrder.commission_rate || '19%'}</strong>
                </div>
                <div className="ag-divider" style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>Your Commission:</span>
                  <strong style={{ color: '#15803d', fontSize: '1.2rem' }}>
                    ₹{parseFloat(selectedOrder.commission_amount || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
            <div className="ag-modal-footer">
              <button className="ag-btn ag-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentEarnings;
