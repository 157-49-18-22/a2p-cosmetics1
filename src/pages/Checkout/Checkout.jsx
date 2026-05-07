import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { MapPin, CreditCard, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, total, subtotal, discountAmount, coupon, clearCart } = useCart();
  
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

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await fetch(`API_BASE_URL_PLACEHOLDER/customers/addresses');
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
      const orderRes = await fetch(`API_BASE_URL_PLACEHOLDER/orders/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
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
            const saveOrderRes = await fetch(`API_BASE_URL_PLACEHOLDER/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_name: `${formData.firstName} ${formData.lastName}`,
                customer_email: formData.email,
                customer_phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                subtotal: subtotal,
                discount: discountAmount,
                total_amount: total,
                items: cartItems,
                payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const data = await saveOrderRes.json();

            if (data.success) {
              clearCart();
              navigate('/order-success', { 
                state: { 
                  orderId: data.orderId,
                  amount: total,
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
                  <label>ZIP Code</label>
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
                <div className="payment-option active">
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
              </div>
            </section>

            <button type="submit" className="place-order-btn" disabled={isProcessing}>
              {isProcessing ? 'PROCESSING...' : `PAY RS. ${total}`} <ArrowRight size={20} />
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
            
            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              {coupon && (
                <div className="total-row discount">
                  <span>Discount ({coupon.code})</span>
                  <span>- Rs. {discountAmount}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping</span>
                <span style={{ color: '#10b981' }}>FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>Rs. {total}</span>
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
