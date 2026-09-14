import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ThumbsUp } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import './Bestsellers.css';

// Fallback products — always shown when DB image is missing
const FALLBACK_PRODUCTS = [
  { id: 'ap-1', name: 'A2P Turmeric Skin Cream', price: 75.00,  image_url: '/facewash_product.png' },
  { id: 'ap-2', name: 'A2P Vajradanti Paste',    price: 25.00,  image_url: '/face_cream_product.png' },
  { id: 'ap-8', name: 'WSO Skin Cream',          price: 37.00,  image_url: '/body_wash_product.png' },
  { id: 'ap-5', name: 'A2P Vajradanti Powder',   price: 20.00,  image_url: '/luxury_serum_hero.png' },
];

// Merge DB product with fallback to always guarantee images
const mergeProductWithFallback = (product, idx) => {
  const fallback = FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length];
  const img = product.image_url;
  const isValidImg = img && (img.startsWith('/') || img.startsWith('http'));
  return {
    ...product,
    id: product.id || fallback.id,
    image_url: isValidImg ? img : fallback.image_url,
    stock: product.stock !== undefined ? parseInt(product.stock) : 10
  };
};

const Bestsellers = () => {
  const navigate = useNavigate();
  const { addToWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setProducts(data.map(mergeProductWithFallback));
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
        setLoading(false);
      })
      .catch(err => {
      console.error('Error fetching products:', err);
      setProducts(FALLBACK_PRODUCTS);
      setLoading(false);
    });
  }, []);

  const handleLike = async (product, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/products/${product.id}/like`, { method: 'PUT' });
      const data = await res.json();
      if (data.likes !== undefined) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, likes: data.likes } : p));
      }
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <section className="vicco-bestsellers">
        <div className="vicco-container">
          <p style={{textAlign: 'center'}}>Loading Best Sellers...</p>
        </div>
      </section>
    );
  }

  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="vicco-bestsellers" id="bestsellers">
      <div className="vicco-container">
        
        {/* Top Header Row */}
        <div className="vicco-header-row">
          <h2 className="vicco-title">BEST SELLERS</h2>
          <a href="/all-products" className="vicco-view-all-btn">VIEW ALL</a>
        </div>

        {/* Product Grid */}
        <div className="vicco-products-grid">
          {displayProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              className={`vicco-product-card ${product.stock === 0 ? 'vicco-card-out-of-stock' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Image Box */}
              <div className="vicco-image-box">

                {/* ThumbsUp Like Badge */}
                <div
                  className="vicco-likes-badge"
                  onClick={(e) => handleLike(product, e)}
                  style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.85)', padding: '4px 9px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', color: '#0f172a', transition: 'transform 0.15s' }}
                >
                  <ThumbsUp size={13} />
                  <span>{product.likes || 0}</span>
                </div>
                
                <button 
                  className="vicco-wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url || '/facewash_product.png'
                    });
                  }}
                >
                  <Heart size={20} strokeWidth={1.5} />
                </button>

                {product.stock === 0 && (
                  <span className="vicco-oos-overlay-tag">OUT OF STOCK</span>
                )}

                <img 
                  src={product.image_url || '/facewash_product.png'} 
                  alt={product.name}
                  className="vicco-product-img"
                  onError={(e) => { e.target.src = '/facewash_product.png'; }}
                />

                <button
                  className={`vicco-quick-add-btn ${product.stock === 0 ? 'vicco-quick-add-btn--oos' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.stock !== 0) navigate(`/product/${product.id}`);
                  }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'OUT OF STOCK' : 'SHOP NOW'}
                </button>
              </div>

              {/* Details Box */}
              <div className="vicco-details-box">
                <h3 className="vicco-product-name">{product.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <p className="vicco-product-price">₹ {parseFloat(product.price).toFixed(2)}</p>
                  {product.old_price && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>₹ {parseFloat(product.old_price).toFixed(2)}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Bestsellers;
