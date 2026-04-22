import React from 'react';
import './Profile.css';
import { Package, Clock, ChevronRight } from 'lucide-react';

const MyOrders = () => {
  const orders = [
    { id: '#ORD-7829', date: 'Oct 12, 2023', status: 'Delivered', total: '₹2,450', items: 3 },
    { id: '#ORD-7541', date: 'Sep 25, 2023', status: 'In Transit', total: '₹1,200', items: 1 },
    { id: '#ORD-6982', date: 'Aug 10, 2023', status: 'Cancelled', total: '₹3,500', items: 4 },
  ];

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>My Orders</h1>
        <p>Track, manage and view your previous orders.</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-main-info">
              <div className="order-icon-bg">
                <Package size={24} />
              </div>
              <div className="order-details">
                <h3>Order {order.id}</h3>
                <span className="order-date"><Clock size={14} /> {order.date}</span>
              </div>
            </div>
            
            <div className="order-meta">
              <div className="order-status-badge" data-status={order.status.toLowerCase().replace(' ', '-')}>
                {order.status}
              </div>
              <div className="order-total">
                <span>{order.items} Items</span>
                <strong>{order.total}</strong>
              </div>
              <button className="view-order-btn">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
