import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, Phone, Calendar, User, UserCheck, X, Trash2, MoreVertical, RefreshCcw, ChevronDown } from 'lucide-react';

const API = API_BASE_URL;

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'Customer', gender: 'Not set', dob: 'Not set', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/users/all`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch users', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      // Optimistically update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      const res = await fetch(`${API}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        showToast(`${userName || 'User'} is now set as ${newRole}!`, 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update role', 'danger');
        fetchUsers();
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      showToast('Network error updating role', 'danger');
      fetchUsers();
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/users/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, password: formData.password || 'a2p123' })
      });
      if (res.ok) {
        setShowAddModal(false);
        showToast(`${formData.role} created successfully!`);
        setFormData({ name: '', email: '', phone: '', role: 'Customer', gender: 'Not set', dob: 'Not set', password: '' });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create user', 'danger');
      }
    } catch (e) {
      console.error(e);
      showToast('Error creating user', 'danger');
    }
  };

  const filtered = (Array.isArray(users) ? users : []).filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || (u.role || 'Customer') === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="adm-fade-in" style={{ padding: '4px' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          background: toast.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#fff', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Users Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>Manage all ecosystem users, admins and permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchUsers} style={{ background: '#fff' }}>
            <RefreshCcw size={16} /> Refresh Data
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowAddModal(true)} style={{ background: '#10b981' }}>
            <Plus size={18} /> Add New User
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="adm-card" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="adm-search" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', maxWidth: '400px' }}>
            <Search size={16} color="#94a3b8" />
            <input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="adm-btn adm-btn-outline" style={{ border: '1px solid #e2e8f0' }}><Filter size={16} /> Filters</button>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ paddingLeft: '24px' }}>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Date of Birth</th>
                <th>Role</th>
                <th style={{ paddingRight: '24px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>Loading users data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>No users found matching your search.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={i} style={{ transition: '0.2s' }}>
                  <td style={{ paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: i % 2 === 0 ? '#eff6ff' : '#f5f3ff', color: i % 2 === 0 ? '#3b82f6' : '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                        {u.name?.[0] || '?'}
                      </div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.gender || 'Not set'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.phone || 'Not set'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{u.dob || 'Not set'}</td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <select
                        value={u.role || 'Customer'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value, u.name)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '6px 28px 6px 12px',
                          borderRadius: '20px',
                          background: u.role === 'Admin' ? '#eff6ff' : '#dcfce7',
                          color: u.role === 'Admin' ? '#1d4ed8' : '#15803d',
                          border: `1.5px solid ${u.role === 'Admin' ? '#bfdbfe' : '#bbf7d0'}`,
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease'
                        }}
                        title="Click to change user role"
                      >
                        <option value="Customer" style={{ background: '#fff', color: '#0f172a' }}>Customer</option>
                        <option value="Admin" style={{ background: '#fff', color: '#0f172a' }}>Admin</option>
                      </select>
                      <ChevronDown 
                        size={13} 
                        color={u.role === 'Admin' ? '#1d4ed8' : '#15803d'} 
                        style={{ 
                          position: 'absolute', 
                          right: '9px', 
                          pointerEvents: 'none' 
                        }} 
                      />
                    </div>
                  </td>
                  <td style={{ paddingRight: '24px', color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '24px', width: '480px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Add New User</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Register a new Customer or Admin profile.</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddUser} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '44px' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                  <input type="email" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '44px' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Login Password</label>
                  <input type="text" placeholder="Default: a2p123" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '44px' }} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="text" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '44px' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Account Role</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', height: '44px', padding: '0 12px' }} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <button type="button" className="adm-btn adm-btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#10b981' }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
