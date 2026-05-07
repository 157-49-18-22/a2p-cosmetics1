import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import './Profile.css';
import { MapPin, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

const MyAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Home',
    address_line: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/addresses`);
      const data = await response.json();
      setAddresses(data);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (addr) => {
    setIsEditing(true);
    setEditId(addr.id);
    setFormData({
      name: addr.name,
      email: addr.email || '',
      phone: addr.phone,
      type: addr.type,
      address_line: addr.address_line,
      city: addr.city,
      state: addr.state,
      zip_code: addr.zip_code,
      is_default: addr.is_default === 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing 
      ? `${API_BASE_URL}/customers/addresses/${editId}`
      : `API_BASE_URL/customers/addresses`;
    
    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
          name: '', email: '', phone: '', type: 'Home', address_line: '', city: '', state: '', zip_code: '', is_default: false
        });
        fetchAddresses();
      } else {
        const data = await response.json();
        console.error("Save error:", data.error);
      }
    } catch (err) {
      console.error("Connection error:", err);
    }
  };




  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    try {
      await fetch(`${API_BASE_URL}/customers/addresses/${id}`, { method: `DELETE' });
      fetchAddresses();
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#d4a373" />
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="header-with-action">
          <div>
            <h1>My Addresses</h1>
            <p>Manage your delivery addresses for faster checkout.</p>
          </div>
          <button className="add-address-btn" onClick={() => {
            setIsEditing(false);
            setFormData({ name: '', email: '', phone: '', type: 'Home', address_line: '', city: '', state: '', zip_code: '', is_default: false });
            setShowModal(true);
          }}>
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '24px', gridColumn: '1 / -1' }}>
            <MapPin size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3>No addresses saved</h3>
            <p>Add an address to make your checkout faster.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
              {addr.is_default ? <span className="default-tag">Default</span> : null}
              <div className="address-type">
                <MapPin size={18} />
                <span>{addr.type}</span>
              </div>
              <div className="address-content">
                <h3>{addr.name}</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{addr.email}</p>
                <p>{addr.address_line}, {addr.city}, {addr.state} - {addr.zip_code}</p>
                <span className="phone">Phone: {addr.phone}</span>
              </div>
              <div className="address-actions">
                <button onClick={() => handleEdit(addr)}><Edit2 size={16} /> Edit</button>
                <button className="delete" onClick={() => handleDelete(addr.id)}><Trash2 size={16} /> Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="address-modal" style={{
            background: '#fff', padding: '32px', borderRadius: '24px',
            width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required style={inputStyle} />
                <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required style={inputStyle} />
              </div>
              
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required style={inputStyle} />
              
              <select name="type" value={formData.type} onChange={handleInputChange} style={inputStyle}>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>

              <textarea name="address_line" placeholder="Address (House No, Building, Street)" value={formData.address_line} onChange={handleInputChange} required style={{ ...inputStyle, height: '80px', resize: 'none' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required style={inputStyle} />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} required style={inputStyle} />
              </div>
              
              <input type="text" name="zip_code" placeholder="ZIP Code" value={formData.zip_code} onChange={handleInputChange} required style={inputStyle} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input type="checkbox" name="is_default" checked={formData.is_default} onChange={handleInputChange} />
                Set as default address
              </label>

              <button 
                type="submit" 
                className="add-address-btn" 
                style={{ 
                  width: '100%', 
                  marginTop: '12px', 
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 10
                }}
                onClick={handleSubmit}
              >
                {isEditing ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.3s'
};

export default MyAddresses;

