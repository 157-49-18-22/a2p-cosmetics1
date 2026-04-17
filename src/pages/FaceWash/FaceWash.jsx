import React from 'react';
import { Star, ChevronDown, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
import './FaceWash.css'; // Dedicated FaceWash styles

const faceWashProducts = [
  {
    id: 1,
    name: "DEEP CLEANSING FOAMING FACE WASH",
    price: 449,
    oldPrice: 599,
    discount: "25% Off",
    rating: 4.9,
    reviews: 1250,
    tag: "BESTSELLER",
    image: "/facewash_product.png" 
  },
  {
    id: 2,
    name: "GENTLE HYDRATING CLEANSER",
    price: 399,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 840,
    tag: "NEW LAUNCH",
    image: "/facewash_product.png"
  },
  {
    id: 3,
    name: "ACNE CONTROL SALICYLIC FACE WASH",
    price: 499,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 2100,
    tag: "BESTSELLER",
    image: "/facewash_product.png"
  },
  {
    id: 4,
    name: "VITAMINC C BRIGHTENING FACE WASH",
    price: 549,
    oldPrice: 649,
    discount: "15% Off",
    rating: 4.8,
    reviews: 1560,
    tag: null,
    image: "/facewash_product.png"
  },
  {
    id: 5,
    name: "CHARCOAL DETOXIFYING FACE WASH",
    price: 429,
    oldPrice: null,
    discount: null,
    rating: 4.6,
    reviews: 930,
    tag: "POPULAR",
    image: "/facewash_product.png"
  },
  {
    id: 6,
    name: "TEA TREE PURIFYING FACE WASH",
    price: 389,
    oldPrice: 450,
    discount: "12% Off",
    rating: 4.7,
    reviews: 1100,
    tag: null,
    image: "/facewash_product.png"
  }
];

const FaceWash = () => {
  return (
    <div className="lips-page facewash-page">
      <div className="lips-banner">
        <video 
          src="/video1.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="banner-video"
        />
      </div>

      <div className="lips-container">
        <aside className="lips-sidebar">
          <div className="filter-section">
            <h3>SKIN TYPE <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label"><input type="checkbox" /> Oily Skin</label>
              <label className="filter-label"><input type="checkbox" /> Dry Skin</label>
              <label className="filter-label"><input type="checkbox" /> Sensitive Skin</label>
              <label className="filter-label"><input type="checkbox" /> Combination</label>
            </div>
          </div>

          <div className="filter-section">
            <h3>PRICE <ChevronDown size={16} /></h3>
            <div className="price-range">
              <input type="range" min="0" max="1000" style={{width: '100%', accentColor: '#ec4899'}} />
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.9rem'}}>
                <span>₹ 0</span>
                <span>₹ 1000</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{faceWashProducts.length} Face Washes Found</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="grid container-grid lips-grid">
            {faceWashProducts.map(product => (
              <div key={product.id} className="lip-card">
                <div className="lip-card-img">
                  {product.tag && <span className="tag-bestseller">{product.tag}</span>}
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="lip-card-info">
                  <h3 className="lip-card-title">{product.name}</h3>
                  <div className="lip-card-rating">
                    <Star size={14} />
                    <span>{product.rating} ({product.reviews})</span>
                  </div>
                  <div className="lip-card-price">
                    <span className="current-price">Rs. {product.price}.00</span>
                    {product.oldPrice && <span className="old-price">Rs. {product.oldPrice}</span>}
                    {product.discount && <span className="discount">{product.discount}</span>}
                  </div>
                  <button className="add-btn">ADD TO CART</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Trust Features Bar */}
      <section className="lips-features-bar">
        <div className="features-inner">
          <div className="feature-item">
            <div className="feature-icon-wrapper"><CreditCard size={40} /></div>
            <h4>Secure Payments</h4>
            <p>100% encrypted and safe checkout with all major cards.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper"><ShieldCheck size={40} /></div>
            <h4>Pure & Natural</h4>
            <p>Our formulas are crafted with the finest natural ingredients.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper"><Headphones size={40} /></div>
            <h4>24/7 Support</h4>
            <p>Our beauty experts are here to help you every step of the way.</p>
          </div>
        </div>
      </section>

      {/* Bottom Spotlight */}
      <section className="lips-bottom-grid">
        <div className="bottom-card">
          <h2>Transform Your Routine</h2>
          <div className="bottom-card-media">
             <img src="/facewash_banner.png" alt="Skincare Transformation" />
          </div>
        </div>
        <div className="bottom-card shade-finder-card">
          <h2>Skin Analysis</h2>
          <div className="bottom-card-media promo-media">
            <img src="/skincare_analysis.png" alt="Skin Care Analysis" />
          </div>
          <div className="promo-overlay">
            <p>Not sure which face wash is right for your skin? Take our 1-minute personalized skin analysis quiz to find your perfect cleanser.</p>
            <button className="add-btn quiz-btn">DISCOVER MY SKIN TYPE</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaceWash;
