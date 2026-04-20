import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code: 'A2P20', discount: 20, type: 'percent' }

  // Mock valid coupons
  const VALID_COUPONS = {
    'A2P20': { discount: 20, type: 'percent' },
    'FREESHIP': { discount: 50, type: 'fixed' }, // Rs. 50 off
    'GLOW50': { discount: 50, type: 'percent' }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
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
