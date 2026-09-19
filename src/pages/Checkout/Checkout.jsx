import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { MapPin, CreditCard, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, total, subtotal, discountAmount, coupon, clearCart, applyCoupon, removeCoupon } = useCart();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'razorpay'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  
  // Promo states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Referral code state
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [referralMessage, setReferralMessage] = useState({ text: '', type: '' });
  const [isValidatingReferral, setIsValidatingReferral] = useState(false);
  const [validatedReferral, setValidatedReferral] = useState(null); // { code, agent_name, agent_id, discount_type, discount_value }

  // Calculate Referral Discount dynamically
  let referralDiscountAmount = 0;
  if (validatedReferral) {
    const dVal = parseFloat(validatedReferral.discount_value || 0);
    if (validatedReferral.discount_type === 'fixed') {
      referralDiscountAmount = dVal;
    } else {
      referralDiscountAmount = Math.round((subtotal * dVal) / 100);
    }
  }

  const totalDiscountAmount = (discountAmount || 0) + referralDiscountAmount;
  const finalTotal = Math.max(0, subtotal - totalDiscountAmount);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/customers/addresses`, { credentials: 'include' });
        const data = await response.json();
        setSavedAddresses(data);
        
        // Auto-select default address if available
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) {
          handleSelectAddress(defaultAddr);
        }
      } catch (err) {
        console.error("Error fetching saved addresses:", err);
      }
    };
    fetchSavedAddresses();
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    const names = addr.name.split(' ');
    setFormData(prev => ({
      ...prev,
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      email: addr.email || '',
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zip_code
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId) setSelectedAddressId(''); // Clear selection if manual edit happens
  };


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (formData.paymentMethod === 'cod') {
        // Direct order creation for COD
        const saveOrderRes = await fetch(`${API_BASE_URL}/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            customer_name: `${formData.firstName} ${formData.lastName}`,
            customer_email: formData.email,
            customer_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            subtotal: subtotal,
            discount: totalDiscountAmount,
            total_amount: finalTotal,
            items: cartItems,
            payment_id: 'COD_' + Date.now(),
            razorpay_order_id: null,
            razorpay_signature: null,
            referral_code: validatedReferral ? validatedReferral.code : null,
            referral_agent_id: validatedReferral ? validatedReferral.agent_id : null
          })
        });

        const data = await saveOrderRes.json();
        if (data.success) {
          clearCart();
          navigate('/order-success', { 
            state: { 
              orderId: data.orderId,
              amount: finalTotal,
              customer: `${formData.firstName} ${formData.lastName}`
            } 
          });
        } else {
          alert("Order could not be saved. Please contact support.");
        }
        setIsProcessing(false);
        return;
      }

      // 1. Load Razorpay Script
      const loadScript = (src) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // 2. Create Razorpay Order in Backend
      const orderRes = await fetch(`${API_BASE_URL}/orders/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: finalTotal })
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert("Server error. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "A2P Cosmetics",
        description: "Test Transaction",
        order_id: orderData.order_id,
        handler: async function (response) {
          // 4. On Payment Success, Save Order in DB
          try {
            const saveOrderRes = await fetch(`${API_BASE_URL}/orders/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_email: formData.email,
                customer_phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                subtotal: subtotal,
                discount: totalDiscountAmount,
                total_amount: finalTotal,
                items: cartItems,
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                referral_code: validatedReferral ? validatedReferral.code : null,
                referral_agent_id: validatedReferral ? validatedReferral.agent_id : null
              })
            });

            const data = await saveOrderRes.json();

            if (data.success) {
              clearCart();
              navigate('/order-success', { 
                state: { 
                  orderId: data.orderId,
                  amount: finalTotal,
                  customer: `${formData.firstName} ${formData.lastName}`
                } 
              });
            } else {
              alert("Payment successful but order could not be saved. Please contact support.");
            }
          } catch (err) {
            console.error("Error saving order after payment:", err);
            alert("Something went wrong while saving your order.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#d4a373"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Error in checkout flow:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <ShoppingBag size={64} color="#ccc" />
          <h2>Your bag is empty</h2>
          <p>Add some products to your bag before checking out.</p>
          <button onClick={() => navigate('/')} className="place-order-btn">
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-form-section">
          {savedAddresses.length > 0 && (
            <div className="saved-addresses-selector" style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#666' }}>Use a Saved Address</h3>
              <select 
                className="address-dropdown"
                value={selectedAddressId}
                onChange={(e) => {
                  const addr = savedAddresses.find(a => a.id === parseInt(e.target.value));
                  if (addr) handleSelectAddress(addr);
                  else {
                    setSelectedAddressId('');
                    setFormData(prev => ({
                      ...prev, firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zipCode: ''
                    }));
                  }
                }}
                style={{
                  width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid #f0f0f0',
                  fontSize: '15px', outline: 'none', cursor: 'pointer', appearance: 'none',
                  background: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E") no-repeat right 15px center',
                  backgroundColor: '#fff'
                }}
              >
                <option value="">-- Select an address or enter manually --</option>
                {savedAddresses.map(addr => (
                  <option key={addr.id} value={addr.id}>
                    {addr.type}: {addr.name} - {addr.address_line.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handlePlaceOrder}>


            <section className="checkout-section">
              <h2><MapPin size={22} color="#d4a373" /> Shipping Information</h2>
              <div className="form-group-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="House No, Street Name, Locality"
                />
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section" style={{ marginTop: '40px' }}>
              <h2><CreditCard size={22} color="#d4a373" /> Payment Method</h2>
              <div className="payment-options">
                <div className={`payment-option ${formData.paymentMethod === 'razorpay' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    id="razorpay" 
                    name="paymentMethod" 
                    value="razorpay" 
                    checked={formData.paymentMethod === 'razorpay'} 
                    onChange={handleInputChange}
                  />
                  <label htmlFor="razorpay">
                    <strong>Razorpay (UPI, Cards, NetBanking)</strong>
                    <span>Secure payment via Razorpay</span>
                  </label>
                </div>
                <div className={`payment-option ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    id="cod" 
                    name="paymentMethod" 
                    value="cod" 
                    checked={formData.paymentMethod === 'cod'} 
                    onChange={handleInputChange}
                  />
                  <label htmlFor="cod">
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Pay at your doorstep (Good for testing)</span>
                  </label>
                </div>
              </div>
            </section>

            <button type="submit" className="place-order-btn" disabled={isProcessing}>
              {isProcessing ? 'PROCESSING...' : `PAY RS. ${finalTotal}`} <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <div className="order-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image_url} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity} × Rs. {item.price}</p>
                  </div>
                  <div className="item-total">
                    Rs. {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="promo-section" style={{ padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', margin: '15px 0' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input 
                  type="text" 
                  placeholder="Enter Promo Code" 
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoMessage({text: '', type: ''});
                  }}
                  disabled={coupon || isApplyingPromo}
                  style={{ flex: 1, padding: '10px 15px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
                />
                {!coupon ? (
                  <button 
                    type="button"
                    onClick={async () => {
                      if (!promoCodeInput) return;
                      setIsApplyingPromo(true);
                      const res = await applyCoupon(promoCodeInput);
                      setPromoMessage({ text: res.message, type: res.success ? 'success' : 'error' });
                      setIsApplyingPromo(false);
                    }}
                    disabled={isApplyingPromo || !promoCodeInput}
                    style={{ background: '#d4a373', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {isApplyingPromo ? '...' : 'Apply'}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setPromoCodeInput('');
                      setPromoMessage({text: '', type: ''});
                    }}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {promoMessage.text && (
                <p style={{ marginTop: 8, fontSize: '0.8rem', color: promoMessage.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Referral Code Section */}
            <div className="promo-section" style={{ padding: '15px 0', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: 8 }}>REFERRAL CODE (Optional)</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Enter Agent Referral Code"
                  value={referralCodeInput}
                  onChange={(e) => {
                    setReferralCodeInput(e.target.value.toUpperCase());
                    setReferralMessage({ text: '', type: '' });
                    if (validatedReferral) setValidatedReferral(null);
                  }}
                  disabled={!!validatedReferral || isValidatingReferral}
                  style={{ flex: 1, padding: '10px 15px', borderRadius: 8, border: `1px solid ${validatedReferral ? '#10b981' : '#ccc'}`, outline: 'none', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }}
                />
                {!validatedReferral ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!referralCodeInput.trim()) return;
                      setIsValidatingReferral(true);
                      try {
                        const res = await fetch(`${API_BASE_URL}/agent/referral-codes/validate/${referralCodeInput.trim()}`, { credentials: 'include' });
                        const data = await res.json();
                        if (res.ok && data.valid) {
                          setValidatedReferral(data);
                          const offerText = data.discount_type === 'fixed'
                            ? `₹${data.discount_value} OFF`
                            : `${data.discount_value}% OFF`;
                          setReferralMessage({ text: `✓ Valid! Agent: ${data.agent_name} • You save ${offerText}`, type: 'success' });
                        } else {
                          setReferralMessage({ text: data.message || 'Invalid referral code', type: 'error' });
                        }
                      } catch (err) {
                        setReferralMessage({ text: 'Could not validate code', type: 'error' });
                      } finally {
                        setIsValidatingReferral(false);
                      }
                    }}
                    disabled={isValidatingReferral || !referralCodeInput}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    {isValidatingReferral ? '...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setValidatedReferral(null);
                      setReferralCodeInput('');
                      setReferralMessage({ text: '', type: '' });
                    }}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {referralMessage.text && (
                <p style={{ marginTop: 8, fontSize: '0.8rem', color: referralMessage.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                  {referralMessage.text}
                </p>
              )}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              {coupon && (
                <div className="total-row discount">
                  <span>Promo Discount ({coupon.code})</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              {validatedReferral && referralDiscountAmount > 0 && (
                <div className="total-row discount" style={{ color: '#6366f1' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🎁 Referral ({validatedReferral.code})
                  </span>
                  <span>- Rs. {referralDiscountAmount}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span style={{ color: '#10b981' }}>FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs. {finalTotal}</span>
              </div>
            </div>

            <div className="security-note">
              <CheckCircle2 size={16} color="#10b981" />
              <span>Your payment is encrypted and secure.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
