import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import './Checkout.css'; // Reusing some styles

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, amount, customer } = location.state || { 
    orderId: 'N/A', 
    amount: 0, 
    customer: 'Valued Customer' 
  };

  return (
    <div className="order-success-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '120px 20px',
      background: '#fff'
    }}>
      <div className="success-content" style={{ 
        maxWidth: '500px', 
        textAlign: 'center',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0'
      }}>
        <div className="success-icon" style={{ marginBottom: '24px' }}>
          <CheckCircle size={80} color="#10b981" style={{ margin: '0 auto' }} />
        </div>
        
        <h1 style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontSize: '32px', 
          marginBottom: '12px',
          color: '#1a1a1a'
        }}>Order Confirmed!</h1>
        
        <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
          Thank you for your purchase, <strong>{customer}</strong>. 
          Your order <strong>#{orderId}</strong> has been placed successfully and is being processed.
        </p>

        <div className="order-details-box" style={{ 
          background: '#fafafa', 
          padding: '24px', 
          borderRadius: '16px', 
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#888' }}>Order ID:</span>
            <span style={{ fontWeight: '600' }}>#{orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#888' }}>Amount Paid:</span>
            <span style={{ fontWeight: '600' }}>Rs. {amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>Status:</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Paid</span>
          </div>
        </div>

        <div className="success-actions" style={{ display: 'grid', gap: '16px' }}>
          <Link to="/my-orders" className="place-order-btn">
            <Package size={20} /> VIEW MY ORDERS
          </Link>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', 
              border: '1px solid #e0e0e0', 
              padding: '16px', 
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            CONTINUE SHOPPING <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
