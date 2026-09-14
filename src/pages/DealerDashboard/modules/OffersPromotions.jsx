import React, { useState, useEffect } from 'react';
import { Tag, Gift, Percent, Calendar, Bell, X, Sparkles } from 'lucide-react';
import API_BASE_URL from '../../../apiConfig.js';
import { useAuth } from '../../../context/AuthContext';

const API = API_BASE_URL;

const OffersPromotions = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get dealer data to get distributor_id
  const localDealer = JSON.parse(localStorage.getItem('active_dealer') || '{}');
  const dealer = user || localDealer;
  const distributorId = dealer?.distributor_id || 1;

  useEffect(() => {
    fetchDistributorOffers();
  }, [distributorId]);

  const fetchDistributorOffers = async () => {
    try {
      if (!distributorId) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${API}/distributors/${distributorId}/campaigns`);
      if (res.ok) {
        const data = await res.json();
        // Transform campaign data to offer format
        const transformedOffers = data.map(campaign => ({
          id: campaign.id || `OFF-${campaign.id}`,
          title: campaign.title || campaign.name || 'Special Offer',
          description: campaign.description || campaign.message || 'Special discount offer',
          discount: campaign.discount || campaign.offer_type || 'Special Offer',
          type: campaign.type || 'Promotional',
          category: campaign.category || 'promotional',
          validFrom: campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-GB') : '01/08/2026',
          validTo: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('en-GB') : '31/12/2026',
          image: campaign.image || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          products: campaign.products || ['All Products']
        }));
        setOffers(transformedOffers);
      }
    } catch (error) {
      console.error('Error fetching distributor offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const notificationBanners = offers.length > 0 
    ? offers.slice(0, 2).map(offer => ({
        id: offer.id,
        message: `🎉 ${offer.title} - ${offer.discount}!`,
        type: 'info'
      }))
    : [];

  const filteredOffers = selectedCategory === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Offers' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'product', label: 'Product' },
    { id: 'promotional', label: 'Promotional' },
    { id: 'special', label: 'Special' },
  ];

  const handleClaimOffer = (offerId) => {
    alert(`Claiming offer: ${offerId}`);
  };

  return (
    <div className="dl-enter">
      <div className="dl-module-header">
        <div className="dl-header-info">
          <h2 className="dl-module-title">Offers & Promotions</h2>
          <p className="dl-module-subtitle">View all available offers, promotions, and discounts</p>
        </div>
      </div>

      {/* Notification Banners */}
      {notificationBanners.map(banner => (
        <div 
          key={banner.id}
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: banner.type === 'info' ? '#dbeafe' : '#fef3c7',
            border: `1px solid ${banner.type === 'info' ? '#93c5fd' : '#fcd34d'}`,
            color: banner.type === 'info' ? '#1e40af' : '#92400e'
          }}
        >
          <Bell size={18} />
          <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: '500' }}>{banner.message}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      ))}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`dl-btn ${selectedCategory === cat.id ? 'dl-btn-primary' : 'dl-btn-outline'}`}
            onClick={() => setSelectedCategory(cat.id)}
            style={{ fontSize: '0.8rem', padding: '8px 16px' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>Loading offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Gift size={48} style={{ marginBottom: '16px', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>No Offers Available</h3>
          <p style={{ fontSize: '0.9rem' }}>Your distributor hasn't created any offers yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredOffers.map((offer, i) => (
            <div key={i} className="dl-card" style={{ overflow: 'visible' }}>
              <div 
                style={{ 
                  height: '120px', 
                  background: offer.image,
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: '20px'
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {offer.type}
                </div>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <Sparkles size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{offer.discount}</div>
                </div>
              </div>
              <div className="dl-card-body">
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  {offer.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
                  {offer.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                  <Calendar size={14} />
                  <span>Valid: {offer.validFrom} to {offer.validTo}</span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                    Applicable Products:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {offer.products.map((product, idx) => (
                      <span key={idx} className="dl-badge dl-badge-sky" style={{ fontSize: '0.7rem' }}>
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  className="dl-btn dl-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleClaimOffer(offer.id)}
                >
                  <Tag size={16} /> Claim Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Special Campaign Banner */}
      <div className="dl-card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div className="dl-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Gift size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Special Campaign</h3>
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 0 }}>
              Refer a new dealer and earn ₹1000 bonus! Limited time offer.
            </p>
          </div>
          <button className="dl-btn" style={{ background: '#fff', color: '#667eea', padding: '10px 20px' }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffersPromotions;
