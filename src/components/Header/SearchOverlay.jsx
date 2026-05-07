import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './SearchOverlay.css';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([
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
      fetchProducts();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`API_BASE_URL_PLACEHOLDER/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.category.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(filtered.slice(0, 6)); // Limit to 6 results
  }, [query, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Logic for full search page or just closing with selection
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
                      {filteredProducts.map(product => (
                        <motion.div 
                          key={product.id} 
                          className="search-product-card"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            // Navigate to product detail if available, or just category
                            navigate(`/${product.category.replace(' ', '').toLowerCase()}`);
                            onClose();
                          }}
                        >
                          <div className="search-product-image">
                            <img src={product.image_url} alt={product.name} />
                          </div>
                          <div className="search-product-info">
                            <h4>{product.name}</h4>
                            <p>{product.category}</p>
                            <span className="search-product-price">₹{product.price}</span>
                          </div>
                        </motion.div>
                      ))}
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
