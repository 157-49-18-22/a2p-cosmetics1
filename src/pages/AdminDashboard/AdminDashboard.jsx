import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileCode,
  Package,
  Boxes,
  Users2,
  Building2,
  Headphones,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  ChevronDown,
  Settings,
  ShoppingCart,
  Megaphone,
  Heart,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminHome from './modules/AdminHome';
import CategoryManager from './modules/CategoryManager';
import CMSManager from './modules/CMSManager';
import ProductManager from './modules/ProductManager';
import InventoryManager from './modules/InventoryManager';
import AgentCRM from './modules/AgentCRM';
import DistributorCRM from './modules/DistributorCRM';
import CustomerCRM from './modules/CustomerCRM';
import SupportManager from './modules/SupportManager';
import UserManager from './modules/UserManager';
import OrderManager from './modules/OrderManager';
import BroadcastManager from './modules/BroadcastManager';
import WishlistTracker from './modules/WishlistTracker';
import PromoManager from './modules/PromoManager';
import SidebarSocialLinks from '../../components/Sidebar/SidebarSocialLinks';
import './AdminDashboard.css';

const navItems = [
  { id: 'home', label: 'Admin Hub', icon: LayoutDashboard },
  { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
  { id: 'cms', label: 'CMS Manager', icon: FileCode },
  { id: 'inventory', label: 'Master Inventory', icon: Boxes },
  { id: 'promo', label: 'Promo & Discounts', icon: Tag },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'wishlist', label: 'Wishlist Tracker', icon: Heart },
  { id: 'users', label: 'Users', icon: Users2 },
  { id: 'agents', label: 'Agent CRM', icon: Users2 },
  { id: 'distributors', label: 'Distributor CRM', icon: Building2 },
  { id: 'customers', label: 'Customer CRM', icon: Users2 },
  { id: 'support', label: 'Support System', icon: Headphones },
];

const moduleMap = {
  home: AdminHome,
  broadcasts: BroadcastManager,
  cms: CMSManager,
  inventory: InventoryManager,
  promo: PromoManager,
  orders: OrderManager,
  wishlist: WishlistTracker,
  users: UserManager,
  agents: AgentCRM,
  distributors: DistributorCRM,
  customers: CustomerCRM,
  support: SupportManager,
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = user && (user.role === 'Admin' || user.role === 'admin' || user.email === 'admin@crm.com' || user.email?.startsWith('admin@'));
  if (user && !isAdmin) {
    return <Navigate to="/my-orders" replace />;
  }

  const handleExit = () => {
    logout('/login');
  };

  const handleNavClick = (id) => {
    setActive(id);
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };

  const ActiveComponent = moduleMap[active];
  const activeLabel = navItems.find(n => n.id === active)?.label;

  return (
    <div className={`adm-shell ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="adm-sidebar-logo">
          <div className="adm-logo-box">A2P</div>
          {sidebarOpen && <div className="adm-logo-text" style={{ flex: 1 }}>Admin Panel <span>v2.0</span></div>}
          {sidebarOpen && (
            <button className="adm-sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="adm-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`adm-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="adm-nav-icon"><Icon size={19} /></span>
              <span className="adm-nav-label">{label}</span>
              {active === id && <div className="adm-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-nav-item adm-logout" onClick={handleExit}>
            <span className="adm-nav-icon"><LogOut size={18} /></span>
            <span className="adm-nav-label">Exit Panel</span>
          </button>
          <SidebarSocialLinks isCollapsed={!sidebarOpen} />
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <button className="adm-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="adm-breadcrumb">
              <span>A2P Ecosystem</span>
              <ChevronRight size={14} />
              <span className="adm-crumb-active">{activeLabel}</span>
            </div>
          </div>

          <div className="adm-header-right">
            <div className="adm-search">
              <Search size={16} />
              <input type="text" placeholder="Global search..." />
              <kbd className="adm-search-kbd">⌘K</kbd>
            </div>

            <div className="adm-actions">
              <div className="adm-notif-wrap">
                <button className="adm-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                  <Bell size={18} />
                  <span className="adm-pulse-dot" />
                </button>
                {notifOpen && (
                  <div className="adm-notif-box">
                    <p className="adm-notif-head">Critical Alerts</p>
                    {[
                      { t: 'Low inventory for Face Wash', c: 'Stock' },
                      { t: '5 New agent applications', c: 'CRM' },
                      { t: 'High traffic detected', c: 'System' }
                    ].map((n, i) => (
                      <div key={i} className="adm-notif-item">
                        <div className="adm-notif-tag">{n.c}</div>
                        <p>{n.t}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="adm-icon-btn"><Settings size={18} /></button>
            </div>

            <div className="adm-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=334155&color=fff" alt="admin" />
              <div className="adm-profile-info">
                <p>{user?.name || 'System Admin'}</p>
                <span>Full Access</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && window.innerWidth <= 1024 && (
          <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Viewport */}
        <main className="adm-content">
          <div className="adm-fade-in">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
