import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  Settings,
  MoreVertical,
  Clock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/agent';

const Logs = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/logs`);
        setActivityLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved':
      case 'Success': return <CheckCircle size={14} color="#16a34a" />;
      case 'Rejected':
      case 'Error': return <AlertCircle size={14} color="#e11d48" />;
      case 'Pending':
      case 'Warning': return <AlertCircle size={14} color="#f59e0b" />;
      default: return <Info size={14} color="#0ea5e9" />;
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Settings': return <Settings size={14} color="#64748b" />;
      case 'Onboarding': return <User size={14} color="#0ea5e9" />;
      case 'Payout': return <Clock size={14} color="#64748b" />;
      default: return <ScrollText size={14} color="#64748b" />;
    }
  };

  if (loading) return <div className="ag-loading">Loading Logs...</div>;

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">System Logs</h1>
          <p className="ag-module-subtitle">Audit trail of all agent and administrative activities.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ag-btn ag-btn-danger"><Trash2 size={16} /> Clear Logs</button>
          <button className="ag-btn ag-btn-primary"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="ag-card">
        <div className="ag-card-header">
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="ag-search-inline" style={{ width: '280px' }}>
              <Search size={14} color="#94a3b8" />
              <input placeholder="Search logs..." />
            </div>
            <div className="ag-search-inline" style={{ width: '180px' }}>
              <Filter size={14} color="#94a3b8" />
              <select style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.8rem' }}>
                <option>All Categories</option>
                <option>Security</option>
                <option>Onboarding</option>
                <option>Payout</option>
              </select>
            </div>
          </div>
          <button className="ag-btn ag-btn-outline" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>Real-time Feed</button>
        </div>
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User</th>
                <th>Activity / Action</th>
                <th>Category</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log, i) => (
                <tr key={i}>
                  <td style={{ color: '#94a3b8', fontSize: '0.75rem' }}>#{log.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0ea5e9' }}>
                        {log.agent_name ? log.agent_name[0] : 'S'}
                      </div>
                      <span style={{ fontWeight: 600 }}>{log.agent_name || 'System'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.activity_text}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      {getCategoryIcon(log.activity_type)}
                      {log.activity_type}
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(log.status)}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: log.status === 'Success' || log.status === 'Approved' ? '#16a34a' : log.status === 'Error' || log.status === 'Rejected' ? '#e11d48' : '#f59e0b'
                      }}>{log.status}</span>
                    </div>
                  </td>
                  <td>
                    <button className="ag-icon-btn"><MoreVertical size={14} /></button>
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

export default Logs;
