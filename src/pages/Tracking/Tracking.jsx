import React, { useState } from 'react';
import { Package, Truck, CheckCircle, MapPin, Search, Calendar, ShieldCheck } from 'lucide-react';
import './Tracking.css';

const Tracking = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        id: orderId,
        status: 'In Transit',
        statusLevel: 3, // 1: Ordered, 2: Packed, 3: Shipped, 4: Out for Delivery, 5: Delivered
        estDelivery: 'April 25, 2026',
        courier: 'Delhivery Premium',
        trackingNumber: 'A2P' + Math.floor(Math.random() * 100000000),
        history: [
          { time: '10:30 AM', date: 'April 20, 2026', location: 'Gurgaon Hub', desc: 'Arrived at sorting facility' },
          { time: '09:15 PM', date: 'April 19, 2026', location: 'Delhi Warehouse', desc: 'Dispatched for transit' },
          { time: '02:00 PM', date: 'April 19, 2026', location: 'Delhi Warehouse', desc: 'Packed and Ready' },
          { time: '11:45 AM', date: 'April 18, 2026', location: 'A2P Store', desc: 'Order Placed' },
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="tracking-page">
      <div className="container">
        <div className="tracking-header">
          <h1>Track Your Radiance</h1>
          <p>Enter your order ID to see exactly where your skincare treasures are.</p>
          
          <form className="tracking-form" onSubmit={handleTrack}>
            <div className="input-with-icon">
              <Package size={20} />
              <input 
                type="text" 
                placeholder="Order ID (e.g. #A2P-9901)" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <button type="submit" className="track-submit-btn" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Track Order'}
            </button>
          </form>
        </div>

        {trackingData && (
          <div className="tracking-result-card animate-up">
            <div className="tracking-summary">
              <div className="summary-item">
                <span className="label">ESTIMATED DELIVERY</span>
                <div className="value-wrap">
                  <Calendar size={18} />
                  <span className="value">{trackingData.estDelivery}</span>
                </div>
              </div>
              <div className="summary-item">
                <span className="label">COURIER PARTNER</span>
                <div className="value-wrap">
                  <Truck size={18} />
                  <span className="value">{trackingData.courier}</span>
                </div>
              </div>
              <div className="summary-item">
                <span className="label">TRACKING ID</span>
                <div className="value-wrap">
                  <ShieldCheck size={18} />
                  <span className="value">{trackingData.trackingNumber}</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="progress-container">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(trackingData.statusLevel - 1) * 25}%` }}></div>
              </div>
              <div className="steps-row">
                <div className={`step ${trackingData.statusLevel >= 1 ? 'active' : ''}`}>
                  <div className="step-circle"><CheckCircle size={16} /></div>
                  <span className="step-label">Ordered</span>
                </div>
                <div className={`step ${trackingData.statusLevel >= 2 ? 'active' : ''}`}>
                  <div className="step-circle"><Package size={16} /></div>
                  <span className="step-label">Packed</span>
                </div>
                <div className={`step ${trackingData.statusLevel >= 3 ? 'active' : ''}`}>
                  <div className="step-circle"><Truck size={16} /></div>
                  <span className="step-label">Shipped</span>
                </div>
                <div className={`step ${trackingData.statusLevel >= 4 ? 'active' : ''}`}>
                  <div className="step-circle"><MapPin size={16} /></div>
                  <span className="step-label">Near You</span>
                </div>
                <div className={`step ${trackingData.statusLevel >= 5 ? 'active' : ''}`}>
                  <div className="step-circle"><CheckCircle size={16} /></div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            </div>

            {/* Detailed Timeline */}
            <div className="timeline-section">
              <h3>Detailed Shipment History</h3>
              <div className="timeline-list">
                {trackingData.history.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="time-col">
                      <span className="time">{item.time}</span>
                      <span className="date">{item.date}</span>
                    </div>
                    <div className="status-marker">
                      <div className="marker-dot"></div>
                      {index < trackingData.history.length - 1 && <div className="marker-line"></div>}
                    </div>
                    <div className="status-content">
                      <h4>{item.desc}</h4>
                      <div className="location">
                        <MapPin size={12} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!trackingData && !loading && (
          <div className="tracking-placeholder">
            <div className="placeholder-icon">
              <MapPin size={48} />
            </div>
            <h3>Reliable Logistics Integration</h3>
            <p>Our orders are shipped via premium partners like Delhivery, BlueDart, and Ecom Express to ensure safety and speed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;
