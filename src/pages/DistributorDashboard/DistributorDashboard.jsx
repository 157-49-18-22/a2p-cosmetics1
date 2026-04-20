import React, { useState } from 'react';
import {
  LayoutDashboard, UserCheck, Package, FileText,
  Map, Users, Star, Megaphone, ChevronRight,
  Bell, Search, LogOut, Menu, X, TrendingUp,
  Settings, ChevronDown
} from 'lucide-react';
import Onboarding from './modules/Onboarding';
import InventoryManagement from './modules/InventoryManagement';
import BillingManagement from './modules/BillingManagement';
import AreaAllocation from './modules/AreaAllocation';
import DealerSubDealer from './modules/DealerSubDealer';
import SuperStockist from './modules/SuperStockist';
import BrandingManagement from './modules/BrandingManagement';
import DashboardHome from './modules/DashboardHome';
import './DistributorDashboard.css';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
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
  inventory: InventoryManagement,
  billing: BillingManagement,
  area: AreaAllocation,
  dealer: DealerSubDealer,
  stockist: SuperStockist,
  branding: BrandingManagement,
};

const DistributorDashboard = () => {
  const [activeModule, setActiveModule] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const ActiveComponent = moduleComponents[activeModule];
  const activeNav = navItems.find(n => n.id === activeModule);

  return (
    <div className="dd-shell">
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
              onClick={() => setActiveModule(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="dd-nav-icon"><Icon size={18} /></span>
              {sidebarOpen && <span className="dd-nav-label">{label}</span>}
              {sidebarOpen && activeModule === id && <ChevronRight size={14} className="dd-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="dd-sidebar-footer">
          <button className="dd-nav-item dd-logout">
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

        {/* Module Content */}
        <main className="dd-content">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default DistributorDashboard;
