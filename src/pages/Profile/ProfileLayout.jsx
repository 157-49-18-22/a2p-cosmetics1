import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Package, MapPin, Bookmark, Sparkles, 
  User, CreditCard, Bell, Shield
} from 'lucide-react';
import './Profile.css';

const ProfileLayout = ({ children }) => {
  const menuItems = [
    { to: "/skin-profile", icon: Sparkles, label: "Skin Profile" },
    { to: "/my-orders", icon: Package, label: "My Orders" },
    { to: "/my-addresses", icon: MapPin, label: "My Addresses" },
    { to: "/saved-items", icon: Bookmark, label: "Saved Items" },
    { to: "/wishlist", icon: Bookmark, label: "Wishlist" },
  ];

  return (
    <div className="account-layout">
      <div className="container account-inner">
        <aside className="account-sidebar">
          <div className="sidebar-user-brief">
            <div className="brief-avatar">
              <User size={32} />
            </div>
            <div className="brief-info">
              <h3>Admin User</h3>
              <p>Premium Member</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <div className="nav-group">
              <span className="nav-group-title">Personal</span>
              {menuItems.map((item) => (
                <NavLink 
                  key={item.label} 
                  to={item.to} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="nav-group">
              <span className="nav-group-title">Account Settings</span>
              <NavLink to="/profile/payment" className="sidebar-link">
                <CreditCard size={18} />
                <span>Payment Methods</span>
              </NavLink>
              <NavLink to="/profile/notifications" className="sidebar-link">
                <Bell size={18} />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/profile/security" className="sidebar-link">
                <Shield size={18} />
                <span>Security</span>
              </NavLink>
            </div>
          </nav>
        </aside>

        <main className="account-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;
