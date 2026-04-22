import React from 'react';
import './Profile.css';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

const MyAddresses = () => {
  const addresses = [
    { id: 1, type: 'Home', name: 'John Doe', address: '123 Beauty Lane, Glow City, 400001', phone: '+91 98765 43210', isDefault: true },
    { id: 2, type: 'Office', name: 'John Doe', address: 'Radiance Business Park, Tower A, 400052', phone: '+91 98765 43210', isDefault: false },
  ];

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="header-with-action">
          <div>
            <h1>My Addresses</h1>
            <p>Manage your delivery addresses for faster checkout.</p>
          </div>
          <button className="add-address-btn">
            <Plus size={18} /> Add New
          </button>
        </div>
      </div>

      <div className="addresses-grid">
        {addresses.map((addr) => (
          <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
            {addr.isDefault && <span className="default-tag">Default</span>}
            <div className="address-type">
              <MapPin size={18} />
              <span>{addr.type}</span>
            </div>
            <div className="address-content">
              <h3>{addr.name}</h3>
              <p>{addr.address}</p>
              <span className="phone">Phone: {addr.phone}</span>
            </div>
            <div className="address-actions">
              <button><Edit2 size={16} /> Edit</button>
              {!addr.isDefault && <button className="delete"><Trash2 size={16} /> Remove</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAddresses;
