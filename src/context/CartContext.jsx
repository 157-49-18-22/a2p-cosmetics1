import API_BASE_URL from '../apiConfig.js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const API_URL = `${API_BASE_URL}/cart`;

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const { user, setShowLoginModal } = useAuth();

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
    if (!user) {
      setShowLoginModal(true);
      return;
    }
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

  const clearCart = async () => {
    try {
      // If backend supports clearing all, use that, otherwise loop or just clear state
      // For now, let's clear the state and optionally call backend if there's an endpoint
      // Assuming we might need to delete each item or have a clear endpoint
      await axios.delete(`${API_URL}/clear/all`).catch(() => {
        // Fallback if endpoint doesn't exist: clear locally
        console.log('Clear all endpoint not found, clearing locally');
      });
      setCartItems([]);
      setCoupon(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Even if API fails, clear locally for better UX
      setCartItems([]);
      setCoupon(null);
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
      total,
      clearCart
    }}>

      {children}
    </CartContext.Provider>
  );
};
