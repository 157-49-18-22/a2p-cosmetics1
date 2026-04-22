import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './Bestsellers.css';

const Bestsellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const toggleWishlist = (product) => {
    const existingItem = wishlistItems.find(item => item.name === product.name);
    if (existingItem) {
      removeFromWishlist(existingItem.id);
    } else {
      addToWishlist({
        name: product.name,
        price: product.price,
        image_url: product.image_url
      });
    }
  };

  const handleAddToCart = (product) => {
    addToCart({
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <section className="section bestsellers">
        <div className="container text-center">
          <p>Loading Featured Products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section bestsellers" id="bestsellers">
      <div className="container">
        <div className="section-header text-center">
          <h2>Featured <span className="highlight-text">Products</span></h2>
          <p className="section-desc">
            Discover our carefully curated selection of premium cosmetics<br />
            designed to enhance your natural beauty
          </p>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>No products available yet. Check back soon!</p>
             </div>
          ) : products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="product-image-container">
                {product.category && <span className="product-category-tag">{product.category}</span>}
                <button 
                  className={`wishlist-btn ${isInWishlist(product.name) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart 
                    size={20} 
                    fill={isInWishlist(product.name) ? "var(--accent-color, #ff4d6d)" : "none"}
                    color={isInWishlist(product.name) ? "var(--accent-color, #ff4d6d)" : "currentColor"}
                  />
                </button>

                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'} 
                  alt={product.name} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop'; }}
                />

                <div className="add-to-cart-wrapper">
                  <button 
                    className="add-to-cart-overlay"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>

              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-desc">{product.description || 'Premium quality skincare product'}</p>

                <div className="product-rating-box">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#ffb400" color="#ffb400" />
                    ))}
                  </div>
                  <span className="rating-text">4.8 (342)</span>
                </div>

                <span className="product-price">₹{parseFloat(product.price).toFixed(0)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
