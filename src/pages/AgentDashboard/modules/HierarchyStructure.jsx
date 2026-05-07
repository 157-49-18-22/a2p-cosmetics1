import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API_BASE = `API_BASE_URL_PLACEHOLDER/agent';

const HierarchyStructure = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ master: 0, sub: 0, rep: 0 });
  const [globalToggle, setGlobalToggle] = useState(Date.now());
  const [globalExpand, setGlobalExpand] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await axios.get(`${API_BASE}/hierarchy`);
        setTree(res.data);
        
        // Calculate basic stats by flattening the tree or just rough estimates based on roles
        let m = 0, s = 0, r = 0;
        const countRoles = (nodes) => {
          nodes.forEach(n => {
            if (n.role === 'Master Agent') m++;
            else if (n.role === 'Sub Agent') s++;
            else r++;
            if (n.children && n.children.length > 0) countRoles(n.children);
          });
        };
        countRoles(res.data);
        setStats({ master: m, sub: s, rep: r });
      } catch (err) {
        console.error('Error fetching hierarchy:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const Node = ({ agent, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
      setExpanded(globalExpand);
    }, [globalToggle]);

    return (
      <div style={{ marginLeft: depth * 32, marginBottom: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderRadius: '12px',
          background: depth === 0 ? '#eff6ff' : '#fff',
          border: `1px solid ${depth === 0 ? '#0ea5e950' : '#e2e8f0'}`,
          transition: 'all 0.2s'
        }}>
          {agent.children && agent.children.length > 0 ? (
            <button 
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
            </button>
          ) : (
            <ChevronRight size={16} color="#cbd5e1" />
          )}
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#64748b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{agent.name}</span>
              <span className={`ag-tier-${(agent.tier || 'silver').toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '1px 8px' }}>{agent.tier || 'Silver'}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{agent.role} • {agent.team || 0} members</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ag-btn ag-btn-outline" 
              style={{ padding: '4px 10px', fontSize: '0.7rem' }}
              onClick={() => alert(`Agent Statistics:\n\nName: ${agent.name}\nRole: ${agent.role}\nTier: ${agent.tier || 'Silver'}\nDirect Team Size: ${agent.team || 0}`)}
            >
              View Stats
            </button>
            {agent.children && agent.children.length > 0 && (
              <button 
                className="ag-btn ag-btn-primary" 
                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Collapse' : 'Expand'} Structure
              </button>
            )}
          </div>
        </div>
        {expanded && agent.children && agent.children.map((child, i) => <Node key={i} agent={child} depth={depth + 1} />)}
      </div>
    );
  };

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
          { label: 'Master Agents', count: stats.master, icon: Shield, color: '#0ea5e9' },
          { label: 'Sub Agents', count: stats.sub, icon: Star, color: '#f59e0b' },
          { label: 'Sales Reps', count: stats.rep, icon: Users, color: '#6366f1' },
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
            <button 
              className="ag-btn ag-btn-outline" 
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => {
                setGlobalExpand(true);
                setGlobalToggle(Date.now());
              }}
            >
              Expand All
            </button>
            <button 
              className="ag-btn ag-btn-outline" 
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => {
                setGlobalExpand(false);
                setGlobalToggle(Date.now());
              }}
            >
              Collapse All
            </button>
          </div>
        </div>
        <div className="ag-card-body" style={{ minHeight: '400px' }}>
          {loading ? (
            <div className="ag-loading">Loading Hierarchy...</div>
          ) : tree.length > 0 ? (
            tree.map((root, i) => <Node key={i} agent={root} />)
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No agents in hierarchy yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HierarchyStructure;
