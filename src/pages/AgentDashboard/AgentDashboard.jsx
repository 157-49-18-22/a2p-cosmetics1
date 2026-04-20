import React, { useState } from 'react';
import {
  LayoutDashboard, UserCheck, BadgeDollarSign, GitBranch,
  Wallet, QrCode, ScrollText, ChevronRight, Bell, Search,
  LogOut, Menu, X, ChevronDown, Settings
} from 'lucide-react';
import AgentHome from './modules/AgentHome';
import AgentOnboarding from './modules/AgentOnboarding';
import CommissionSetup from './modules/CommissionSetup';
import HierarchyStructure from './modules/HierarchyStructure';
import Payout from './modules/Payout';
import ReferralCode from './modules/ReferralCode';
import Logs from './modules/Logs';
import './AgentDashboard.css';

const navItems = [
  { id: 'home',       label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'onboarding', label: 'Onboarding',          icon: UserCheck },
  { id: 'commission', label: 'Commission Setup',    icon: BadgeDollarSign },
  { id: 'hierarchy',  label: 'Hierarchy Structure', icon: GitBranch },
  { id: 'payout',     label: 'Payout',              icon: Wallet },
  { id: 'referral',   label: 'Referral Code',       icon: QrCode },
  { id: 'logs',       label: 'Logs',                icon: ScrollText },
];

const moduleMap = {
  home:       AgentHome,
  onboarding: AgentOnboarding,
  commission: CommissionSetup,
  hierarchy:  HierarchyStructure,
  payout:     Payout,
  referral:   ReferralCode,
  logs:       Logs,
};

const AgentDashboard = () => {
  const [active, setActive] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const ActiveModule = moduleMap[active];
  const activeNav = navItems.find(n => n.id === active);

  const notifications = [
    { text: 'Agent Pooja Mehta onboarded successfully', time: '5 min ago' },
    { text: 'Payout of ₹12,400 processed for Level-2 agents', time: '1 hr ago' },
    { text: 'New referral signup via code A2P-REF-0042', time: '2 hr ago' },
    { text: 'Commission slab updated for Premium tier', time: '3 hr ago' },
  ];

  return (
    <div className="ag-shell">
      {/* ── Sidebar ── */}
      <aside className={`ag-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="ag-sidebar-logo">
          <img src="/A2P final logo.png" alt="A2P" className="ag-logo-img" />
          {sidebarOpen && (
            <div>
              <span className="ag-logo-title">Agent Portal</span>
              <span className="ag-logo-sub">A2P Cosmetics</span>
            </div>
          )}
        </div>

        <nav className="ag-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`ag-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
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
              <img src="https://ui-avatars.com/api/?name=Agent+Admin&background=0ea5e9&color=fff&size=32" alt="agent" />
              <div>
                <p className="ag-agent-name">Admin Agent</p>
                <p className="ag-agent-tier">⭐ Gold Tier</p>
              </div>
            </div>
          )}
          <button className="ag-nav-item ag-logout">
            <span className="ag-nav-icon"><LogOut size={17} /></span>
            {sidebarOpen && <span className="ag-nav-label">Logout</span>}
          </button>
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
              <img src="https://ui-avatars.com/api/?name=Agent+Admin&background=0ea5e9&color=fff&size=36" alt="user" />
              <div className="ag-avatar-info">
                <span className="ag-avatar-name">Admin Agent</span>
                <span className="ag-avatar-role">⭐ Gold Tier</span>
              </div>
              <ChevronDown size={13} />
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="ag-content">
          <ActiveModule />
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
