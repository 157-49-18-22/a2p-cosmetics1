import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Package, LayoutDashboard, MoreVertical, CreditCard, X, Plus, Trash2, Mail, Phone, RefreshCcw, AlertCircle, Check, TrendingUp, Users, Target, Zap, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const DistributorCRM = () => {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [stats, setStats] = useState({ active_partners: 0, total_credit: 0, total_outstanding: 0, platinum_partners: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showZonesModal, setShowZonesModal] = useState(false);
  const [selectedDist, setSelectedDist] = useState(null);
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone: '', role: 'Senior Distributor', 
    tier: 'Bronze', region: '', credit_limit: 0, balance: 0, status: 'Active' 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [distRes, statsRes] = await Promise.all([
        fetch(`${API}/distributors`),
        fetch(`${API}/distributors/stats`)
      ]);
      const [distData, statsData] = await Promise.all([distRes.json(), statsRes.json()]);
      setDistributors(distData);
      setStats(statsData);
    } catch (e) {
      showToast('Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewZones = async (dist) => {
    setSelectedDist(dist);
    setShowZonesModal(true);
    try {
      setLoadingZones(true);
      const res = await fetch(`${API}/distributors/${dist.id}/zones`);
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast('Error loading zones', 'danger');
    } finally {
      setLoadingZones(false);
    }
  };

  const handlePortal = (dist) => {
    // For demo, we store the current distributor in localStorage to simulate "Logged in as"
    localStorage.setItem('active_distributor', JSON.stringify(dist));
    navigate('/distributor/dashboard');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/distributors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create');
      showToast('Distributor onboarding complete!');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'Senior Distributor', tier: 'Bronze', region: '', credit_limit: 0, balance: 0, status: 'Active' });
      fetchData();
    } catch (e) {
      showToast('Error onboarding partner', 'danger');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently remove "${name}" from the network?`)) return;
    try {
      const res = await fetch(`${API}/distributors/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Distributor removed');
      fetchData();
    } catch (e) {
      showToast('Failed to remove partner', 'danger');
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Platinum': return '#8b5cf6';
      case 'Gold': return '#f59e0b';
      case 'Silver': return '#64748b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="adm-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Distributor CRM</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Network expansion, credit risk assessment, and regional management.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchData} disabled={loading}>
            <RefreshCcw size={16} className={loading ? 'adm-spin' : ''} />
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => setShowModal(true)}>
            <Building2 size={18} /> New Distributor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[
          { label: 'Active Partners', val: stats.active_partners, icon: Users, color: '#3b82f6' },
          { label: 'Total Credit Limit', val: `₹${(stats.total_credit / 100000).toFixed(1)}L`, icon: CreditCard, color: '#10b981' },
          { label: 'Outstanding Balance', val: `₹${(stats.total_outstanding / 100000).toFixed(1)}L`, icon: TrendingUp, color: '#ef4444' },
          { label: 'Platinum Partners', val: stats.platinum_partners, icon: Zap, color: '#8b5cf6' }
        ].map((s, i) => (
          <div key={i} className="adm-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Distributor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading network data...</div>
        ) : distributors.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No distributors found in the system.</div>
        ) : distributors.map((d) => {
          const utilization = d.credit_limit > 0 ? (d.balance / d.credit_limit) * 100 : 0;
          return (
            <div key={d.id} className="adm-card" style={{ padding: '0', overflow: 'hidden', border: utilization > 90 ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <Building2 size={24} color={getTierColor(d.tier)} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{d.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span className="adm-badge" style={{ background: `${getTierColor(d.tier)}20`, color: getTierColor(d.tier), fontSize: '0.65rem', border: `1px solid ${getTierColor(d.tier)}40` }}>{d.tier}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{d.region || 'Zone Unassigned'}</span>
                    </div>
                  </div>
                </div>
                <button className="adm-icon-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(d.id, d.name)}><Trash2 size={16} /></button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    <Mail size={14} /> <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    <Phone size={14} /> {d.phone}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>Credit Utilization</span>
                    <span style={{ fontWeight: 800, color: utilization > 90 ? '#ef4444' : '#0f172a' }}>{utilization.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(utilization, 100)}%`, height: '100%', background: utilization > 90 ? '#ef4444' : (utilization > 70 ? '#f59e0b' : '#10b981') }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                    <span>Used: ₹{d.balance?.toLocaleString()}</span>
                    <span>Limit: ₹{d.credit_limit?.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="adm-btn adm-btn-outline" style={{ justifyContent: 'center', gap: '8px' }} onClick={() => handleViewZones(d)}><Target size={14} /> View Zones</button>
                  <button className="adm-btn adm-btn-primary" style={{ justifyContent: 'center', gap: '8px' }} onClick={() => handlePortal(d)}><LayoutDashboard size={14} /> Portal</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zones Modal */}
      {showZonesModal && selectedDist && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '500px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem' }}>Territory Management</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{selectedDist.name} - Zone Allocations</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowZonesModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingZones ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8' }}>Fetching zones...</p>
                ) : zones.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No specific zones allocated yet.</p>
                  </div>
                ) : zones.map((z, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MapPin size={18} color="#3b82f6" />
                      <span style={{ fontWeight: 700 }}>{z.zone_name}</span>
                    </div>
                    <span className="adm-badge adm-badge-success" style={{ fontSize: '0.65rem' }}>{z.status}</span>
                  </div>
                ))}
              </div>
              <button className="adm-btn adm-btn-primary" style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}>Allocate New Zone</button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Onboarding Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
          <div className="adm-fade-in" style={{ background: '#fff', borderRadius: '28px', width: '640px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Partner Onboarding</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Register a new distributor to the A2P ecosystem.</p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Company Full Name</label>
                  <input type="text" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                
                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                  <input type="email" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Contact Number</label>
                  <input type="text" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Login Password</label>
                  <input type="password" required className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>

                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Partnership Tier</label>
                  <select className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', height: '48px', padding: '0 16px' }} value={formData.tier} onChange={e => setFormData({ ...formData, tier: e.target.value })}>
                    <option value="Bronze">Bronze Partner</option>
                    <option value="Silver">Silver Partner</option>
                    <option value="Gold">Gold Partner</option>
                    <option value="Platinum">Platinum Partner</option>
                  </select>
                </div>
                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Operation Region</label>
                  <input type="text" placeholder="e.g. North India" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} />
                </div>

                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Initial Credit Limit (₹)</label>
                  <input type="number" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.credit_limit} onChange={e => setFormData({ ...formData, credit_limit: e.target.value })} />
                </div>
                <div>
                  <label className="adm-form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Current Balance (₹)</label>
                  <input type="number" className="adm-btn adm-btn-outline" style={{ width: '100%', textAlign: 'left', cursor: 'text', height: '48px', padding: '0 16px' }} value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                <button type="button" className="adm-btn adm-btn-outline" style={{ flex: 1, height: '48px', justifyContent: 'center' }} onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{ flex: 1, height: '48px', justifyContent: 'center' }}>Complete Onboarding</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorCRM;


