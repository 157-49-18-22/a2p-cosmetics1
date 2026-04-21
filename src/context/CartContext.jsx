import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API_URL = 'http://localhost:5000/api/cart';

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);

  // Fetch cart items on load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(API_URL);
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      // Prepare product data for backend
      const productData = {
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '').replace('Rs. ', '')) : product.price,
        image_url: product.image || product.image_url,
        quantity: 1
      };

      await axios.post(API_URL, productData);
      await fetchCart(); // Refresh cart from server
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id, delta) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);
    try {
      await axios.put(`${API_URL}/${id}`, { quantity: newQty });
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Mock valid coupons
  const VALID_COUPONS = {
    'A2P20': { discount: 20, type: 'percent' },
    'FREESHIP': { discount: 50, type: 'fixed' }, // Rs. 50 off
    'GLOW50': { discount: 50, type: 'percent' }
  };

  const applyCoupon = (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (VALID_COUPONS[cleanCode]) {
      setCoupon({ code: cleanCode, ...VALID_COUPONS[cleanCode] });
      return { success: true, message: 'Coupon applied successfully!' };
    }
    return { success: false, message: 'Invalid coupon code.' };
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'percent') {
      discountAmount = (subtotal * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
      coupon,
      subtotal,
      discountAmount,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};
