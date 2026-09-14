import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, MapPin, Tag, Eye, X, CheckCircle, Clock, Gift, Image, FileText, Video } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig.js';
import { useAuth } from '../../../context/AuthContext';

const API = API_BASE_URL;

const assetIcon = (type) => ({
  Print: <FileText size={16} color="#a855f7" />,
  Digital: <Image size={16} color="#ec4899" />,
  Video: <Video size={16} color="#2563eb" />,
  'In-Store': <Tag size={16} color="#16a34a" />
}[type] || <FileText size={16} />);

const statusBadge = (s) => ({
  Active: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#16a34a', borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
      <CheckCircle size={10} /> Active
    </span>
  ),
  Upcoming: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#2563eb', borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
      <Clock size={10} /> Upcoming
    </span>
  ),
  Completed: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f3e8ff', color: '#7c3aed', borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>
      Completed
    </span>
  ),
}[s] || <span style={{ background: '#fef9c3', color: '#92400e', borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 }}>{s}</span>);

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const DealerBranding = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingCampaign, setViewingCampaign] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { user } = useAuth();
  const localDealer = JSON.parse(localStorage.getItem('active_dealer') || '{}');
  const dealer = user || localDealer;
  console.log('Auth user:', user);
  console.log('Local storage dealer:', localDealer);
  console.log('Final dealer object:', dealer);
  const distributorId = dealer?.distributor_id || 1;
  const dealerZone = dealer?.zone || 'Zone A';
  console.log('Final distributorId:', distributorId);
  console.log('Final dealerZone:', dealerZone);

  useEffect(() => {
    fetchBrandingCampaigns();
  }, [distributorId]);

  const fetchBrandingCampaigns = async () => {
    try {
      console.log('Fetching branding campaigns...');
      console.log('Distributor ID:', distributorId);
      console.log('Dealer Zone:', dealerZone);
      
      if (!distributorId) { 
        console.log('No distributor ID, skipping fetch');
        setLoading(false); 
        return; 
      }
      
      const res = await fetch(`${API}/distributors/${distributorId}/campaigns`);
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Campaigns data received:', data);
        console.log('Total campaigns:', data.length);
        
        const zoneFiltered = data.filter(c => 
          c.zone === 'All Zones' || 
          c.zone === dealerZone || 
          (c.zone && c.zone.includes(dealerZone))
        );
        console.log('Zone filtered campaigns:', zoneFiltered.length);
        console.log('Filtered data:', zoneFiltered);
        
        setCampaigns(zoneFiltered);
      } else {
        console.error('Failed to fetch campaigns, status:', res.status);
      }
    } catch (error) {
      console.error('Error fetching branding campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterStatus === 'all'
    ? campaigns
    : campaigns.filter(c => (c.status || '').toLowerCase() === filterStatus.toLowerCase());

  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  const upcomingCampaigns = campaigns.filter(c => c.status === 'Upcoming').length;

  const statusFilters = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'Active', label: 'Active' },
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Completed', label: 'Completed' },
  ];

  return (
    <div className="dl-enter">
      {/* Header */}
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Branding & Campaigns</h2>
          <p className="dl-module-subtitle">
            Campaigns from your distributor for{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>📍 {dealerZone}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Active Now', value: activeCampaigns, bg: '#eff6ff', color: '#2563eb' },
          { label: 'Upcoming', value: upcomingCampaigns, bg: '#fdf4ff', color: '#c026d3' },
          { label: 'Your Zone', value: dealerZone, bg: '#fefce8', color: '#ca8a04' },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, borderRadius: 14, padding: '16px 18px',
            border: `1.5px solid ${s.color}22`
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statusFilters.map(f => (
          <button
            key={f.id}
            className={`dl-btn ${filterStatus === f.id ? 'dl-btn-primary' : 'dl-btn-outline'}`}
            onClick={() => setFilterStatus(f.id)}
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Campaigns */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <Megaphone size={40} style={{ marginBottom: 12, color: '#cbd5e1' }} />
          <p>Loading campaigns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <Gift size={52} style={{ marginBottom: 16, color: '#cbd5e1' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
            {campaigns.length === 0 ? 'No Campaigns Yet' : 'No Campaigns in This Category'}
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            {campaigns.length === 0
              ? 'Your distributor hasn\'t created any branding campaigns for your zone yet.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 18 }}>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              style={{
                background: '#fff', borderRadius: 18,
                border: '1.5px solid #e5e7eb',
                overflow: 'hidden',
                transition: 'all 0.25s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Card Header */}
              <div style={{ background: gradients[i % gradients.length], padding: '20px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', marginBottom: 4 }}>{c.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>
                    {assetIcon(c.type)}
                    <span>{c.type}</span>
                  </div>
                </div>
                {statusBadge(c.status)}
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Zone & Budget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#10b981" /> {c.zone}
                  </span>
                  <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                    ₹{parseFloat(c.budget || 0).toLocaleString()}
                  </span>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9ca3af' }}>
                  <Calendar size={13} />
                  <span>
                    {c.start_date ? new Date(c.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    {' → '}
                    {c.end_date ? new Date(c.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                {/* Description preview */}
                {c.description && (
                  <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5, margin: 0,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                )}

                {/* Active Progress Bar */}
                {c.status === 'Active' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', marginBottom: 4 }}>
                      <span>Campaign Progress</span><span>Active</span>
                    </div>
                    <div style={{ height: 5, background: '#f0fdf4', borderRadius: 99 }}>
                      <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 99 }} />
                    </div>
                  </div>
                )}

                <button
                  className="dl-btn dl-btn-outline"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: '0.8rem' }}
                  onClick={() => setViewingCampaign(c)}
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone Info Banner */}
      <div style={{
        marginTop: 28, borderRadius: 16, padding: '18px 22px',
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        border: '1.5px solid #a7f3d0',
        display: 'flex', alignItems: 'center', gap: 14
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MapPin size={22} color="#fff" />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem', margin: 0 }}>
            Showing campaigns for your zone: {dealerZone}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#047857', margin: '4px 0 0' }}>
            You can see campaigns targeted at "{dealerZone}" and all-zone campaigns from your distributor.
          </p>
        </div>
      </div>

      {/* View Campaign Modal */}
      {viewingCampaign && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={() => setViewingCampaign(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{viewingCampaign.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: '6px 0 0' }}>Campaign Details</p>
              </div>
              <button onClick={() => setViewingCampaign(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Type</label>
                  <p style={{ fontWeight: 600, color: '#1e293b', margin: '4px 0 0' }}>{viewingCampaign.type}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Status</label>
                  <div style={{ marginTop: 4 }}>{statusBadge(viewingCampaign.status)}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Budget</label>
                  <p style={{ fontWeight: 800, color: '#7c3aed', margin: '4px 0 0', fontSize: '1.1rem' }}>₹{parseFloat(viewingCampaign.budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Target Zone</label>
                  <p style={{ fontWeight: 600, color: '#10b981', margin: '4px 0 0' }}>📍 {viewingCampaign.zone}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Duration</label>
                  <p style={{ fontWeight: 600, color: '#1e293b', margin: '4px 0 0' }}>
                    📅 {viewingCampaign.start_date ? new Date(viewingCampaign.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                    {' — '}
                    {viewingCampaign.end_date ? new Date(viewingCampaign.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                {viewingCampaign.description && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Description</label>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6, margin: '4px 0 0' }}>{viewingCampaign.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <button
                className="dl-btn dl-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setViewingCampaign(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerBranding;
