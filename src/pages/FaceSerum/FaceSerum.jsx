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
        <aside className="lips-sidebar">
          <div className="filter-section">
            <h3>CONCERN <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label"><input type="checkbox" /> Brightening</label>
              <label className="filter-label"><input type="checkbox" /> Anti-Aging</label>
              <label className="filter-label"><input type="checkbox" /> Acne Control</label>
              <label className="filter-label"><input type="checkbox" /> Hydration</label>
            </div>
          </div>

          <div className="filter-section">
            <h3>INGREDIENT <ChevronDown size={16} /></h3>
            <div className="filter-options">
              <label className="filter-label"><input type="checkbox" /> Vitamin C</label>
              <label className="filter-label"><input type="checkbox" /> Retinol</label>
              <label className="filter-label"><input type="checkbox" /> Hyaluronic Acid</label>
              <label className="filter-label"><input type="checkbox" /> Niacinamide</label>
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
