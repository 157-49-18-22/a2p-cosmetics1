import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';
import AdminHome from './modules/AdminHome';
import CategoryManager from './modules/CategoryManager';
import CMSManager from './modules/CMSManager';
import ProductManager from './modules/ProductManager';
import InventoryManager from './modules/InventoryManager';
import AgentCRM from './modules/AgentCRM';
import DistributorCRM from './modules/DistributorCRM';
import SupportManager from './modules/SupportManager';
import './AdminDashboard.css';

const navItems = [
  { id: 'home', label: 'Admin Hub', icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'cms', label: 'CMS Manager', icon: FileCode },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Master Inventory', icon: Boxes },
  { id: 'agents', label: 'Agent CRM', icon: Users2 },
  { id: 'distributors', label: 'Distributor CRM', icon: Building2 },
  { id: 'support', label: 'Support System', icon: Headphones },
];

const moduleMap = {
  home: AdminHome,
  categories: CategoryManager,
  cms: CMSManager,
  products: ProductManager,
  inventory: InventoryManager,
  agents: AgentCRM,
  distributors: DistributorCRM,
  support: SupportManager,
};

const AdminDashboard = () => {
  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const ActiveComponent = moduleMap[active];
  const activeLabel = navItems.find(n => n.id === active)?.label;

  return (
    <div className="adm-shell">
      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="adm-sidebar-logo">
          <div className="adm-logo-box">A2P</div>
          {sidebarOpen && <div className="adm-logo-text">Admin Panel <span>v2.0</span></div>}
        </div>

        <nav className="adm-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`adm-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="adm-nav-icon"><Icon size={19} /></span>
              {sidebarOpen && <span className="adm-nav-label">{label}</span>}
              {sidebarOpen && active === id && <div className="adm-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <button className="adm-nav-item adm-logout">
            <span className="adm-nav-icon"><LogOut size={18} /></span>
            {sidebarOpen && <span className="adm-nav-label">Exit Panel</span>}
          </button>
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
                <p>System Admin</p>
                <span>Full Access</span>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

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
