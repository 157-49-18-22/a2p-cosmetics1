import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartSidebar.css';

const CartSidebar = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    applyCoupon, 
    removeCoupon,
    coupon,
    subtotal,
    discountAmount,
    total 
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState({ type: '', message: '' });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const result = applyCoupon(couponCode);
    setCouponStatus({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    if (result.success) setCouponCode('');
    
    // Clear message after 3s
    setTimeout(() => setCouponStatus({ type: '', message: '' }), 3000);
  };

  if (!isCartOpen) return null;

  return (
    <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={() => setIsCartOpen(false)}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={24} />
            <h2>Your Selection <span>({cartItems.length})</span></h2>
          </div>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon-wrap">
                <ShoppingBag size={48} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any skincare treasures yet.</p>
              <button className="cont-btn" onClick={() => setIsCartOpen(false)}>Start Shopping</button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name-row">
                      <h4>{item.name}</h4>
                      <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="item-price">Rs. {item.price}</div>
                    <div className="item-controls">
                      <div className="qty-picker">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                      <div className="item-total">Rs. {item.price * item.quantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Coupon Section */}
            <div className="coupon-section">
              {coupon ? (
                <div className="applied-coupon">
                  <div className="coupon-info">
                    <Tag size={16} color="#10b981" />
                    <span>Coupon <strong>{coupon.code}</strong> applied!</span>
                  </div>
                  <button onClick={removeCoupon} className="remove-coupon-btn">Remove</button>
                </div>
              ) : (
                <form className="coupon-form" onSubmit={handleApplyCoupon}>
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="submit">Apply</button>
                </form>
              )}
              {couponStatus.message && (
                <div className={`coupon-msg ${couponStatus.type}`}>{couponStatus.message}</div>
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              {coupon && (
                <div className="summary-line discount">
                  <span>Discount ({coupon.code})</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="summary-line shipping">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
            </div>

            <button className="checkout-btn">
              PROCEED TO CHECKOUT <ArrowRight size={20} />
            </button>
            <div className="purity-badge">
              <Sparkles size={14} /> 100% Secure & Pure Ingredients Guaranteed
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
