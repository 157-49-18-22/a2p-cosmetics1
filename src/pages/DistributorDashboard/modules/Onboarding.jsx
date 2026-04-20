import React, { useState } from 'react';
import { UserCheck, Plus, Search, CheckCircle, Clock, XCircle, ChevronRight, Upload } from 'lucide-react';

const steps = ['Basic Info', 'Documents', 'Area & Role', 'Review'];

const applicants = [
  { id: 'OB001', name: 'Sunita Verma', type: 'Dealer', zone: 'Zone A', date: '18 Apr 2026', status: 'Approved' },
  { id: 'OB002', name: 'Kiran Patel', type: 'Sub-Dealer', zone: 'Zone C', date: '19 Apr 2026', status: 'Pending' },
  { id: 'OB003', name: 'Mukesh Singh', type: 'Super Stockist', zone: 'Zone B', date: '20 Apr 2026', status: 'Pending' },
  { id: 'OB004', name: 'Priya Sharma', type: 'Dealer', zone: 'Zone D', date: '17 Apr 2026', status: 'Rejected' },
  { id: 'OB005', name: 'Amit Joshi', type: 'Dealer', zone: 'Zone A', date: '16 Apr 2026', status: 'Approved' },
];

const statusBadge = (s) => ({
  Approved: <span className="dd-badge dd-badge-green"><CheckCircle size={11} style={{ marginRight: 4 }} />{s}</span>,
  Pending: <span className="dd-badge dd-badge-yellow"><Clock size={11} style={{ marginRight: 4 }} />{s}</span>,
  Rejected: <span className="dd-badge dd-badge-red"><XCircle size={11} style={{ marginRight: 4 }} />{s}</span>,
}[s]);

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = applicants.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div>
          <h1 className="dd-module-title">Onboarding</h1>
          <p className="dd-module-subtitle">Manage new dealer & sub-dealer onboarding applications</p>
        </div>
        <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> New Application
        </button>
      </div>

      {/* Stats */}
      <div className="dd-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Applications', value: '38', color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Pending Review', value: '11', color: '#fffbeb', iconColor: '#d97706' },
          { label: 'Approved This Month', value: '22', color: '#f0fdf4', iconColor: '#16a34a' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <UserCheck size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Multi-step Form */}
      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header">
            <span className="dd-card-title">New Onboarding Application</span>
            <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '18px 22px 0' }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i <= step ? 'linear-gradient(135deg,#ec4899,#a855f7)' : '#f0eef8',
                    color: i <= step ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.3s'
                  }}>{i < step ? <CheckCircle size={15} /> : i + 1}</div>
                  <span style={{ fontSize: '0.72rem', color: i === step ? '#7c3aed' : '#9ca3af', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? 'linear-gradient(90deg,#ec4899,#a855f7)' : '#ede9f5', margin: '0 6px', marginBottom: 22 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="dd-card-body">
            {step === 0 && (
              <div className="dd-form-grid">
                <div className="dd-field"><label>Full Name</label><input placeholder="e.g. Rahul Sharma" /></div>
                <div className="dd-field"><label>Mobile Number</label><input placeholder="+91 XXXXX XXXXX" /></div>
                <div className="dd-field"><label>Email Address</label><input placeholder="example@email.com" /></div>
                <div className="dd-field"><label>Type</label>
                  <select><option>Dealer</option><option>Sub-Dealer</option><option>Super Stockist</option></select>
                </div>
                <div className="dd-field"><label>Business Name</label><input placeholder="Enter firm name" /></div>
                <div className="dd-field"><label>GST Number</label><input placeholder="GSTIN" /></div>
              </div>
            )}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Aadhar Card', 'PAN Card', 'Trade License', 'GST Certificate'].map(doc => (
                  <div key={doc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1.5px dashed #ede9f5', borderRadius: 12 }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e1b2e' }}>{doc}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>PDF, JPG (max 5MB)</p>
                    </div>
                    <button className="dd-btn dd-btn-outline" style={{ padding: '7px 14px', fontSize: '0.77rem' }}><Upload size={13} /> Upload</button>
                  </div>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="dd-form-grid">
                <div className="dd-field"><label>Assigned Zone</label>
                  <select><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option></select>
                </div>
                <div className="dd-field"><label>Role</label>
                  <select><option>Primary Dealer</option><option>Sub-Dealer</option><option>Super Stockist</option></select>
                </div>
                <div className="dd-field"><label>Product Categories</label>
                  <select><option>All Products</option><option>Face Care</option><option>Body Care</option><option>Hair Care</option></select>
                </div>
                <div className="dd-field"><label>Credit Limit (₹)</label><input placeholder="e.g. 50000" /></div>
              </div>
            )}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 14px' }} />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1e1b2e', marginBottom: 8 }}>Application Ready</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Review & submit to complete onboarding</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              {step > 0 && <button className="dd-btn dd-btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>}
              {step < steps.length - 1
                ? <button className="dd-btn dd-btn-primary" onClick={() => setStep(s => s + 1)}>Next <ChevronRight size={14} /></button>
                : <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(false)}><CheckCircle size={14} /> Submit Application</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      <div className="dd-card">
        <div className="dd-card-header">
          <span className="dd-card-title">All Applications</span>
          <div className="dd-search-inline">
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search applicant..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Type</th><th>Zone</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 600 }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td><span className="dd-badge dd-badge-purple">{a.type}</span></td>
                  <td>{a.zone}</td>
                  <td>{a.date}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" style={{ padding: '5px 10px', fontSize: '0.73rem' }}>View</button>
                      {a.status === 'Pending' && <button className="dd-btn dd-btn-success" style={{ padding: '5px 10px', fontSize: '0.73rem' }}>Approve</button>}
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

export default Onboarding;
