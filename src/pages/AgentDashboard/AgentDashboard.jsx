import React, { useState } from 'react';
import {
  LayoutDashboard, UserCheck, GitBranch, ScrollText,
  Wallet, QrCode, ChevronRight, Bell, Search,
  LogOut, Menu, X, ChevronDown, Settings, Users, ShoppingCart, TrendingUp
} from 'lucide-react';
import AgentHome from './modules/AgentHome';
import AgentOnboarding from './modules/AgentOnboarding';
import CommissionHistory from './modules/CommissionHistory';
import CommissionSetup from './modules/CommissionSetup';
import HierarchyStructure from './modules/HierarchyStructure';
import MyReferralNetwork from './modules/MyReferralNetwork';
import ReferralOrders from './modules/ReferralOrders';
import Payout from './modules/Payout';
import ReferralCode from './modules/ReferralCode';
import AgentEarnings from './modules/AgentEarnings';
import Logs from './modules/Logs';
import { useAuth } from '../../context/AuthContext';
import SidebarSocialLinks from '../../components/Sidebar/SidebarSocialLinks';
import './AgentDashboard.css';

// Full nav — Admin Agent sees all
const ALL_NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
  { id: 'comm_hist', label: 'Commission History', icon: ScrollText },
  { id: 'comm_setup', label: 'Commission Setup', icon: Settings },
  { id: 'hierarchy', label: 'Hierarchy Structure', icon: GitBranch },
  { id: 'referral_orders', label: 'Referral Orders', icon: ShoppingCart },
  { id: 'payout', label: 'Payout', icon: Wallet },
  { id: 'referral', label: 'Referral Code', icon: QrCode },
  { id: 'logs', label: 'Logs', icon: ScrollText },
];

// Limited nav — Sub-agent sees only 3
const SUB_AGENT_NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'referral', label: 'Referral Code', icon: QrCode },
  { id: 'earnings', label: 'My Earnings', icon: TrendingUp },
];

const moduleMap = {
  home: AgentHome,
  onboarding: AgentOnboarding,
  comm_hist: CommissionHistory,
  comm_setup: CommissionSetup,
  hierarchy: HierarchyStructure,
  my_network: MyReferralNetwork,
  referral_orders: ReferralOrders,
  payout: Payout,
  referral: ReferralCode,
  earnings: AgentEarnings,
  logs: Logs,
};

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const isSubAgent = user && user.role && user.role !== 'Admin Agent';
  const navItems = isSubAgent ? SUB_AGENT_NAV_ITEMS : ALL_NAV_ITEMS;

  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [notifOpen, setNotifOpen] = useState(false);

  const ActiveModule = moduleMap[active] || AgentHome;
  const activeNav = navItems.find(n => n.id === active);

  const agentName = user?.name || 'Admin Agent';
  const agentRole = user?.role || 'Admin Agent';
  const agentAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(agentName)}&background=0ea5e9&color=fff&size=36`;

  const handleNavClick = (id) => {
    setActive(id);
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout('/distributor/login');
  };

  const notifications = [
    { text: 'Agent Pooja Mehta onboarded successfully', time: '5 min ago' },
    { text: 'Payout of ₹12,400 processed for Level-2 agents', time: '1 hr ago' },
    { text: 'New referral signup via code A2P-REF-0042', time: '2 hr ago' },
    { text: 'Commission slab updated for Premium tier', time: '3 hr ago' },
  ];

  return (
    <div className={`ag-shell ${sidebarOpen ? 'sidebar-active' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 1024 && (
        <div className="ag-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* ── Sidebar ── */}
      <aside className={`ag-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="ag-sidebar-logo">
          <img src="/A2P final logo.png" alt="A2P" className="ag-logo-img" />
          {sidebarOpen && (
            <div style={{ flex: 1 }}>
              <span className="ag-logo-title">Agent Portal</span>
              <span className="ag-logo-sub">A2P Cosmetics</span>
            </div>
          )}
          {sidebarOpen && (
            <button className="ag-sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close Sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="ag-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`ag-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
              title={!sidebarOpen ? label : ''}
            >
              <span className="ag-nav-icon"><Icon size={18} /></span>
              {sidebarOpen && <span className="ag-nav-label">{label}</span>}
              {sidebarOpen && active === id && <ChevronRight size={13} className="ag-nav-arrow" />}
            </button>
          ))}
        </nav>

        <div className="ag-sidebar-footer">
          {sidebarOpen && (
            <div className="ag-agent-pill">
              <img src={agentAvatar} alt="agent" />
              <div>
                <p className="ag-agent-name">{agentName}</p>
                <p className="ag-agent-tier">⭐ {agentRole}</p>
              </div>
            </div>
          )}
          <button className="ag-nav-item ag-logout" onClick={handleLogout}>
            <span className="ag-nav-icon"><LogOut size={17} /></span>
            {sidebarOpen && <span className="ag-nav-label">Logout</span>}
          </button>
          <SidebarSocialLinks isCollapsed={!sidebarOpen} />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ag-main">
        {/* Topbar */}
        <header className="ag-topbar">
          <div className="ag-topbar-left">
            <button className="ag-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="ag-breadcrumb">
              <span>Agent Portal</span>
              <ChevronRight size={13} />
              <span className="ag-breadcrumb-active">{activeNav?.label}</span>
            </div>
          </div>

          <div className="ag-topbar-right">
            <div className="ag-search-bar">
              <Search size={14} />
              <input type="text" placeholder="Search agents, codes..." />
            </div>

            <div className="ag-notif-wrapper">
              <button className="ag-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={17} />
                <span className="ag-notif-dot" />
              </button>
              {notifOpen && (
                <div className="ag-notif-dropdown">
                  <p className="ag-notif-title">Notifications</p>
                  {notifications.map((n, i) => (
                    <div className="ag-notif-item" key={i}>
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

            <button className="ag-icon-btn"><Settings size={17} /></button>

            <div className="ag-avatar">
              <img src={agentAvatar} alt="user" />
              <div className="ag-avatar-info">
                <span className="ag-avatar-name">{agentName}</span>
                <span className="ag-avatar-role">⭐ {agentRole}</span>
              </div>
              <ChevronDown size={13} />
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="ag-content">
          <ActiveModule onNavigate={setActive} />
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
