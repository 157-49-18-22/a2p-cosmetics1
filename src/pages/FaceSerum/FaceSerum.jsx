import React from 'react';
import { Star, ChevronDown, CheckCircle, Sparkles, Droplets } from 'lucide-react';
import './FaceSerum.css'; // Dedicated Serum styles

const serumProducts = [
  {
    id: 1,
    name: "20% VITAMIN C + VITAMIN E GLOW SERUM",
    price: 699,
    oldPrice: 899,
    discount: "22% Off",
    rating: 4.9,
    reviews: 3200,
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "HYALURONIC ACID 2% + B5 HYDRATION SERUM",
    price: 549,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 1540,
    tag: "POPULAR",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "RETINOL 0.5% IN SQUALANE AGE REVERSE",
    price: 799,
    oldPrice: 999,
    discount: "20% Off",
    rating: 4.7,
    reviews: 2100,
    tag: "NEXT LEVEL",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "NIACINAMIDE 10% + ZINC 1% OIL CONTROL",
    price: 499,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 4500,
    tag: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "SALICYLIC ACID 2% ANIT-ACNE SOLUTION",
    price: 449,
    oldPrice: null,
    discount: null,
    rating: 4.6,
    reviews: 1230,
    tag: null,
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "MULTIPEPTIDE COPPER REPAIR SERUM",
    price: 1299,
    oldPrice: 1599,
    discount: "18% Off",
    rating: 5.0,
    reviews: 450,
    tag: "PREMIUM",
    image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop"
  }
];

const FaceSerum = () => {
  return (
    <div className="lips-page serum-page">
      {/* Premium Banner */}
      <div className="lips-banner">
        <video
          src="/video2.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="banner-video"
        />
      </div>

      {/* Science Highlights */}
      <section style={{ background: '#000', color: '#fff', padding: '3rem 5%', display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <Sparkles size={32} color="#f0bada" />
          <h4 style={{ marginTop: '10px' }}>Targeted Action</h4>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Treats specific skin concerns</p>
        </div>
        <div>
          <Droplets size={32} color="#f0bada" />
          <h4 style={{ marginTop: '10px' }}>High Potency</h4>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Concentrated active ingredients</p>
        </div>
        <div>
          <CheckCircle size={32} color="#f0bada" />
          <h4 style={{ marginTop: '10px' }}>Derm Approved</h4>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Clinically tested formulas</p>
        </div>
      </section>

      <div className="lips-container" style={{ marginTop: '4rem' }}>
        <aside className="lips-sidebar filters-sidebar">
          <div className="filters-card">
            <div className="filters-header">
              <h2>Filter</h2>
              <button className="advanced-btn">Clear All</button>
            </div>

            {/* Skin Concern Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Concern</h3>
                <ChevronDown size={18} />
              </div>
              <div className="brand-search">
                <div className="search-input-wrapper">
                  <span className="search-icon1">🔍</span>
                  <input type="text" placeholder="Search concern ..." />
                </div>
              </div>
              <div className="filter-options brand-list">
                <div className="brand-item selected">
                  <div className="brand-logo-name">
                    <Sparkles size={16} color="#00bcd4" />
                    <span>Brightening</span>
                  </div>
                  <span className="brand-count">2</span>
                  <span className="check-mark">✓</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <Droplets size={16} color="#aaa" />
                    <span>Hydration</span>
                  </div>
                  <span className="brand-count">2</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">⏳</span>
                    <span>Anti-Aging</span>
                  </div>
                  <span className="brand-count">2</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">💧</span>
                    <span>Acne Control</span>
                  </div>
                  <span className="brand-count">1</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">⭐</span>
                    <span>Dark Spots</span>
                  </div>
                  <span className="brand-count">1</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Price</h3>
                <ChevronDown size={18} />
              </div>
              <div className="price-range-premium">
                <div className="price-histogram">
                  <div className="bar" style={{ height: '30%' }}></div>
                  <div className="bar active" style={{ height: '80%' }}></div>
                  <div className="bar active" style={{ height: '100%' }}></div>
                  <div className="bar active" style={{ height: '70%' }}></div>
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '20%' }}></div>
                </div>
                <div className="range-slider-wrapper">
                  <div className="range-track"></div>
                  <div className="range-thumb left"></div>
                  <div className="range-thumb right"></div>
                </div>
                <div className="price-range-labels">
                  <span>₹ 0</span>
                  <span>₹ 2,000</span>
                </div>
                <div className="price-inputs">
                  <div className="price-input-box">
                    <input type="text" defaultValue="₹ 0" />
                  </div>
                  <span className="price-separator">—</span>
                  <div className="price-input-box">
                    <input type="text" defaultValue="₹ 2,000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Ingredients */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Key Ingredients</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                <button className="size-btn selected">Vit C</button>
                <button className="size-btn">Retinol</button>
                <button className="size-btn">HA 2%</button>
                <button className="size-btn">Niacinam.</button>
                <button className="size-btn">Peptide</button>
                <button className="size-btn">Squalane</button>
              </div>
            </div>

            {/* Skin Type */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Type</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                <button className="size-btn">Oily</button>
                <button className="size-btn selected">Dry</button>
                <button className="size-btn">Sensitive</button>
                <button className="size-btn">All Types</button>
              </div>
            </div>

          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{serumProducts.length} Premium Serums</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: POPULARITY</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>NEW ARRIVALS</option>
              </select>
            </div>
          </div>

          <div className="lips-grid">
            {serumProducts.map(product => (
              <div key={product.id} className="lip-card">
                <div className="lip-card-img">
                  {product.tag && <span className="tag-bestseller" style={{ background: '#ff0055' }}>{product.tag}</span>}
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="lip-card-info">
                  <h3 className="lip-card-title">{product.name}</h3>
                  <div className="lip-card-rating">
                    <Star size={14} fill="#000" />
                    <span>{product.rating} ({product.reviews})</span>
                  </div>
                  <div className="lip-card-price">
                    <span className="current-price">Rs. {product.price}.00</span>
                    {product.oldPrice && <span className="old-price">Rs. {product.oldPrice}</span>}
                  </div>
                  <button className="add-btn" style={{ background: '#111' }}>BUY NOW</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Serum FAQ / Guide Section */}
      <section style={{ padding: '5rem 5%', background: '#fff1f6' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <img src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop" alt="Serum Usage" style={{ width: '100%', borderRadius: '20px' }} />
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>How to Use Your Serum?</h2>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Serums are the heavy hitters of your skincare routine. For best results, apply 2-3 drops after cleansing but before moisturizing.
              Gently press into the skin until fully absorbed. Use Vitamin C in the morning for protection and Retinol at night for repair.
            </p>
            <button className="add-btn" style={{ maxWidth: '200px' }}>FIND MY ROUTINE</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaceSerum;
