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

  // Fetch cart items whenever user changes (login / logout / switch account)
  useEffect(() => {
    if (user && user.id) {
      fetchCart(); // User just logged in — load their cart
    } else if (user === null) {
      setCartItems([]); // User logged out — clear cart immediately
      setCoupon(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    try {
      // Prepare product data for backend
      const productData = {
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '').replace('Rs. ', '')) : product.price,
        image_url: product.image || product.image_url,
        quantity: product.quantity || 1
      };

      await axios.post(API_URL, productData, { withCredentials: true });
      await fetchCart(); // Refresh cart from server
      setIsCartOpen(true);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
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
      await axios.put(`${API_URL}/${id}`, { quantity: newQty }, { withCredentials: true });
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
      await axios.delete(`${API_URL}/clear/all`, { withCredentials: true }).catch(() => {
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


  const applyCoupon = async (code) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/promos/validate`, {
        code,
        cart_subtotal: subtotal,
        cart_items: cartItems
      });
      setCoupon({ code: res.data.code, discount_amount: parseFloat(res.data.discount_amount) });
      return { success: true, message: res.data.message };
    } catch (err) {
      setCoupon(null);
      return { success: false, message: err.response?.data?.error || 'Invalid promo code' };
    }
  };

  const removeCoupon = () => setCoupon(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (coupon) {
    discountAmount = coupon.discount_amount || 0;
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
