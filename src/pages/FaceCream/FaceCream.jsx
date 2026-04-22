import React from 'react';
import { Star, ChevronDown, Sparkles, Droplets } from 'lucide-react';
import './FaceCream.css'; 

const faceCreamProducts = [
  {
    id: 1,
    name: "REJUVENATING OVERNIGHT ELIXIR",
    price: 1299,
    oldPrice: 1599,
    discount: "18% Off",
    rating: 4.9,
    reviews: 850,
    tag: "BESTSELLER",
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  },
  {
    id: 2,
    name: "HYDRA-GLOW 24H MOISTURIZER",
    price: 899,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviews: 1200,
    tag: "NEW",
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  },
  {
    id: 3,
    name: "VITAMINC C RADIANCE CREAM",
    price: 949,
    oldPrice: 1100,
    discount: "14% Off",
    rating: 4.7,
    reviews: 650,
    tag: "TOP RATED",
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  },
  {
    id: 4,
    name: "CALMING CICA REPAIR BALM",
    price: 749,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviews: 320,
    tag: null,
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  },
  {
    id: 5,
    name: "GOLD INFUSED FIRMING CREAM",
    price: 2499,
    oldPrice: 2999,
    discount: "16% Off",
    rating: 5.0,
    reviews: 150,
    tag: "PREMIUM",
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  },
  {
    id: 6,
    name: "LIGHTWEIGHT DAY DEFENSE",
    price: 649,
    oldPrice: 799,
    discount: "15% Off",
    rating: 4.6,
    reviews: 980,
    tag: null,
    image: "/face_cream_product.png",
    hoverImage: "/facecream_hover_1.png"
  }
];

const FaceCream = () => {
  return (
    <div className="lips-page facewash-page facecream-page-alt">
      <div className="lips-banner">
        <video 
          src="/cream.mp4" 
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

            {/* Skin Type Section - Using FaceWash style */}
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
                  <div className="bar" style={{ height: '20%' }}></div>
                  <div className="bar" style={{ height: '40%' }}></div>
                  <div className="bar active" style={{ height: '70%' }}></div>
                  <div className="bar active" style={{ height: '90%' }}></div>
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
                  <span>₹ 3,000</span>
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
                <button className="size-btn selected">Retinol</button>
                <button className="size-btn">Hyaluronic</button>
                <button className="size-btn">Vit C</button>
                <button className="size-btn">Peptides</button>
                <button className="size-btn">Cica</button>
                <button className="size-btn">Gold</button>
              </div>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{faceCreamProducts.length} Premium Face Creams Found</span>
            <div className="sort-dropdown">
              <select>
                <option>SORT BY: RELEVANCE</option>
                <option>PRICE: LOW TO HIGH</option>
                <option>PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="grid container-grid lips-grid">
            {faceCreamProducts.map(product => (
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

export default FaceCream;
