import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Clock, X, CheckCircle, AlertCircle, Send, Trash2, Plus,
  RefreshCcw, AlertTriangle, Check, Download, Filter, MoreVertical, User, Shield,
  Phone, Mail, TrendingUp, Inbox, BarChart2, Zap, XCircle, ChevronRight
} from 'lucide-react';

const API = `${API_BASE_URL}/support`;

const MACROS = [
  'Thank you for contacting us. We will resolve your issue shortly.',
  'Your refund has been initiated and will reflect in 5-7 business days.',
  'Your order is delayed due to high demand. We sincerely apologize for the inconvenience.',
  'We have updated your delivery address as requested.',
  'Our team is actively investigating this issue. We will update you within 24 hours.',
  'Your product return has been approved. Kindly ship it to our warehouse.',
];

const PRIORITY_CONFIG = {
  Urgent: { color: '#ef4444', bg: '#fef2f2' },
  High:   { color: '#f97316', bg: '#fff7ed' },
  Medium: { color: '#f59e0b', bg: '#fffbeb' },
  Low:    { color: '#10b981', bg: '#f0fdf4' },
};
const STATUS_CONFIG = {
  'Open':        { color: '#ef4444', bg: '#fef2f2' },
  'In Progress': { color: '#f59e0b', bg: '#fffbeb' },
  'Resolved':    { color: '#10b981', bg: '#f0fdf4' },
  'Closed':      { color: '#64748b', bg: '#f8fafc' },
};
const CATEGORY_ICONS = { Shipping:'🚚', Billing:'💳', Product:'📦', General:'💬', Returns:'↩️', Technical:'🔧' };
const AGENTS = ['Admin', 'Support Team', 'Rahul', 'Priya', 'Amit'];

export default function SupportManager() {
  const [tickets, setTickets]           = useState([]);
  const [stats, setStats]               = useState({ open:0, in_progress:0, resolved:0, closed:0, high:0, total:0, avg_response:0, byCategory:[] });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies]           = useState([]);
  const [replyText, setReplyText]       = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toast, setToast]               = useState(null);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [bulkAction, setBulkAction]     = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [activeTab, setActiveTab]       = useState('tickets');
  const [sending, setSending]           = useState(false);
  const replyEndRef = useRef(null);
  const [newTicket, setNewTicket] = useState({ subject:'', user_name:'', user_email:'', user_phone:'', category:'General', priority:'Medium', message:'', tags:'' });

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (showModal && replyEndRef.current) replyEndRef.current.scrollIntoView({ behavior:'smooth' }); }, [replies, showModal]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([fetch(API), fetch(`${API}/stats`)]);
      const [td, sd] = await Promise.all([t.json(), s.json()]);
      setTickets(Array.isArray(td) ? td : []);
      setStats(sd || {});
    } catch(e) { setTickets([]); }
    finally { setLoading(false); }
  };
  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    try {
      const res = await fetch(`${API}/${ticket.id}/replies`);
      const data = await res.json();
      setReplies(Array.isArray(data) ? data : []);
    } catch { setReplies([]); }
    setShowModal(true);
  };

  const sendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`${API}/${selectedTicket.id}/reply`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ reply:replyText, agent:'Admin', sender_type:'admin' })
      });
      setReplies(prev => [...prev, { agent:'Admin', message:replyText, sender_type:'admin', created_at:new Date().toISOString() }]);
      setReplyText('');
      const newStatus = selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status;
      setSelectedTicket(prev => ({...prev, status:newStatus}));
      setTickets(prev => prev.map(t => t.id===selectedTicket.id ? {...t,status:newStatus} : t));
      showToast('Reply sent!');
    } catch { showToast('Failed to send reply', 'danger'); }
    finally { setSending(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) });
      setTickets(prev => prev.map(t => t.id===id ? {...t,status} : t));
      if (selectedTicket?.id===id) setSelectedTicket(prev => ({...prev,status}));
      fetchAll(); showToast(`Status → ${status}`);
    } catch { showToast('Update failed','danger'); }
  };

  const updatePriority = async (id, priority) => {
    try {
      await fetch(`${API}/${id}/priority`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({priority}) });
      setTickets(prev => prev.map(t => t.id===id ? {...t,priority} : t));
      if (selectedTicket?.id===id) setSelectedTicket(prev => ({...prev,priority}));
      showToast(`Priority → ${priority}`);
    } catch { showToast('Priority update failed','danger'); }
  };

  const assignTicket = async (id, assigned_to) => {
    try {
      await fetch(`${API}/${id}/assign`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({assigned_to}) });
      setTickets(prev => prev.map(t => t.id===id ? {...t,assigned_to} : t));
      if (selectedTicket?.id===id) setSelectedTicket(prev => ({...prev,assigned_to}));
      showToast(`Assigned to ${assigned_to || 'nobody'}`);
    } catch { showToast('Assignment failed','danger'); }
  };

  const deleteTicket = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await fetch(`${API}/${id}`, {method:'DELETE'});
      setTickets(prev => prev.filter(t => t.id!==id));
      if (selectedTicket?.id===id) setShowModal(false);
      fetchAll(); showToast('Ticket deleted');
    } catch { showToast('Delete failed','danger'); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newTicket) });
      setShowNewModal(false);
      setNewTicket({ subject:'',user_name:'',user_email:'',user_phone:'',category:'General',priority:'Medium',message:'',tags:'' });
      fetchAll(); showToast('Ticket created!');
    } catch { showToast('Failed to create ticket','danger'); }
  };

  const handleBulkAction = async () => {
    if (!selectedIds.length || !bulkAction) return;
    let action = bulkAction, value;
    if (bulkAction.startsWith('status:')) { action='status'; value=bulkAction.split(':')[1]; }
    if (bulkAction.startsWith('priority:')) { action='priority'; value=bulkAction.split(':')[1]; }
    if (bulkAction==='delete' && !window.confirm(`Delete ${selectedIds.length} tickets?`)) return;
    try {
      await fetch(`${API}/bulk`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ids:selectedIds, action, value}) });
      setSelectedIds([]); setBulkAction(''); fetchAll();
      showToast(`Bulk action applied to ${selectedIds.length} tickets`);
    } catch { showToast('Bulk action failed','danger'); }
  };

  const exportCSV = () => window.open(`${API}/export/csv`, '_blank');
  const toggleSelect = (id, e) => { e.stopPropagation(); setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]); };
  const toggleAll = () => setSelectedIds(prev => prev.length===filtered.length&&filtered.length>0 ? [] : filtered.map(t=>t.id));
  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const fmtTime = (iso) => { if (!iso) return ''; const d=new Date(iso); return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}); };

  const filtered = tickets.filter(t =>
    (filterStatus==='All' || t.status===filterStatus) &&
    (filterPriority==='All' || t.priority===filterPriority) &&
    (filterCategory==='All' || t.category===filterCategory) &&
    (!search || t.subject?.toLowerCase().includes(search.toLowerCase()) ||
     t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
     t.ticket_id?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="adm-fade-in" style={{display:'flex',flexDirection:'column',gap:'24px'}}>
      {toast && (
        <div style={{position:'fixed',top:24,right:24,zIndex:9999,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 22px',borderRadius:'14px',fontWeight:700,boxShadow:'0 8px 32px rgba(0,0,0,0.18)',display:'flex',alignItems:'center',gap:'8px'}}>
          {toast.type==='success'?<Check size={16}/>:<AlertCircle size={16}/>} {toast.msg}
        </div>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontSize:'1.8rem',fontWeight:800,color:'#0f172a'}}>Customer Support Center</h2>
          <p style={{color:'#64748b',fontSize:'0.875rem'}}>Manage tickets, queries, and feedback in real-time.</p>
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <button className="adm-btn adm-btn-outline" onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'0.82rem'}}><Download size={15}/> Export CSV</button>
          <button className="adm-btn adm-btn-outline" onClick={fetchAll}><RefreshCcw size={16}/></button>
          <button className="adm-btn adm-btn-primary" onClick={()=>setShowNewModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><Plus size={18}/> New Ticket</button>
        </div>
      </div>

      <div style={{display:'flex',gap:'4px',background:'#f1f5f9',padding:'4px',borderRadius:'12px',width:'fit-content'}}>
        {[['tickets','Tickets'],['analytics','Analytics']].map(([key,label])=>(
          <button key={key} onClick={()=>setActiveTab(key)} style={{padding:'8px 20px',borderRadius:'9px',fontWeight:700,fontSize:'0.82rem',border:'none',cursor:'pointer',transition:'all 0.2s',background:activeTab===key?'#fff':'transparent',color:activeTab===key?'#0f172a':'#64748b',boxShadow:activeTab===key?'0 2px 8px rgba(0,0,0,0.08)':'none'}}>{label}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:'14px'}}>
        {[
          {label:'Open',val:stats.open,color:'#ef4444',icon:AlertCircle,filter:'Open'},
          {label:'In Progress',val:stats.in_progress,color:'#f59e0b',icon:Clock,filter:'In Progress'},
          {label:'Resolved',val:stats.resolved,color:'#10b981',icon:CheckCircle,filter:'Resolved'},
          {label:'High Priority',val:stats.high,color:'#8b5cf6',icon:AlertTriangle,filter:null},
          {label:'Total',val:stats.total,color:'#3b82f6',icon:Inbox,filter:null},
          {label:'Avg Response',val:`${stats.avg_response||0}h`,color:'#06b6d4',icon:TrendingUp,filter:null},
        ].map((s,i)=>(
          <div key={i} className="adm-card" style={{padding:'16px 18px',display:'flex',alignItems:'center',gap:'12px',cursor:s.filter?'pointer':'default',border:filterStatus===s.filter?`2px solid ${s.color}`:'1px solid #e2e8f0',transition:'all 0.2s'}} onClick={()=>s.filter&&setFilterStatus(prev=>prev===s.filter?'All':s.filter)}>
            <div style={{width:'40px',height:'40px',borderRadius:'12px',background:`${s.color}18`,color:s.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><s.icon size={19}/></div>
            <div>
              <p style={{fontSize:'0.62rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.label}</p>
              <h3 style={{fontSize:'1.35rem',fontWeight:800,color:'#0f172a'}}>{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {activeTab==='analytics' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div className="adm-card" style={{padding:'24px'}}>
            <h4 style={{fontWeight:800,color:'#0f172a',marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}><BarChart2 size={18} color="#3b82f6"/> Tickets by Category</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {(stats.byCategory||[]).map((c,i)=>{
                const pct=stats.total?Math.round((c.count/stats.total)*100):0;
                return (<div key={i}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}><span style={{fontSize:'0.82rem',fontWeight:600,color:'#475569'}}>{CATEGORY_ICONS[c.category]||'📌'} {c.category}</span><span style={{fontSize:'0.8rem',fontWeight:700,color:'#0f172a'}}>{c.count} ({pct}%)</span></div><div style={{height:'7px',background:'#f1f5f9',borderRadius:'999px',overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#3b82f6,#8b5cf6)',borderRadius:'999px'}}/></div></div>);
              })}
              {(!stats.byCategory||stats.byCategory.length===0)&&<p style={{color:'#94a3b8',fontSize:'0.85rem'}}>No data yet</p>}
            </div>
          </div>
          <div className="adm-card" style={{padding:'24px'}}>
            <h4 style={{fontWeight:800,color:'#0f172a',marginBottom:'18px',display:'flex',alignItems:'center',gap:'8px'}}><Zap size={18} color="#f59e0b"/> Status Overview</h4>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {[{label:'Open',count:stats.open,color:'#ef4444'},{label:'In Progress',count:stats.in_progress,color:'#f59e0b'},{label:'Resolved',count:stats.resolved,color:'#10b981'},{label:'Closed',count:stats.closed||0,color:'#64748b'}].map((s,i)=>{
                const pct=stats.total?Math.round((s.count/stats.total)*100):0;
                return (<div key={i}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}><span style={{fontSize:'0.82rem',fontWeight:600,color:'#475569'}}>{s.label}</span><span style={{fontSize:'0.8rem',fontWeight:700,color:'#0f172a'}}>{s.count} ({pct}%)</span></div><div style={{height:'7px',background:'#f1f5f9',borderRadius:'999px',overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:s.color,borderRadius:'999px'}}/></div></div>);
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab==='tickets' && (
        <div className="adm-card">
          <div style={{padding:'16px 20px',display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',borderBottom:'1px solid #f1f5f9'}}>
            <div className="adm-search" style={{flex:1,minWidth:'200px',background:'#f8fafc',border:'1px solid #e2e8f0'}}>
              <Search size={16} color="#94a3b8"/>
              <input placeholder="Search by ticket ID, subject or user..." value={search} onChange={e=>setSearch(e.target.value)}/>
              {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex'}}><X size={15}/></button>}
            </div>
            <button className="adm-btn adm-btn-outline" style={{gap:'6px',fontSize:'0.82rem'}} onClick={()=>setShowFilters(p=>!p)}>
              <Filter size={15}/> Filters {(filterStatus!=='All'||filterPriority!=='All'||filterCategory!=='All') ? `(${[filterStatus,filterPriority,filterCategory].filter(x=>x!=='All').length})` : ''}
            </button>
            <select className="adm-btn adm-btn-outline" style={{height:'40px',padding:'0 14px',fontSize:'0.82rem'}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option>All</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>
          </div>

          {showFilters && (
            <div style={{padding:'12px 20px',background:'#f8fafc',borderBottom:'1px solid #f1f5f9',display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'center'}}>
              <span style={{fontSize:'0.75rem',fontWeight:700,color:'#64748b'}}>FILTER BY:</span>
              <select className="adm-btn adm-btn-outline" style={{height:'36px',padding:'0 12px',fontSize:'0.8rem'}} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
                <option value="All">All Priorities</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
              <select className="adm-btn adm-btn-outline" style={{height:'36px',padding:'0 12px',fontSize:'0.8rem'}} value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option><option>Shipping</option><option>Billing</option><option>Product</option><option>General</option><option>Returns</option><option>Technical</option>
              </select>
              {(filterStatus!=='All'||filterPriority!=='All'||filterCategory!=='All')&&(
                <button className="adm-btn" style={{height:'36px',padding:'0 12px',fontSize:'0.8rem',background:'#fee2e2',color:'#ef4444',border:'none'}} onClick={()=>{setFilterStatus('All');setFilterPriority('All');setFilterCategory('All');}}>
                  <X size={13}/> Clear
                </button>
              )}
            </div>
          )}

          {selectedIds.length>0 && (
            <div style={{padding:'12px 20px',background:'linear-gradient(135deg,#eff6ff,#f0f9ff)',borderBottom:'1px solid #bfdbfe',display:'flex',gap:'12px',alignItems:'center'}}>
              <span style={{fontWeight:700,fontSize:'0.85rem',color:'#1d4ed8'}}>{selectedIds.length} ticket{selectedIds.length>1?'s':''} selected</span>
              <select className="adm-btn adm-btn-outline" style={{height:'36px',padding:'0 12px',fontSize:'0.8rem'}} value={bulkAction} onChange={e=>setBulkAction(e.target.value)}>
                <option value="">Bulk Action...</option>
                <option value="status:Resolved">Mark Resolved</option>
                <option value="status:Closed">Mark Closed</option>
                <option value="status:In Progress">Mark In Progress</option>
                <option value="priority:High">Set Priority: High</option>
                <option value="priority:Urgent">Set Priority: Urgent</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button className="adm-btn adm-btn-primary" style={{height:'36px',padding:'0 16px',fontSize:'0.82rem'}} onClick={handleBulkAction} disabled={!bulkAction}>Apply</button>
              <button className="adm-btn adm-btn-outline" style={{height:'36px',padding:'0 12px',fontSize:'0.8rem'}} onClick={()=>setSelectedIds([])}>Cancel</button>
            </div>
          )}

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{width:'40px',paddingLeft:'20px'}}><input type="checkbox" checked={selectedIds.length===filtered.length&&filtered.length>0} onChange={toggleAll} style={{cursor:'pointer'}}/></th>
                  <th>Ticket ID</th>
                  <th>Subject & User</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th style={{paddingRight:'20px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}><RefreshCcw size={20} style={{marginBottom:'8px'}}/><br/>Loading tickets...</td></tr>
                ) : filtered.length===0 ? (
                  <tr><td colSpan="8" style={{textAlign:'center',padding:'60px',color:'#94a3b8'}}><MessageSquare size={36} style={{opacity:0.3,marginBottom:'10px'}}/><br/>No tickets found.</td></tr>
                ) : filtered.map(t=>{
                  const pc=PRIORITY_CONFIG[t.priority]||PRIORITY_CONFIG.Medium;
                  const sc=STATUS_CONFIG[t.status]||STATUS_CONFIG['Open'];
                  return (
                    <tr key={t.id} style={{cursor:'pointer',background:selectedIds.includes(t.id)?'#eff6ff':'transparent'}} onClick={()=>openTicket(t)}>
                      <td style={{paddingLeft:'20px'}} onClick={e=>toggleSelect(t.id,e)}><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={()=>{}} style={{cursor:'pointer'}}/></td>
                      <td>
                        <span style={{fontWeight:800,color:'#3b82f6',fontSize:'0.85rem'}}>{t.ticket_id}</span>
                        <div style={{fontSize:'0.68rem',color:'#94a3b8',marginTop:'2px'}}>{fmtTime(t.created_at)}</div>
                      </td>
                      <td>
                        <div style={{fontWeight:700,color:'#0f172a',fontSize:'0.88rem'}}>{t.subject}</div>
                        <div style={{fontSize:'0.75rem',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><User size={11}/> {t.user_name}</div>
                      </td>
                      <td><span style={{background:'#f1f5f9',color:'#475569',padding:'3px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700}}>{CATEGORY_ICONS[t.category]||'📌'} {t.category}</span></td>
                      <td onClick={e=>e.stopPropagation()}>
                        <select value={t.priority} onChange={e=>updatePriority(t.id,e.target.value)} style={{background:pc.bg,color:pc.color,border:`1px solid ${pc.color}40`,padding:'3px 8px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:800,cursor:'pointer',outline:'none'}}>
                          <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
                        </select>
                      </td>
                      <td onClick={e=>e.stopPropagation()}>
                        <select value={t.status} onChange={e=>updateStatus(t.id,e.target.value)} style={{background:sc.bg,color:sc.color,border:`1px solid ${sc.color}40`,padding:'3px 8px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',outline:'none'}}>
                          <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                        </select>
                      </td>
                      <td onClick={e=>e.stopPropagation()}>
                        <select value={t.assigned_to||''} onChange={e=>assignTicket(t.id,e.target.value)} style={{fontSize:'0.75rem',padding:'3px 8px',border:'1px solid #e2e8f0',borderRadius:'8px',background:'#f8fafc',cursor:'pointer',outline:'none',color:t.assigned_to?'#1e293b':'#94a3b8'}}>
                          <option value="">Unassigned</option>
                          {AGENTS.map(a=><option key={a}>{a}</option>)}
                        </select>
                      </td>
                      <td style={{paddingRight:'20px'}}>
                        <div style={{display:'flex',gap:'6px'}} onClick={e=>e.stopPropagation()}>
                          <button className="adm-icon-btn" style={{background:'#eff6ff',color:'#3b82f6',borderRadius:'8px'}} title="Open" onClick={()=>openTicket(t)}><ChevronRight size={15}/></button>
                          {t.status!=='Resolved'&&<button className="adm-icon-btn" style={{background:'#f0fdf4',color:'#10b981',borderRadius:'8px'}} title="Resolve" onClick={()=>updateStatus(t.id,'Resolved')}><CheckCircle size={15}/></button>}
                          <button className="adm-icon-btn" style={{background:'#fff1f2',color:'#ef4444',borderRadius:'8px'}} title="Delete" onClick={(e)=>deleteTicket(t.id,e)}><Trash2 size={15}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:'12px 20px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'0.78rem',color:'#64748b'}}>Showing {filtered.length} of {tickets.length} tickets</span>
            {selectedIds.length>0&&<span style={{fontSize:'0.78rem',color:'#3b82f6',fontWeight:700}}>{selectedIds.length} selected</span>}
          </div>
        </div>
      )}

      {showModal&&selectedTicket&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.75)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',padding:'20px'}} onClick={()=>setShowModal(false)}>
          <div className="adm-fade-in" style={{background:'#fff',borderRadius:'28px',width:'720px',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 40px 100px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'22px 28px',borderBottom:'1px solid #f1f5f9',background:'#f8fafc',borderRadius:'28px 28px 0 0',flexShrink:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                    <span style={{fontWeight:800,color:'#3b82f6',fontSize:'0.9rem'}}>{selectedTicket.ticket_id}</span>
                    <select value={selectedTicket.status} onChange={e=>updateStatus(selectedTicket.id,e.target.value)} style={{background:STATUS_CONFIG[selectedTicket.status]?.bg,color:STATUS_CONFIG[selectedTicket.status]?.color,border:`1px solid ${STATUS_CONFIG[selectedTicket.status]?.color}40`,padding:'3px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',outline:'none'}}>
                      <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
                    </select>
                    <select value={selectedTicket.priority} onChange={e=>updatePriority(selectedTicket.id,e.target.value)} style={{background:PRIORITY_CONFIG[selectedTicket.priority]?.bg,color:PRIORITY_CONFIG[selectedTicket.priority]?.color,border:`1px solid ${PRIORITY_CONFIG[selectedTicket.priority]?.color}40`,padding:'3px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',outline:'none'}}>
                      <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <h3 style={{fontWeight:800,fontSize:'1.05rem',marginTop:'6px',color:'#0f172a'}}>{selectedTicket.subject}</h3>
                </div>
                <button className="adm-icon-btn" onClick={()=>setShowModal(false)}><X size={20}/></button>
              </div>
            </div>

            <div style={{overflowY:'auto',flex:1,padding:'24px 28px',display:'flex',flexDirection:'column',gap:'18px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div style={{background:'#f8fafc',padding:'14px 18px',borderRadius:'14px',border:'1px solid #e2e8f0'}}>
                  <p style={{fontSize:'0.62rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:'8px'}}>Customer</p>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'38px',height:'38px',borderRadius:'12px',background:'#eff6ff',color:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'1rem',flexShrink:0}}>{selectedTicket.user_name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p style={{fontWeight:800,color:'#0f172a',fontSize:'0.88rem'}}>{selectedTicket.user_name}</p>
                      <p style={{fontSize:'0.75rem',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Mail size={11}/> {selectedTicket.user_email}</p>
                      {selectedTicket.user_phone&&<p style={{fontSize:'0.75rem',color:'#64748b',display:'flex',alignItems:'center',gap:'4px'}}><Phone size={11}/> {selectedTicket.user_phone}</p>}
                    </div>
                  </div>
                </div>
                <div style={{background:'#f8fafc',padding:'14px 18px',borderRadius:'14px',border:'1px solid #e2e8f0'}}>
                  <p style={{fontSize:'0.62rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:'8px'}}>Details</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:'0.75rem',color:'#64748b'}}>Category</span><span style={{fontSize:'0.75rem',fontWeight:700,color:'#1e293b'}}>{CATEGORY_ICONS[selectedTicket.category]} {selectedTicket.category}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:'0.75rem',color:'#64748b'}}>Created</span><span style={{fontSize:'0.75rem',fontWeight:700,color:'#1e293b'}}>{fmtTime(selectedTicket.created_at)}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'0.75rem',color:'#64748b'}}>Assigned</span>
                      <select value={selectedTicket.assigned_to||''} onChange={e=>assignTicket(selectedTicket.id,e.target.value)} style={{fontSize:'0.75rem',padding:'2px 8px',border:'1px solid #e2e8f0',borderRadius:'8px',background:'#fff',cursor:'pointer',outline:'none',color:selectedTicket.assigned_to?'#1e293b':'#94a3b8'}}>
                        <option value="">Unassigned</option>{AGENTS.map(a=><option key={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{background:'#fafafa',padding:'16px 20px',borderRadius:'16px',border:'1px solid #e2e8f0',borderLeft:'4px solid #3b82f6'}}>
                <p style={{fontSize:'0.62rem',color:'#94a3b8',fontWeight:800,textTransform:'uppercase',marginBottom:'8px'}}>Original Message</p>
                <p style={{fontSize:'0.87rem',color:'#374151',lineHeight:1.65}}>"{selectedTicket.message}"</p>
              </div>

              {replies.length>0&&(
                <div>
                  <p style={{fontSize:'0.62rem',color:'#94a3b8',fontWeight:800,textTransform:'uppercase',marginBottom:'12px'}}>Conversation ({replies.length} messages)</p>
                  <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {replies.map((r,i)=>{
                      const isAdmin=r.sender_type==='admin'||!r.sender_type;
                      return (
                        <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start',flexDirection:isAdmin?'row':'row-reverse'}}>
                          <div style={{width:'32px',height:'32px',borderRadius:'10px',background:isAdmin?'#0f172a':'#eff6ff',color:isAdmin?'#fff':'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.68rem',fontWeight:800,flexShrink:0}}>
                            {isAdmin?<Shield size={14}/>:<User size={14}/>}
                          </div>
                          <div style={{flex:1,background:isAdmin?'#eff6ff':'#f8fafc',padding:'12px 16px',borderRadius:isAdmin?'4px 16px 16px 16px':'16px 4px 16px 16px',border:`1px solid ${isAdmin?'#bfdbfe':'#e2e8f0'}`}}>
                            <p style={{fontSize:'0.62rem',fontWeight:800,color:isAdmin?'#1d4ed8':'#64748b',marginBottom:'4px'}}>{r.agent} · {fmtTime(r.created_at)}</p>
                            <p style={{fontSize:'0.85rem',color:'#1e293b',lineHeight:1.55}}>{r.message}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={replyEndRef}/>
                  </div>
                </div>
              )}

              <div style={{borderTop:'1px solid #f1f5f9',paddingTop:'16px'}}>
                <p style={{fontSize:'0.62rem',color:'#94a3b8',fontWeight:800,textTransform:'uppercase',marginBottom:'10px'}}>Quick Reply</p>
                <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey)sendReply();}}
                  style={{width:'100%',padding:'14px 16px',border:'1px solid #e2e8f0',borderRadius:'14px',minHeight:'90px',fontSize:'0.87rem',outline:'none',resize:'vertical',lineHeight:1.55,boxSizing:'border-box',fontFamily:'inherit'}}
                  placeholder="Type your response here... (Ctrl+Enter to send)"/>
                <div style={{marginTop:'10px',display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {MACROS.map((m,i)=>(
                    <button key={i} onClick={()=>setReplyText(m)} style={{padding:'5px 12px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'20px',fontSize:'0.72rem',color:'#475569',cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}>
                      {m.length>38?m.slice(0,38)+'…':m}
                    </button>
                  ))}
                </div>
                <div style={{marginTop:'12px',display:'flex',gap:'10px'}}>
                  <button className="adm-btn adm-btn-outline" style={{flex:1,justifyContent:'center'}} onClick={()=>updateStatus(selectedTicket.id,'Resolved')}><CheckCircle size={15}/> Resolve</button>
                  <button className="adm-btn adm-btn-outline" style={{flex:1,justifyContent:'center',color:'#64748b'}} onClick={()=>updateStatus(selectedTicket.id,'Closed')}><XCircle size={15}/> Close</button>
                  <button className="adm-btn adm-btn-primary" style={{flex:1,justifyContent:'center'}} onClick={sendReply} disabled={sending||!replyText.trim()}>
                    {sending?<RefreshCcw size={15} style={{animation:'spin 1s linear infinite'}}/>:<Send size={15}/>}
                    {sending?'Sending...':'Send Reply'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{padding:'14px 28px',borderTop:'1px solid #f1f5f9',background:'#f8fafc',borderRadius:'0 0 28px 28px',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button className="adm-btn" style={{background:'#fff1f2',color:'#ef4444',border:'none',fontSize:'0.8rem'}} onClick={(e)=>{deleteTicket(selectedTicket.id,e);}}><Trash2 size={14}/> Delete Ticket</button>
              <span style={{fontSize:'0.75rem',color:'#94a3b8'}}>{replies.length} message{replies.length!==1?'s':''} in thread</span>
            </div>
          </div>
        </div>
      )}

      {showNewModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.7)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)',padding:'20px'}}>
          <div className="adm-fade-in" style={{background:'#fff',borderRadius:'28px',width:'520px',maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 40px 100px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'22px 28px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f8fafc'}}>
              <div><h3 style={{fontWeight:800,color:'#0f172a'}}>Create New Ticket</h3><p style={{fontSize:'0.75rem',color:'#64748b'}}>Submit a support ticket on behalf of a customer</p></div>
              <button className="adm-icon-btn" onClick={()=>setShowNewModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={createTicket} style={{padding:'24px 28px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'14px'}}>
              {[{l:'Subject *',k:'subject',t:'text',p:'Describe the issue briefly'},{l:'Customer Name *',k:'user_name',t:'text',p:'Full name'},{l:'Customer Email *',k:'user_email',t:'email',p:'email@example.com'},{l:'Phone (optional)',k:'user_phone',t:'tel',p:'+91 98765 43210'}].map(f=>(
                <div key={f.k}>
                  <label style={{display:'block',fontSize:'0.7rem',fontWeight:800,color:'#64748b',marginBottom:'5px',textTransform:'uppercase'}}>{f.l}</label>
                  <input type={f.t} required={f.l.includes('*')} placeholder={f.p} className="adm-btn adm-btn-outline"
                    style={{width:'100%',textAlign:'left',cursor:'text',height:'42px',padding:'0 14px',boxSizing:'border-box',fontFamily:'inherit',fontSize:'0.85rem'}}
                    value={newTicket[f.k]} onChange={e=>setNewTicket({...newTicket,[f.k]:e.target.value})}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                <div>
                  <label style={{display:'block',fontSize:'0.7rem',fontWeight:800,color:'#64748b',marginBottom:'5px',textTransform:'uppercase'}}>Category</label>
                  <select className="adm-btn adm-btn-outline" style={{width:'100%',height:'42px',padding:'0 14px'}} value={newTicket.category} onChange={e=>setNewTicket({...newTicket,category:e.target.value})}>
                    <option>General</option><option>Shipping</option><option>Billing</option><option>Product</option><option>Returns</option><option>Technical</option>
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'0.7rem',fontWeight:800,color:'#64748b',marginBottom:'5px',textTransform:'uppercase'}}>Priority</label>
                  <select className="adm-btn adm-btn-outline" style={{width:'100%',height:'42px',padding:'0 14px'}} value={newTicket.priority} onChange={e=>setNewTicket({...newTicket,priority:e.target.value})}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.7rem',fontWeight:800,color:'#64748b',marginBottom:'5px',textTransform:'uppercase'}}>Message</label>
                <textarea className="adm-btn adm-btn-outline" style={{width:'100%',textAlign:'left',cursor:'text',minHeight:'90px',padding:'10px 14px',boxSizing:'border-box',fontFamily:'inherit',fontSize:'0.85rem',resize:'vertical'}}
                  placeholder="Describe the customer's issue in detail..."
                  value={newTicket.message} onChange={e=>setNewTicket({...newTicket,message:e.target.value})}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.7rem',fontWeight:800,color:'#64748b',marginBottom:'5px',textTransform:'uppercase'}}>Tags (comma-separated, optional)</label>
                <input type="text" className="adm-btn adm-btn-outline" placeholder="e.g. urgent, order-123, refund"
                  style={{width:'100%',textAlign:'left',cursor:'text',height:'42px',padding:'0 14px',boxSizing:'border-box',fontFamily:'inherit',fontSize:'0.85rem'}}
                  value={newTicket.tags} onChange={e=>setNewTicket({...newTicket,tags:e.target.value})}/>
              </div>
              <div style={{display:'flex',gap:'12px',marginTop:'4px'}}>
                <button type="button" className="adm-btn adm-btn-outline" style={{flex:1,justifyContent:'center'}} onClick={()=>setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary" style={{flex:1,justifyContent:'center'}}><Plus size={16}/> Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
