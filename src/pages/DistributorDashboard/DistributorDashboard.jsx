import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, UserCheck, Package, FileText,
  Map, Users, Star, Megaphone, ChevronRight,
  Bell, Search, LogOut, Menu, X, TrendingUp,
  Settings, ChevronDown, ShoppingCart
} from 'lucide-react';
import Onboarding from './modules/Onboarding';
import InventoryManagement from './modules/InventoryManagement';
import BillingManagement from './modules/BillingManagement';
import AreaAllocation from './modules/AreaAllocation';
import DealerSubDealer from './modules/DealerSubDealer';
import SuperStockist from './modules/SuperStockist';
import BrandingManagement from './modules/BrandingManagement';
import DashboardHome from './modules/DashboardHome';
import StockRequest from './modules/StockRequest';
import './DistributorDashboard.css';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
  { id: 'stock_request', label: 'Stock Indenting', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory Management', icon: Package },
  { id: 'billing', label: 'Billing Management', icon: FileText },
  { id: 'area', label: 'Area Allocation', icon: Map },
  { id: 'dealer', label: 'Dealer / Sub-Dealer', icon: Users },
  { id: 'stockist', label: 'Super Stockist', icon: Star },
  { id: 'branding', label: 'Branding Management', icon: Megaphone },
];

const moduleComponents = {
  home: DashboardHome,
  onboarding: Onboarding,
  stock_request: StockRequest,
  inventory: InventoryManagement,
  billing: BillingManagement,
  area: AreaAllocation,
  dealer: DealerSubDealer,
  stockist: SuperStockist,
  branding: BrandingManagement,
};

const AnnouncementTicker = () => {
  const [news, setNews] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/announcements`)
      .then(r => r.json())
      .then(d => setNews(d.filter(n => n.status === 'Active')));
  }, []);

  if (news.length === 0) return null;

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '12px 20px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ background: '#f3eeff', color: '#a855f7', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        <Megaphone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Global Broadcast
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '40px', animation: news.length > 1 ? 'dd-ticker 30s linear infinite' : 'none' }}>
          {news.map((n, i) => (
            <span key={i} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
              <strong style={{ color: n.type === 'Alert' ? '#ef4444' : n.type === 'Promotion' ? '#f59e0b' : '#3b82f6' }}>[{n.type}]</strong> {n.title}: {n.message}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes dd-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const DistributorDashboard = () => {
  const [activeModule, setActiveModule] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('active_distributor');
    window.location.href = '/distributor/login';
  };

  const ActiveComponent = moduleComponents[activeModule];
  const activeNav = navItems.find(n => n.id === activeModule);

  const handleNavClick = (id) => {
    setActiveModule(id);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`dd-shell ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div className="dd-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`dd-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="dd-sidebar-logo">
          <img src="/A2P final logo.png" alt="A2P" className="dd-logo-img" />
          {sidebarOpen && <span className="dd-logo-text">Distributor Portal</span>}
        </div>

        <nav className="dd-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`dd-nav-item ${activeModule === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="dd-nav-icon"><Icon size={18} /></span>
              {sidebarOpen && <span className="dd-nav-label">{label}</span>}
              {sidebarOpen && activeModule === id && <ChevronRight size={14} className="dd-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="dd-sidebar-footer">
          <button className="dd-nav-item dd-logout" onClick={handleLogout}>
            <span className="dd-nav-icon"><LogOut size={18} /></span>
            {sidebarOpen && <span className="dd-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dd-main">
        {/* Top Bar */}
        <header className="dd-topbar">
          <div className="dd-topbar-left">
            <button className="dd-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="dd-breadcrumb">
              <span>Portal</span>
              <ChevronRight size={14} />
              <span className="dd-breadcrumb-active">{activeNav?.label}</span>
            </div>
          </div>
          <div className="dd-topbar-right">
            <div className="dd-search-bar">
              <Search size={15} />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="dd-notif-wrapper">
              <button className="dd-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                <span className="dd-notif-dot" />
              </button>
              {notifOpen && (
                <div className="dd-notif-dropdown">
                  <p className="dd-notif-title">Notifications</p>
                  {['New dealer onboarded in Zone B', 'Stock alert: Serum low', 'Invoice #1042 pending'].map((n, i) => (
                    <div className="dd-notif-item" key={i}><Bell size={13} />{n}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="dd-avatar">
              <img src="https://ui-avatars.com/api/?name=A2P+Distributor&background=ec4899&color=fff&size=36" alt="user" />
              <div className="dd-avatar-info">
                <span className="dd-avatar-name">Rahul Sharma</span>
                <span className="dd-avatar-role">Senior Distributor</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* Announcements Ticker */}
        <div className="dd-announcements" style={{ padding: '0 32px', marginBottom: '8px' }}>
           <AnnouncementTicker />
        </div>

        {/* Module Content */}
        <main className="dd-content">
          <ActiveComponent setActiveModule={setActiveModule} />
        </main>
      </div>
    </div>
  );
};

export default DistributorDashboard;
