import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

const API_BASE = `${API_BASE_URL}/agent`;

const AgentOnboarding = () => {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdown(null);
    if (openDropdown !== null) {
      document.addEventListener('click', closeDropdown);
    }
    return () => document.removeEventListener('click', closeDropdown);
  }, [openDropdown]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  const [aadharFile, setAadharFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const aadharInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applicants`);
      setApplicants(res.data);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        fetchApplicants();
      } catch (err) {
        console.error('Error deleting agent:', err);
        alert('Failed to delete agent');
      }
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill out all required fields (Name, Email, Phone).');
      return;
    }

    try {
      let document_url = '';
      let profile_pic = '';

      // Upload Aadhar/Pan if exists
      if (aadharFile) {
        const aadharFormData = new FormData();
        aadharFormData.append('image', aadharFile);
        const res = await axios.post(`${API_BASE_URL}/upload`, aadharFormData);
        document_url = res.data.imageUrl;
      }

      // Upload Photo if exists
      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append('image', photoFile);
        const res = await axios.post(`${API_BASE_URL}/upload`, photoFormData);
        profile_pic = res.data.imageUrl;
      }

      await axios.post(`${API_BASE}/onboard`, {
        ...formData,
        document_url,
        profile_pic
      });

      setShowForm(false);
      setStep(1);
      setFormData({ name: '', email: '', phone: '', city: '', address: '' });
      setAadharFile(null);
      setPhotoFile(null);
      fetchApplicants();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('Error submitting application:', errorMsg, err);
      alert('Failed to submit application: ' + errorMsg);
    }
  };

  const filtered = applicants.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div className="ag-header-info">
          <h1 className="ag-module-title">Agent Onboarding</h1>
          <p className="ag-module-subtitle">Register new agents and track their verification status.</p>
        </div>
        <div className="ag-header-btns">
          <button className="ag-btn ag-btn-primary" onClick={() => setShowForm(!showForm)}>
            <UserPlus size={16} /> New Application
          </button>
        </div>
      </div>

      {showForm && (
        <div className="ag-card" style={{ marginBottom: '24px', animation: 'agFadeIn 0.3s ease' }}>
          <div className="ag-card-header">
            <h3 className="ag-card-title">Agent Registration Wizard</h3>
            <button className="ag-btn ag-btn-outline" style={{ padding: '6px 12px' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="ag-card-body">
            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', flexWrap: 'nowrap', gap: '5px', overflowX: 'auto', paddingBottom: '10px' }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step >= s ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : '#f1f5f9',
                    color: step >= s ? '#fff' : '#94a3b8',
                    fontWeight: 700, fontSize: '0.85rem'
                  }}>{step > s ? <CheckCircle2 size={16} /> : s}</div>
                  {s < 3 && <div style={{ width: window.innerWidth <= 480 ? '30px' : '60px', height: '2px', background: step > s ? '#0ea5e9' : '#e2e8f0', margin: '0 8px' }} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="ag-form-grid">
                <div className="ag-field"><label>Full Name</label><input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahul Sharma" /></div>
                <div className="ag-field"><label>Email Address</label><input name="email" value={formData.email} onChange={handleInputChange} placeholder="rahul@example.com" /></div>
                <div className="ag-field"><label>Phone Number</label><input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" /></div>
                <div className="ag-field"><label>City</label><input name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" /></div>
                <div className="ag-field" style={{ gridColumn: window.innerWidth <= 768 ? 'auto' : 'span 2' }}>
                  <label>Full Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Line 1, Line 2, Pincode" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <div 
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => aadharInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={aadharInputRef} 
                    style={{ display: 'none' }} 
                    onChange={(e) => setAadharFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg"
                  />
                  <Upload size={32} color={aadharFile ? "#0ea5e9" : "#94a3b8"} style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {aadharFile ? aadharFile.name : 'Upload Aadhar / Pan'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PDF, JPG (Max 5MB)</p>
                  <button className="ag-btn ag-btn-outline" style={{ marginTop: '12px' }}>
                    {aadharFile ? 'Change File' : 'Browse Files'}
                  </button>
                </div>
                <div 
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => photoInputRef.current.click()}
                >
                  <input 
                    type="file" 
                    ref={photoInputRef} 
                    style={{ display: 'none' }} 
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                    accept=".jpg,.jpeg,.png"
                  />
                  <Upload size={32} color={photoFile ? "#0ea5e9" : "#94a3b8"} style={{ marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {photoFile ? photoFile.name : 'Agent Photo'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG (Professional Profile)</p>
                  <button className="ag-btn ag-btn-outline" style={{ marginTop: '12px' }}>
                    {photoFile ? 'Change Photo' : 'Browse Files'}
                  </button>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              {step > 1 && <button className="ag-btn ag-btn-outline" style={{ flex: window.innerWidth <= 768 ? 1 : 'none', justifyContent: 'center' }} onClick={() => setStep(step - 1)}>Back</button>}
              {step < 3 ? (
                <button className="ag-btn ag-btn-primary" style={{ flex: window.innerWidth <= 768 ? 2 : 'none', justifyContent: 'center' }} onClick={() => setStep(step + 1)}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button className="ag-btn ag-btn-primary" style={{ flex: window.innerWidth <= 768 ? 2 : 'none', justifyContent: 'center' }} onClick={handleSubmit}>
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ag-card">
        <div className="ag-card-header" style={{ flexDirection: window.innerWidth <= 600 ? 'column' : 'row', alignItems: window.innerWidth <= 600 ? 'stretch' : 'center', gap: 12 }}>
          <h3 className="ag-card-title">Recent Applications</h3>
          <div className="ag-search-inline" style={{ width: window.innerWidth <= 600 ? '100%' : '240px' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Search applicant..." style={{ width: '100%' }} value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {filtered.map((app, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>#{app.id}</td>
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
                  <td style={{ color: '#94a3b8' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {app.status === 'Pending' && (
                        <>
                          <button 
                            className="ag-btn ag-btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                            onClick={async () => {
                              try {
                                await axios.put(`${API_BASE}/applicants/${app.id}/status`, { status: 'Active' });
                                fetchApplicants();
                              } catch (err) { console.error(err); }
                            }}
                          >Approve</button>
                          <button 
                            className="ag-btn ag-btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '0.65rem', color: '#e11d48', borderColor: '#e11d48' }}
                            onClick={async () => {
                              try {
                                await axios.put(`${API_BASE}/applicants/${app.id}/status`, { status: 'Rejected' });
                                fetchApplicants();
                              } catch (err) { console.error(err); }
                            }}
                          >Reject</button>
                        </>
                      )}
                      <button 
                        className="ag-icon-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === app.id ? null : app.id);
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openDropdown === app.id && (
                        <div 
                          style={{
                            position: 'absolute',
                            right: '40px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            zIndex: 10,
                            minWidth: '140px',
                            overflow: 'hidden'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button 
                            style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}
                            onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                            onClick={() => {
                              alert(`Agent Details:\nName: ${app.name}\nEmail: ${app.email}\nPhone: ${app.phone}\nCity: ${app.city}`);
                              setOpenDropdown(null);
                            }}
                          >
                            View Details
                          </button>
                          
                          {app.status !== 'Active' && (
                            <button 
                              style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#16a34a' }}
                              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.target.style.background = 'none'}
                              onClick={async () => {
                                await axios.put(`${API_BASE}/applicants/${app.id}/status`, { status: 'Active' });
                                fetchApplicants();
                                setOpenDropdown(null);
                              }}
                            >
                              Mark Active
                            </button>
                          )}

                          {app.status !== 'Inactive' && (
                            <button 
                              style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#eab308' }}
                              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.target.style.background = 'none'}
                              onClick={async () => {
                                await axios.put(`${API_BASE}/applicants/${app.id}/status`, { status: 'Inactive' });
                                fetchApplicants();
                                setOpenDropdown(null);
                              }}
                            >
                              Mark Inactive
                            </button>
                          )}

                          <button 
                            style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#e11d48' }}
                            onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                            onClick={() => {
                              handleDelete(app.id);
                              setOpenDropdown(null);
                            }}
                          >
                            Delete Agent
                          </button>
                        </div>
                      )}
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

export default AgentOnboarding;
