import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './SearchOverlay.css';

// Tracking & Analytics Imports
import { trackUserActivity } from '../../utils/track';
import { logGAEvent } from '../../utils/analytics';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories] = useState([
    { name: 'Face Wash', path: '/facewash' },
    { name: 'Face Serum', path: '/faceserum' },
    { name: 'Face Cream', path: '/facecream' },
    { name: 'Body Wash', path: '/bodywash' }
  ]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setFilteredProducts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      // Fetch ranked search results from backend
      fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setFilteredProducts(data.slice(0, 6));
          
          // Log search activity & GA4 event
          trackUserActivity('Search', query);
          logGAEvent('search', { search_term: query });
        })
        .catch(err => console.error('Search error:', err));
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="search-container">
            <div className="search-header">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <Search className="search-input-icon" size={24} />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search for products, categories, or concerns..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </form>
              <button className="close-search" onClick={onClose}>
                <X size={28} />
              </button>
            </div>

            <div className="search-body">
              {query.trim() === '' ? (
                <div className="search-suggestions">
                  <div className="suggestion-section">
                    <h3>Popular Categories</h3>
                    <div className="category-chips">
                      {categories.map(cat => (
                        <Link key={cat.name} to={cat.path} className="category-chip" onClick={onClose}>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="suggestion-section">
                    <h3>Trending Searches</h3>
                    <ul className="trending-list">
                      <li onClick={() => setQuery('Vitamin C')}>Vitamin C <Sparkles size={14} /></li>
                      <li onClick={() => setQuery('Hyaluronic')}>Hyaluronic Acid</li>
                      <li onClick={() => setQuery('Glow')}>Glow Serum</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="search-results">
                  {filteredProducts.length > 0 ? (
                    <div className="results-grid">
                      {filteredProducts.map(product => {
                        const imgUrl = product.image_url || '/facewash_product.png';
                        return (
                          <motion.div 
                            key={product.id} 
                            className="search-product-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                              // Navigate to product detail
                              navigate(`/product/${product.id}`);
                              onClose();
                            }}
                          >
                            <div className="search-product-image">
                              <img src={imgUrl} alt={product.name} />
                            </div>
                            <div className="search-product-info">
                              <h4>{product.name}</h4>
                              <p>{product.category}</p>
                              <span className="search-product-price">₹{product.price}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-results">
                      <p>No products found for "{query}"</p>
                      <span>Try searching for something else or browse our categories.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
