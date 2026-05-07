import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Filter, ShieldCheck, Headphones, CreditCard, Smartphone } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import './Lips.css';

const Lips = () => {
  const { addToCart } = useCart();
  const { showNotification } = useNotifications();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`API_BASE_URL_PLACEHOLDER/products?category=Lips')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "/matte_lipstick_product.png",
      rating: 4.8,
      reviews: 120
    };
    addToCart(cartProduct);
    showNotification({
      type: 'cart',
      title: 'Added to Selection',
      message: `${product.name} has been added to your cart successfully.`,
      duration: 3500
    });
  };

  return (
    <div className="lips-page">
      <div className="lips-banner">
        <img src="/lips_collection_banner.png" alt="Lips Collection" />
        <div className="lips-banner-content">
          <h1>Partner in Shine</h1>
          <p>TRANSFERPROOF LIP GLOSS. Unstoppable Shine. Limitless You.</p>
        </div>
      </div>

      <div className="lips-container">
        <aside className="lips-sidebar">
          {/* Filters truncated for brevity */}
          <div className="filter-section">
            <h3>AVAILABILITY <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label">
                <input type="checkbox" /> In stock only
              </label>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{products.length} Products Found</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="lips-grid">
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#64748b' }}>Loading products...</div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#64748b' }}>No products found in this category.</div>
            ) : (
              products.map(product => (
                <div key={product.id} className="lip-card">
                  <div className="lip-card-img">
                    {product.status === 'Out of Stock' && <span className="tag-bestseller" style={{ background: '#f43f5e' }}>OUT OF STOCK</span>}
                    <img src={product.image_url || "/matte_lipstick_product.png"} alt={product.name} className="primary-img" />
                    {product.hover_image_url && <img src={product.hover_image_url} alt={product.name} className="hover-img" />}
                  </div>
                  <div className="lip-card-info">
                    <h3 className="lip-card-title">{product.name}</h3>
                    <div className="lip-card-rating">
                      <Star size={14} />
                      <span>4.8 (120)</span>
                    </div>
                    <div className="lip-card-price">
                      <span className="current-price">Rs. {parseFloat(product.price).toFixed(0)}.00</span>
                    </div>
                    <button 
                      className="add-btn" 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.status === 'Out of Stock'}
                    >
                      {product.status === 'Out of Stock' ? 'OUT OF STOCK' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Trust Features */}
      <section className="lips-features-bar">
        <div className="features-inner">
          <div className="feature-item">
            <div className="feature-icon-wrapper"><CreditCard size={40} /></div>
            <h4>100% Secure Payments</h4>
            <p>All major credit & debit cards accepted with peak encryption.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper"><ShieldCheck size={40} /></div>
            <h4>Beauty Assistant</h4>
            <p>Tell us what you are looking for and we will find your perfect match.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper"><Headphones size={40} /></div>
            <h4>Help Center</h4>
            <p>Got a question? Look no further. Browse FAQs or submit your query.</p>
          </div>
        </div>
      </section>

      {/* Spotlight & Shade Finder */}
      <section className="lips-bottom-grid">
        <div className="bottom-card">
          <h2>Spotlight</h2>
          <div className="bottom-card-media">
             <img src="/lips_collection_banner.png" alt="Spotlight" />
          </div>
        </div>
        <div className="bottom-card shade-finder-card">
          <h2>Find Your Perfect Shade</h2>
          <div className="bottom-card-media promo-media">
            <img src="/lipstick_shade_finder.png" alt="Shade Finder" />
          </div>
          <div className="promo-overlay">
            <p>Unsure which color suits you best? Our AI-powered Shade Finder helps you discover your perfect match in seconds.</p>
            <button className="add-btn quiz-btn">START THE QUIZ</button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Lips;
