import React from 'react';
import { Star, ChevronDown, Filter, ShieldCheck, Headphones, CreditCard, Smartphone } from 'lucide-react';
import './Lips.css';

const lipProducts = [
  {
    id: 1,
    name: "MATTE AS HELL CRAYON LIPSTICK",
    price: 899,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 1444,
    shades: 35,
    tag: "BESTSELLER",
    image: "/matte_lipstick_product.png" 
  },
  {
    id: 2,
    name: "GLIDE PEPTIDE SERUM LIPSTICK",
    price: 499,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 725,
    shades: 12,
    tag: "BESTSELLER",
    image: "/matte_lipstick_product.png"
  },
  {
    id: 3,
    name: "GLIDE PEPTIDE PLUMPING GLOSS STICK",
    price: 699,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 402,
    shades: 8,
    tag: "NEW LAUNCH",
    image: "/matte_lipstick_product.png"
  },
  {
    id: 4,
    name: "MATTE ATTACK TRANSFERPROOF LIPSTICK",
    price: 749,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 1168,
    shades: 15,
    tag: "BESTSELLER",
    image: "/matte_lipstick_product.png"
  },
  {
    id: 5,
    name: "TIPSY LIPS SCRUB + BALM DUO",
    price: 349,
    oldPrice: 499,
    discount: "30% Off",
    rating: 4.9,
    reviews: 898,
    shades: null,
    tag: null,
    image: "/matte_lipstick_product.png"
  },
  {
    id: 6,
    name: "PLAY VIBE CHECK LIQUID LIPSTICK",
    price: 249,
    oldPrice: 499,
    discount: "50% Off",
    rating: 4.6,
    reviews: 1015,
    shades: 20,
    tag: null,
    image: "/matte_lipstick_product.png"
  }
];

const Lips = () => {
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
          <div className="filter-section">
            <h3>AVAILABILITY <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label">
                <input type="checkbox" /> In stock only
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3>PRICE <ChevronDown size={16} /></h3>
            <div className="price-range">
              <input type="range" min="0" max="1399" style={{width: '100%', accentColor: '#000'}} />
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.9rem'}}>
                <span>₹ 0</span>
                <span>₹ 1399</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>CATEGORY <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label"><input type="checkbox" /> Matte Lipstick</label>
              <label className="filter-label"><input type="checkbox" /> Liquid Lipstick</label>
              <label className="filter-label"><input type="checkbox" /> Lip Gloss</label>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{lipProducts.length} Products Found</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="lips-grid">
            {lipProducts.map(product => (
              <div key={product.id} className="lip-card">
                <div className="lip-card-img">
                  {product.tag && <span className="tag-bestseller">{product.tag}</span>}
                  <img src={product.image} alt={product.name} />
                  {product.shades && <span className="shades-count">+{product.shades} Shades</span>}
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
