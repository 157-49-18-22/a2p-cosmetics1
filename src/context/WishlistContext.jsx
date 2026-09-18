import API_BASE_URL from '../apiConfig.js';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();
const API_URL = `${API_BASE_URL}/wishlist`;

export const useWishlist = () => useContext(WishlistContext);

// Returns a user-specific localStorage key so different users don't share wishlist
const getWishlistKey = (userId) => userId ? `a2p_wishlist_${userId}` : null;

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { user, setShowLoginModal } = useAuth();

  // Whenever user changes (login / logout / switch account), reload the correct wishlist
  useEffect(() => {
    if (user && user.id) {
      // Load this user's wishlist: first try backend, fall back to localStorage
      fetchWishlist(user.id);
    } else {
      // No user logged in — clear wishlist so previous user's items are hidden
      setWishlistItems([]);
    }
  }, [user]);

  // Persist wishlist to localStorage keyed by user ID whenever items change
  useEffect(() => {
    const key = getWishlistKey(user?.id);
    if (!key) return; // Don't persist when no user is logged in
    try {
      localStorage.setItem(key, JSON.stringify(wishlistItems));
    } catch (err) {
      console.error('Error saving wishlist to localStorage:', err);
    }
  }, [wishlistItems, user]);

  const fetchWishlist = async (userId) => {
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      if (Array.isArray(response.data)) {
        setWishlistItems(response.data);
        return;
      }
    } catch (error) {
      console.log('Backend wishlist fetch failed, using localStorage fallback');
    }
    // Fallback: load from user-specific localStorage
    try {
      const key = getWishlistKey(userId);
      if (key) {
        const saved = localStorage.getItem(key);
        setWishlistItems(saved ? JSON.parse(saved) : []);
      }
    } catch {
      setWishlistItems([]);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }

    const newItem = {
      id: product.id || `wl-${Date.now()}`,
      name: product.name,
      price: typeof product.price === 'string' 
        ? parseFloat(product.price.replace('$', '').replace('Rs. ', '').replace('₹', '')) 
        : product.price,
      image_url: product.image || product.image_url || '/luxury_facewash_pump.png'
    };

    // Optimistic update
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === newItem.id || item.name === newItem.name);
      if (exists) return prev;
      return [...prev, newItem];
    });

    // Save to backend wishlist (so it persists per user)
    try {
      await axios.post(API_URL, {
        name: newItem.name,
        price: newItem.price,
        image_url: newItem.image_url
      }, { withCredentials: true });
      // Refresh from backend to get the real DB id
      await fetchWishlist(user.id);
    } catch (error) {
      console.log('Backend wishlist save failed, using local fallback');
    }

    // Also sync to admin tracker if product has a real DB integer ID
    if (user.id && product.id) {
      const isNumericId = !isNaN(product.id) && Number.isInteger(Number(product.id));
      if (isNumericId) {
        try {
          await axios.post(`${API_BASE_URL}/wishlist-tracker`, {
            customer_id: user.id,
            product_id: parseInt(product.id, 10)
          }, { withCredentials: true });
        } catch (error) {
          console.log('Wishlist tracker sync skipped');
        }
      }
    }
    return true;
  };

  const removeFromWishlist = async (id) => {
    // Optimistic remove
    setWishlistItems(prev => prev.filter(item => item.id !== id));

    if (!user) return;

    const isNumericId = !isNaN(id) && Number.isInteger(Number(id));
    if (isNumericId) {
      try {
        // Delete from backend wishlist table
        await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      } catch (error) {
        console.log('Backend wishlist delete failed');
      }
      try {
        // Also remove from admin tracker
        await axios.delete(`${API_BASE_URL}/wishlist-tracker/remove?customerId=${user.id}&productId=${parseInt(id, 10)}`);
      } catch (error) {
        console.log('Backend tracker sync failed for removing wishlist item');
      }
    }
  };

  const isInWishlist = (idOrName) => {
    return wishlistItems.some(item => item.id === idOrName || item.name === idOrName);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      isWishlistOpen,
      setIsWishlistOpen
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
