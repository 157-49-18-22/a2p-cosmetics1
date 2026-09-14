import React, { useState, useEffect } from 'react';
import { Package, Tag, Layers, TrendingUp, DollarSign, ShoppingCart, AlertCircle, Megaphone } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig.js';
import { useAuth } from '../../../context/AuthContext';

const API = API_BASE_URL;

const DealerHome = ({ onNavigate }) => {
  const { user } = useAuth();
  const localDealer = JSON.parse(localStorage.getItem('active_dealer') || '{}');
  const dealer = user || localDealer;
  
  const [stats, setStats] = useState([
    { icon: Package, label: 'Active Orders', value: '0', change: '+0%', up: true },
    { icon: ShoppingCart, label: 'Total Orders', value: '0', change: '+0%', up: true },
    { icon: DollarSign, label: 'Pending Payments', value: '₹0', change: '-0%', up: false },
    { icon: Megaphone, label: 'Active Campaigns', value: '0', change: '+0', up: true },
  ]);

  const [dealerInfo, setDealerInfo] = useState({
    zone: 'Zone A',
    distributorName: 'Distributor #1',
    status: 'Active'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealerData();
  }, []);

  const fetchDealerData = async () => {
    try {
      const dealerId = dealer?.id;
      if (!dealerId) {
        console.log('No dealer ID found');
        setLoading(false);
        return;
      }

      console.log('Fetching dealer data for ID:', dealerId);

      // Fetch dealer details
      const res = await fetch(`${API}/dealers/${dealerId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Dealer data:', data);
        setDealerInfo({
          zone: data.zone || 'Zone A',
          distributorName: `Distributor #${data.distributor_id}`,
          status: data.status || 'Active'
        });
      } else {
        console.error('Failed to fetch dealer details');
      }

      // Fetch dealer's campaigns count
      const distributorId = dealer?.distributor_id;
      if (distributorId) {
        console.log('Fetching campaigns for distributor:', distributorId);
        const campRes = await fetch(`${API}/distributors/${distributorId}/campaigns`);
        if (campRes.ok) {
          const campaigns = await campRes.json();
          console.log('Campaigns data:', campaigns);
          setStats(prev => {
            const newStats = [...prev];
            newStats[3] = { ...newStats[3], value: campaigns.filter(c => c.status === 'Active').length };
            return newStats;
          });
        } else {
          console.error('Failed to fetch campaigns');
        }
      }

    } catch (error) {
      console.error('Error fetching dealer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dl-enter" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: '#64748b' }}>Loading dealer data...</div>
      </div>
    );
  }

  return (
    <div className="dl-enter">
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Dealer Dashboard</h2>
          <p className="dl-module-subtitle">Welcome back! Here's your business overview.</p>
        </div>
        <div className="dl-header-btns">
          <button className="dl-btn dl-btn-primary" onClick={() => onNavigate('products')}>
            <Package size={16} /> Browse Products
          </button>
          <button className="dl-btn dl-btn-outline" onClick={() => onNavigate('branding')}>
            <Megaphone size={16} /> View Campaigns
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dl-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="dl-stat-card">
            <div className="dl-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <stat.icon size={20} />
            </div>
            <div className="dl-stat-value">{stat.value}</div>
            <div className="dl-stat-label">{stat.label}</div>
            <div className={`dl-stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? <TrendingUp size={12} /> : <AlertCircle size={12} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dl-dashboard-grid">
        {/* Quick Info */}
        <div className="dl-card">
          <div className="dl-card-header">
            <h3 className="dl-card-title">Quick Info</h3>
          </div>
          <div className="dl-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Your Zone</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#065f46' }}>{dealerInfo.zone}</div>
              </div>
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Distributor</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e40af' }}>{dealerInfo.distributorName}</div>
              </div>
              <div style={{ padding: '12px', background: '#fdf4ff', borderRadius: '10px', border: '1px solid #fae8ff' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Account Status</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#86198f' }}>{dealerInfo.status}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dl-card" style={{ marginTop: '24px' }}>
        <div className="dl-card-header">
          <h3 className="dl-card-title">Quick Actions</h3>
        </div>
        <div className="dl-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <button className="dl-btn dl-btn-primary" style={{ justifyContent: 'center', padding: '16px' }} onClick={() => onNavigate('products')}>
              <Package size={20} />
              <span>Browse Catalog & Place Order</span>
            </button>
            <button className="dl-btn dl-btn-outline" style={{ justifyContent: 'center', padding: '16px' }} onClick={() => onNavigate('branding')}>
              <Megaphone size={20} />
              <span>View Marketing Campaigns</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerHome;
