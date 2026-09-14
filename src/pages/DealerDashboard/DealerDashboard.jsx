import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Tag, Layers, ChevronRight, Bell, Search,
  LogOut, Menu, X, ChevronDown, Settings, Download, Eye, Megaphone
} from 'lucide-react';
import DealerHome from './modules/DealerHome';
import ProductOrderManagement from './modules/ProductOrderManagement';
import DealerBranding from './modules/DealerBranding';
import { useAuth } from '../../context/AuthContext';
import './DealerDashboard.css';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Product & Orders', icon: Package },
  { id: 'branding', label: 'Branding Campaigns', icon: Megaphone },
];

const moduleMap = {
  home: DealerHome,
  products: ProductOrderManagement,
  branding: DealerBranding,
};

const DealerDashboard = () => {
  const { logout } = useAuth();
  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [notifOpen, setNotifOpen] = useState(false);

  const ActiveModule = moduleMap[active];
  const activeNav = navItems.find(n => n.id === active);

  const handleNavClick = (id) => {
    setActive(id);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout('/distributor/login');
  };

  const notifications = [
    { text: 'New invoice generated for order #ORD-2024-089', time: '5 min ago' },
    { text: 'Special promotion: 15% off on premium face creams', time: '1 hr ago' },
    { text: 'Stock allocation updated for Zone A products', time: '2 hr ago' },
    { text: 'Order #ORD-2024-088 has been shipped', time: '3 hr ago' },
  ];

  return (
    <div className={`dl-shell ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div className="dl-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* ── Sidebar ── */}
      <aside className={`dl-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="dl-sidebar-logo">
          <img src="/A2P final logo.png" alt="A2P" className="dl-logo-img" />
          {sidebarOpen && (
            <div style={{ flex: 1 }}>
              <span className="dl-logo-title">Dealer Portal</span>
              <span className="dl-logo-sub">A2P Cosmetics</span>
            </div>
          )}
          {sidebarOpen && (
            <button className="dl-sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="dl-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`dl-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="dl-nav-icon"><Icon size={18} /></span>
              {sidebarOpen && <span className="dl-nav-label">{label}</span>}
              {sidebarOpen && active === id && <ChevronRight size={13} className="dl-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="dl-sidebar-footer">
          {sidebarOpen && (
            <div className="dl-dealer-pill">
              <img src="https://ui-avatars.com/api/?name=Dealer+Admin&background=10b981&color=fff&size=32" alt="dealer" />
              <div>
                <p className="dl-dealer-name">Dealer Admin</p>
                <p className="dl-dealer-tier">🏆 Premium Dealer</p>
              </div>
            </div>
          )}
          <button className="dl-nav-item dl-logout" onClick={handleLogout}>
            <span className="dl-nav-icon"><LogOut size={17} /></span>
            {sidebarOpen && <span className="dl-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dl-main">
        {/* Topbar */}
        <header className="dl-topbar">
          <div className="dl-topbar-left">
            <button className="dl-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="dl-breadcrumb">
              <span>Dealer Portal</span>
              <ChevronRight size={13} />
              <span className="dl-breadcrumb-active">{activeNav?.label}</span>
            </div>
          </div>

          <div className="dl-topbar-right">
            <div className="dl-search-bar">
              <Search size={14} />
              <input type="text" placeholder="Search invoices, products..." />
            </div>

            <div className="dl-notif-wrapper">
              <button className="dl-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={17} />
                <span className="dl-notif-dot" />
              </button>
              {notifOpen && (
                <div className="dl-notif-dropdown">
                  <p className="dl-notif-title">Notifications</p>
                  {notifications.map((n, i) => (
                    <div className="dl-notif-item" key={i}>
                      <Bell size={12} />
                      <div>
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="dl-icon-btn"><Settings size={17} /></button>

            <div className="dl-avatar">
              <img src="https://ui-avatars.com/api/?name=Dealer+Admin&background=10b981&color=fff&size=36" alt="user" />
              <div className="dl-avatar-info">
                <span className="dl-avatar-name">Dealer Admin</span>
                <span className="dl-avatar-role">🏆 Premium Dealer</span>
              </div>
              <ChevronDown size={13} />
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="dl-content">
          <ActiveModule onNavigate={setActive} />
        </main>
      </div>
    </div>
  );
};

export default DealerDashboard;
