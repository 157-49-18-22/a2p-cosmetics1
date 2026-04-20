import React from 'react';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  Users, 
  User,
  Shield,
  Star,
  Search
} from 'lucide-react';

const HierarchyStructure = () => {
  const tree = [
    {
      name: 'Aditya Birla',
      role: 'Master Agent',
      tier: 'Platinum',
      team: 24,
      children: [
        {
          name: 'Sunil Gavaskar',
          role: 'Sub Agent',
          tier: 'Gold',
          team: 8,
          children: [
            { name: 'Kiran Bedi', role: 'Sales Rep', tier: 'Silver', team: 0 },
            { name: 'Anil Kumble', role: 'Sales Rep', tier: 'Bronze', team: 0 },
          ]
        },
        {
          name: 'Meera Nair',
          role: 'Sub Agent',
          tier: 'Silver',
          team: 4,
          children: [
            { name: 'Rahul Dravid', role: 'Sales Rep', tier: 'Bronze', team: 0 },
          ]
        }
      ]
    }
  ];

  const Node = ({ agent, depth = 0 }) => (
    <div style={{ marginLeft: depth * 32, marginBottom: '12px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: '12px',
        background: depth === 0 ? '#eff6ff' : '#fff',
        border: `1px solid ${depth === 0 ? '#0ea5e950' : '#e2e8f0'}`,
        transition: 'all 0.2s'
      }}>
        {agent.children && agent.children.length > 0 ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#cbd5e1" />}
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={16} color="#64748b" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{agent.name}</span>
            <span className={`ag-tier-${agent.tier.toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '1px 8px' }}>{agent.tier}</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{agent.role} • {agent.team} members</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="ag-btn ag-btn-outline" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>View Stats</button>
          <button className="ag-btn ag-btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Structure</button>
        </div>
      </div>
      {agent.children && agent.children.map((child, i) => <Node key={i} agent={child} depth={depth + 1} />)}
    </div>
  );

  return (
    <div className="ag-enter">
      <div className="ag-module-header">
        <div>
          <h1 className="ag-module-title">Hierarchy Structure</h1>
          <p className="ag-module-subtitle">Visualize agent reporting lines and team distribution.</p>
        </div>
        <div className="ag-search-inline" style={{ width: '280px' }}>
          <Search size={14} color="#94a3b8" />
          <input placeholder="Search in tree..." />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Master Agents', count: 42, icon: Shield, color: '#0ea5e9' },
          { label: 'Sub Agents', count: 185, icon: Star, color: '#f59e0b' },
          { label: 'Sales Reps', count: 1053, icon: Users, color: '#6366f1' },
        ].map((item, i) => (
          <div key={i} className="ag-stat-card">
            <div className="ag-stat-icon" style={{ background: `${item.color}15` }}>
              <item.icon size={18} color={item.color} />
            </div>
            <div className="ag-stat-value">{item.count}</div>
            <div className="ag-stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="ag-card">
        <div className="ag-card-header">
          <h3 className="ag-card-title">Network Visualization</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ag-btn ag-btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Expand All</button>
            <button className="ag-btn ag-btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>Collapse All</button>
          </div>
        </div>
        <div className="ag-card-body" style={{ minHeight: '400px' }}>
          {tree.map((root, i) => <Node key={i} agent={root} />)}
        </div>
      </div>
    </div>
  );
};

export default HierarchyStructure;
