import React from 'react';
import { Star, ChevronDown } from 'lucide-react';
import './BodyWash.css'; 

const bodyWashProducts = [
  {
    id: 1,
    name: "EUCALYPTUS & MINT REVITALIZING WASH",
    price: 499,
    oldPrice: 599,
    discount: "16% Off",
    rating: 4.9,
    reviews: 450,
    tag: "BESTSELLER",
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  },
  {
    id: 2,
    name: "COCONUT MILK & HONEY NOURISHING GEL",
    price: 549,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 320,
    tag: "NEW LAUNCH",
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  },
  {
    id: 3,
    name: "SEA MINERALS & ALGAE DETOX WASH",
    price: 449,
    oldPrice: null,
    discount: null,
    rating: 4.7,
    reviews: 210,
    tag: "POPULAR",
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  },
  {
    id: 4,
    name: "LAVENDER & CHAMOMILE SLEEP SOAK",
    price: 599,
    oldPrice: 699,
    discount: "14% Off",
    rating: 4.9,
    reviews: 180,
    tag: null,
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  },
  {
    id: 5,
    name: "SANDALWOOD & AMBER LUXE CLEANSER",
    price: 799,
    oldPrice: 999,
    discount: "20% Off",
    rating: 5.0,
    reviews: 120,
    tag: "PREMIUM",
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  },
  {
    id: 6,
    name: "CITRUS BLOSSOM ENERGY BOOST",
    price: 399,
    oldPrice: 450,
    discount: "11% Off",
    rating: 4.6,
    reviews: 540,
    tag: null,
    image: "/body_wash_product.png",
    hoverImage: "/bodywash_hover_1.png"
  }
];

const BodyWash = () => {
  return (
    <div className="lips-page facewash-page bodywash-page-alt">
      <div className="lips-banner">
        <img 
          src="/body_wash_banner.png" 
          alt="Body Wash Banner"
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

            {/* Scent Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Scent</h3>
                <ChevronDown size={18} />
              </div>
              <div className="brand-search">
                <div className="search-input-wrapper">
                  <span className="search-icon1">🔍</span>
                  <input type="text" placeholder="Search scent ..." />
                </div>
              </div>
              <div className="filter-options brand-list">
                <div className="brand-item selected">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🌿</span>
                    <span>Minty</span>
                  </div>
                  <span className="brand-count">2</span>
                  <span className="check-mark">✓</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🥥</span>
                    <span>Coconut</span>
                  </div>
                  <span className="brand-count">1</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🌊</span>
                    <span>Marine</span>
                  </div>
                  <span className="brand-count">1</span>
                </div>
                <div className="brand-item">
                  <div className="brand-logo-name">
                    <span className="skin-icon">🪵</span>
                    <span>Woody</span>
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
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar active" style={{ height: '90%' }}></div>
                  <div className="bar active" style={{ height: '70%' }}></div>
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
                  <span>₹ 1,500</span>
                </div>
              </div>
            </div>

            {/* Benefit Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Benefit</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                <button className="size-btn selected">Hydrating</button>
                <button className="size-btn">Smoothing</button>
                <button className="size-btn">Detox</button>
                <button className="size-btn">Relaxing</button>
                <button className="size-btn">Energy</button>
                <button className="size-btn">Sensitive</button>
              </div>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{bodyWashProducts.length} Refreshing Body Washes Found</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="grid container-grid lips-grid">
            {bodyWashProducts.map(product => (
              <div key={product.id} className="lip-card">
                <div className="lip-card-img">
                  {product.tag && <span className="tag-bestseller">{product.tag}</span>}
                  <img src={product.image} alt={product.name} className="primary-img" />
                  {product.hoverImage && <img src={product.hoverImage} alt={product.name} className="hover-img" />}
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
                    {product.discount && <span className="discount">{product.discount}</span>}
                  </div>
                  <button className="add-btn">BUY NOW</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BodyWash;
