import React from 'react';
import { Star, ChevronDown, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_1.png"
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_2.png"
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_1.png"
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_2.png"
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_1.png"
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
    image: "/facewash_product.png",
    hoverImage: "/facewash_hover_2.png"
  }
];

const FaceWash = () => {
  const { addToCart } = useCart();
  const { showNotification } = useNotifications();

  const handleAddToCart = (product) => {
    addToCart(product);
    showNotification({
      type: 'cart',
      title: 'Added to Selection',
      message: `${product.name} has been added to your cart successfully.`,
      duration: 3500
    });
  };

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
        <aside className="lips-sidebar filters-sidebar">
          <div className="filters-card">
            <div className="filters-header">
              <h2>Filter</h2>
              <button className="advanced-btn">Clear All</button>
            </div>

            {/* Skin Type Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Type</h3>
                <ChevronDown size={18} />
              </div>
              <div className="brand-search">
                <div className="search-input-wrapper">
                  <span className="search-icon1">🔍</span>
                  <input type="text" placeholder="Search skin type ..." />
                </div>
              </div>
              <div className="filter-options brand-list">
                <div className="brand-item selected">
                  <div className="brand-logo-name">
                    <span className="skin-icon">💧</span>
                    <span>Oily Skin</span>
                  </div>
                  <span className="brand-count">3</span>
                  <span className="check-mark">✓</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🌿</span>
                    <span>Dry Skin</span>
                  </div>
                  <span className="brand-count">2</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">✨</span>
                    <span>Sensitive Skin</span>
                  </div>
                  <span className="brand-count">2</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🔄</span>
                    <span>Combination</span>
                  </div>
                  <span className="brand-count">4</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🌸</span>
                    <span>All Skin Types</span>
                  </div>
                  <span className="brand-count">6</span>
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
                  {/* Visual histogram bars mockup */}
                  <div className="bar" style={{ height: '20%' }}></div>
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar" style={{ height: '70%' }}></div>
                  <div className="bar active" style={{ height: '90%' }}></div>
                  <div className="bar active" style={{ height: '100%' }}></div>
                  <div className="bar active" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '50%' }}></div>
                  <div className="bar" style={{ height: '30%' }}></div>
                </div>
                <div className="range-slider-wrapper">
                  <div className="range-track"></div>
                  <div className="range-thumb left"></div>
                  <div className="range-thumb right"></div>
                </div>
                <div className="price-range-labels">
                  <span>₹ 0</span>
                  <span>₹ 1,000</span>
                </div>
                <div className="price-inputs">
                  <div className="price-input-box">
                    <input type="text" defaultValue="₹ 0" />
                  </div>
                  <span className="price-separator">—</span>
                  <div className="price-input-box">
                    <input type="text" defaultValue="₹ 1,000" />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Ingredients Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Key Ingredients</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                <button className="size-btn selected">Salicylic</button>
                <button className="size-btn">Charcoal</button>
                <button className="size-btn">Vit C</button>
                <button className="size-btn">Tea Tree</button>
                <button className="size-btn">Neem</button>
                <button className="size-btn">Aloe</button>
                <button className="size-btn">Foam</button>
                <button className="size-btn">Turmeric</button>
              </div>
            </div>

            {/* Skin Concern Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Concern</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                <button className="size-btn">Acne</button>
                <button className="size-btn selected">Glow</button>
                <button className="size-btn">Pores</button>
                <button className="size-btn">Hydrate</button>
                <button className="size-btn">Detox</button>
                <button className="size-btn">Brighten</button>
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
                  <img src={product.image} alt={product.name} className="primary-img" />
                  {product.hoverImage && <img src={product.hoverImage} alt={product.name} className="hover-img" />}
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
                  <button className="add-btn" onClick={() => handleAddToCart(product)}>ADD TO CART</button>
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
