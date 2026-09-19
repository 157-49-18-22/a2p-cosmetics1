import API_BASE_URL from '../apiConfig.js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const API_URL = `${API_BASE_URL}/cart`;

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('a2p_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const { user } = useAuth();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('a2p_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  // Fetch cart from backend whenever user logs in
  useEffect(() => {
    if (user && user.id) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      if (Array.isArray(response.data) && response.data.length > 0) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching backend cart:', error);
    }
  };

  const addToCart = async (product) => {
    if (!product) return false;

    let rawPrice = product.price;
    if (typeof rawPrice === 'string') {
      rawPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
    } else {
      rawPrice = parseFloat(rawPrice) || 0;
    }

    const itemToAdd = {
      id: product.id || Date.now(),
      product_id: product.id,
      name: product.name || 'Product',
      price: rawPrice,
      image: product.image || product.image_url || '/facewash_product.png',
      image_url: product.image || product.image_url || '/facewash_product.png',
      quantity: product.quantity || 1
    };

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => (item.id === itemToAdd.id || (item.product_id && item.product_id === itemToAdd.product_id)));
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + itemToAdd.quantity
        };
        return updated;
      }
      return [...prev, itemToAdd];
    });

    setIsCartOpen(true);

    // If user is logged in, sync in background
    if (user && user.id) {
      try {
        await axios.post(API_URL, {
          name: itemToAdd.name,
          price: itemToAdd.price,
          image_url: itemToAdd.image_url,
          quantity: itemToAdd.quantity
        }, { withCredentials: true });
      } catch (error) {
        console.warn('Backend cart sync omitted/failed, local cart retained:', error.message);
      }
    }

    return true;
  };

  const removeFromCart = async (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id && item.product_id !== id));
    if (user && user.id) {
      try {
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      } catch (error) {
        console.error('Error removing from cart on server:', error);
      }
    }
  };

  const updateQuantity = async (id, delta) => {
    let targetQty = 1;
    setCartItems(prev => prev.map(item => {
      if (item.id === id || item.product_id === id) {
        targetQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: targetQty };
      }
      return item;
    }));

    if (user && user.id) {
      try {
        await axios.put(`${API_URL}/${id}`, { quantity: targetQty }, { withCredentials: true });
      } catch (error) {
        console.error('Error updating quantity on server:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setCoupon(null);
    try {
      localStorage.removeItem('a2p_cart');
    } catch (e) {}
    if (user && user.id) {
      try {
        await axios.delete(`${API_URL}/clear/all`, { withCredentials: true });
      } catch (error) {}
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

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.quantity), 0);
  
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

