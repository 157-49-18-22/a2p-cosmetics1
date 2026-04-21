import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();
const API_URL = 'http://localhost:5000/api/wishlist';

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(API_URL);
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const productData = {
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '').replace('Rs. ', '')) : product.price,
        image_url: product.image || product.image_url
      };

      await axios.post(API_URL, productData);
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (name) => {
    return wishlistItems.some(item => item.name === name);
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
