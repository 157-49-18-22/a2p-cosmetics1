import API_BASE_URL from '../../apiConfig.js';
import React, { useEffect, useState } from 'react';
import './Profile.css';
import { Package, Clock, ChevronRight, Loader2 } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/all`);
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="profile-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="#d4a373" />
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>My Orders</h1>
        <p>Track, manage and view your previous orders.</p>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-orders" style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '20px' }}>
            <Package size={48} color="#ccc" style={{ marginBottom: '16px' }} />
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-main-info">
                <div className="order-icon-bg">
                  <Package size={24} />
                </div>
                <div className="order-details">
                  <h3>Order #{order.order_number}</h3>
                  <span className="order-date"><Clock size={14} /> {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="order-meta">
                <div className="order-status-badge" data-status={order.order_status.toLowerCase()}>
                  {order.order_status}
                </div>
                <div className="order-total">
                  <span>{order.payment_status}</span>
                  <strong>Rs. {order.total_amount}</strong>
                </div>
                <button className="view-order-btn">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;

