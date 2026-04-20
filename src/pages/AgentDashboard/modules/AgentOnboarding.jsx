import React, { useState } from 'react';
import { 
  UserPlus, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  MoreVertical,
  ShieldCheck,
  Clock,
  XCircle
} from 'lucide-react';

const AgentOnboarding = () => {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');

  const applicants = [
    { id: 'AG-ONB-001', name: 'Raj Kumar', email: 'raj@gmail.com', city: 'Mumbai', status: 'Pending', date: '20 Apr 2026' },
    { id: 'AG-ONB-002', name: 'Sneha Jain', email: 'sneha@yahoo.com', city: 'Delhi', status: 'Approved', date: '19 Apr 2026' },
    { id: 'AG-ONB-003', name: 'Mohit Sharma', email: 'mohit@outlook.com', city: 'Bangalore', status: 'Rejected', date: '18 Apr 2026' },
    { id: 'AG-ONB-004', name: 'Pooja Singh', email: 'pooja@gmail.com', city: 'Pune', status: 'Pending', date: '17 Apr 2026' },
  ];

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Agent Onboarding</h1>
          <p className="ag-module-subtitle">Register new agents and track their verification status.</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={16} /> New Application
        </button>
      </div>

      {showForm && (
        <div className="ag-card" style={{ marginBottom: '24px', animation: 'agFadeIn 0.3s ease' }}>
          <div className="ag-card-header">
            <h3 className="ag-card-title">Agent Registration Wizard</h3>
            <button className="ag-btn ag-btn-outline" style={{ padding: '6px 12px' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="ag-card-body">
            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step >= s ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : '#f1f5f9',
                    color: step >= s ? '#fff' : '#94a3b8',
                    fontWeight: 700, fontSize: '0.85rem'
                  }}>{step > s ? <CheckCircle2 size={16} /> : s}</div>
                  {s < 3 && <div style={{ width: '60px', height: '2px', background: step > s ? '#0ea5e9' : '#e2e8f0', margin: '0 8px' }} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="ag-form-grid">
                <div className="ag-field"><label>Full Name</label><input placeholder="e.g. Rahul Sharma" /></div>
                <div className="ag-field"><label>Email Address</label><input placeholder="rahul@example.com" /></div>
                <div className="ag-field"><label>Phone Number</label><input placeholder="+91 9876543210" /></div>
                <div className="ag-field"><label>City</label><input placeholder="Mumbai" /></div>
                <div className="ag-field" style={{ gridColumn: 'span 2' }}>
                  <label>Full Address</label>
                  <textarea placeholder="Line 1, Line 2, Pincode" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <Upload size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Upload Aadhar / Pan</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PDF, JPG (Max 5MB)</p>
                  <button className="ag-btn ag-btn-outline" style={{ marginTop: '12px' }}>Browse Files</button>
                </div>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <Upload size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Agent Photo</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG (Professional Profile)</p>
                  <button className="ag-btn ag-btn-outline" style={{ marginTop: '12px' }}>Browse Files</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <ShieldCheck size={64} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                <h3 className="ag-module-title" style={{ fontSize: '1.4rem' }}>All Set!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Review the details one last time and submit for verification.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              {step > 1 && <button className="ag-btn ag-btn-outline" onClick={() => setStep(step - 1)}>Back</button>}
              {step < 3 ? (
                <button className="ag-btn ag-btn-primary" onClick={() => setStep(step + 1)}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button className="ag-btn ag-btn-primary" onClick={() => setShowForm(false)}>
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ag-card">
        <div className="ag-card-header">
          <h3 className="ag-card-title">Recent Applications</h3>
          <div className="ag-search-inline">
            <Search size={14} color="#94a3b8" />
            <input placeholder="Search applicant..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="ag-table-wrap">
          <table className="ag-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>{app.id}</td>
                  <td style={{ fontWeight: 600 }}>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.city}</td>
                  <td>
                    <span className={`ag-badge ${
                      app.status === 'Approved' ? 'ag-badge-green' : 
                      app.status === 'Pending' ? 'ag-badge-yellow' : 'ag-badge-red'
                    }`}>
                      {app.status === 'Approved' ? <CheckCircle2 size={12} style={{marginRight: 4}} /> : 
                       app.status === 'Pending' ? <Clock size={12} style={{marginRight: 4}} /> : 
                       <XCircle size={12} style={{marginRight: 4}} />}
                      {app.status}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{app.date}</td>
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

export default AgentOnboarding;
