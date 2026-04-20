import React from 'react';
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
  MoreVertical
} from 'lucide-react';

const Logs = () => {
  const activityLogs = [
    { id: '#8891', user: 'Admin', action: 'Commission Setup Updated', category: 'Settings', time: '10 min ago', status: 'Success' },
    { id: '#8890', user: 'Sneha Rao', action: 'New Agent Onboarded', category: 'Onboarding', time: '25 min ago', status: 'Success' },
    { id: '#8889', user: 'System', action: 'Payout Batch Failed', category: 'Payout', time: '1 hr ago', status: 'Error' },
    { id: '#8888', user: 'Rahul Bose', action: 'Referral Code Generated', category: 'Marketing', time: '3 hr ago', status: 'Success' },
    { id: '#8887', user: 'Admin', action: 'Hierarchy Level Added', category: 'Hierarchy', time: '5 hr ago', status: 'Warning' },
    { id: '#8886', user: 'System', action: 'Daily Backup Completed', category: 'Database', time: '12 hr ago', status: 'Success' },
    { id: '#8885', user: 'Amit Shah', action: 'Login Attempt Failed', category: 'Security', time: '1 day ago', status: 'Warning' },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Success': return <CheckCircle size={14} color="#16a34a" />;
      case 'Error': return <AlertCircle size={14} color="#e11d48" />;
      case 'Warning': return <AlertCircle size={14} color="#f59e0b" />;
      default: return <Info size={14} color="#0ea5e9" />;
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Settings': return <Settings size={14} color="#64748b" />;
      case 'Onboarding': return <User size={14} color="#0ea5e9" />;
      default: return <ScrollText size={14} color="#64748b" />;
    }
  };

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
                  <td style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{log.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0ea5e9' }}>
                        {log.user[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{log.user}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.action}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      {getCategoryIcon(log.category)}
                      {log.category}
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{log.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(log.status)}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: log.status === 'Success' ? '#16a34a' : log.status === 'Error' ? '#e11d48' : '#f59e0b'
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
        <div className="ag-card-body" style={{ borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>Showing 1-7 of 1,240 results</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ag-btn ag-btn-outline" style={{ padding: '6px 12px' }}>Previous</button>
            <button className="ag-btn ag-btn-outline" style={{ padding: '6px 12px' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
