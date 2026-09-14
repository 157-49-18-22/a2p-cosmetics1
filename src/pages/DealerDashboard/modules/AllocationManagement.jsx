import React, { useState, useEffect } from 'react';
import { Layers, Box, TrendingUp, AlertCircle, Search, BarChart3, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig.js';
import { useAuth } from '../../../context/AuthContext';

const API = API_BASE_URL;

const AllocationManagement = ({ onNavigate }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealerInfo, setDealerInfo] = useState({ creditLimit: 500000, zone: 'Zone A' });

  const localDealer = JSON.parse(localStorage.getItem('active_dealer') || '{}');
  const dealer = user || localDealer;
  const dealerId = dealer?.id || 1;

  useEffect(() => {
    fetchAllocations();
  }, [dealerId]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/dealers/${dealerId}/allocations`);
      if (res.ok) {
        const data = await res.json();
        setAllocations(data.allocations || []);
        setDealerInfo({
          creditLimit: data.creditLimit || 500000,
          zone: data.zone || 'Zone A'
        });
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for dropdown filter
  const categories = ['all', ...Array.from(new Set(allocations.map(a => a.category).filter(Boolean)))];

  const filteredAllocations = allocations.filter(alloc => {
    const matchesSearch = alloc.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alloc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || alloc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const calculatePercentage = (used, allocated) => {
    if (!allocated || allocated <= 0) return 0;
    return Math.min(100, Math.round((used / allocated) * 100));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'dl-badge-green';
      case 'Low Stock': return 'dl-badge-yellow';
      case 'Critical': return 'dl-badge-red';
      default: return 'dl-badge-blue';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#dc2626';
    if (percentage >= 70) return '#ca8a04';
    return '#10b981';
  };

  // Summary Metrics Calculations
  const totalAllocatedUnits = allocations.reduce((sum, a) => sum + (a.allocated || 0), 0);
  const totalUsedUnits = allocations.reduce((sum, a) => sum + (a.used || 0), 0);
  const totalLimitVal = allocations.reduce((sum, a) => sum + (a.limitVal || 0), 0);
  const totalUtilizedVal = allocations.reduce((sum, a) => sum + ((a.used || 0) * (a.price || 0)), 0);
  const attentionCount = allocations.filter(a => a.status === 'Critical' || a.status === 'Low Stock').length;

  return (
    <div className="dl-enter">
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Allocation Management</h2>
          <p className="dl-module-subtitle">
            View real-time allocated products, stock usage, and limits for{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>📍 {dealerInfo.zone}</span>
          </p>
        </div>
        <div className="dl-header-btns">
          <button className="dl-btn dl-btn-outline" onClick={fetchAllocations} title="Refresh Data">
            <RefreshCw size={15} /> Refresh Allocations
          </button>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="dl-stats-grid">
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Layers size={20} />
          </div>
          <div className="dl-stat-value">{allocations.length}</div>
          <div className="dl-stat-label">Total Allocated Products</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Box size={20} />
          </div>
          <div className="dl-stat-value">{totalAllocatedUnits.toLocaleString('en-IN')}</div>
          <div className="dl-stat-label">Total Allocated Units</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
            <TrendingUp size={20} />
          </div>
          <div className="dl-stat-value">{totalUsedUnits.toLocaleString('en-IN')}</div>
          <div className="dl-stat-label">Units Used (Ordered)</div>
        </div>
        <div className="dl-stat-card">
          <div className="dl-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={20} />
          </div>
          <div className="dl-stat-value">{attentionCount}</div>
          <div className="dl-stat-label">Need Attention</div>
        </div>
      </div>

      {/* Allocation Details Table Card */}
      <div className="dl-card">
        <div className="dl-card-header">
          <h3 className="dl-card-title">Live Product Allocation Details</h3>
        </div>
        <div className="dl-card-body">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="dl-search-inline" style={{ flex: 1, minWidth: '200px' }}>
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search by product name or allocation ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="dl-field" 
              style={{ padding: '8px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', minWidth: '160px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Loading real allocation data from database...</p>
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p style={{ fontWeight: '600' }}>No allocations found matching your search.</p>
            </div>
          ) : (
            <div className="dl-table-wrap">
              <table className="dl-table">
                <thead>
                  <tr>
                    <th>Allocation ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Zone</th>
                    <th>Allocated</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Usage</th>
                    <th>Stock Limit Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllocations.map((alloc, i) => {
                    const percentage = calculatePercentage(alloc.used, alloc.allocated);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: '600' }}>{alloc.id}</td>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{alloc.product}</td>
                        <td>{alloc.category}</td>
                        <td><span className="dl-badge dl-badge-sky">{alloc.zone}</span></td>
                        <td style={{ fontWeight: '600' }}>{alloc.allocated}</td>
                        <td style={{ color: '#2563eb', fontWeight: '600' }}>{alloc.used}</td>
                        <td style={{ fontWeight: '700', color: alloc.remaining < 50 ? '#dc2626' : '#059669' }}>
                          {alloc.remaining}
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="dl-progress-bar" style={{ flex: 1, height: '6px', background: '#f1f5f9' }}>
                              <div 
                                className="dl-progress-fill" 
                                style={{ 
                                  width: `${percentage}%`,
                                  background: getProgressColor(percentage)
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: '600', minWidth: '35px' }}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600', color: '#475569' }}>{alloc.limit}</td>
                        <td>
                          <span className={`dl-badge ${getStatusColor(alloc.status)}`}>
                            {alloc.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Allocation Summary Cards */}
      <div className="dl-card" style={{ marginTop: '24px' }}>
        <div className="dl-card-header">
          <h3 className="dl-card-title">Live Allocation Summary & Business Limits</h3>
          <BarChart3 size={18} style={{ color: '#10b981' }} />
        </div>
        <div className="dl-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #d1fae5' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Active Product Lines</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#065f46' }}>
                {allocations.length} Products
              </div>
            </div>
            <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Total Stock Units</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e40af' }}>
                {totalAllocatedUnits.toLocaleString('en-IN')} units
              </div>
            </div>
            <div style={{ padding: '16px', background: '#fef9c3', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Total Allocation Value Limit</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#92400e' }}>
                ₹{totalLimitVal.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Utilized Order Value</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#991b1b' }}>
                ₹{totalUtilizedVal.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationManagement;
