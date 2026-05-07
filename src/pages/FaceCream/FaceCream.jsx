import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Sparkles, Droplets } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import './FaceCream.css'; 

const FaceCream = () => {
  const { addToCart } = useCart();
  const { showNotification } = useNotifications();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSkinType, setActiveSkinType] = useState('All Skin Types');
  const [activeConcern, setActiveConcern] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 2000]);

  useEffect(() => {
    fetch(`API_BASE_URL_PLACEHOLDER/products?category=Face Cream')
      .then(res => res.json())
      .then(data => {
        setAllProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = allProducts;
    if (activeSkinType !== 'All Skin Types') {
      result = result.filter(p => p.skin_type === activeSkinType || !p.skin_type);
    }
    if (activeConcern !== 'All') {
      result = result.filter(p => p.concern === activeConcern || !p.concern);
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    setFilteredProducts(result);
  }, [activeSkinType, activeConcern, priceRange, allProducts]);

  const handleAddToCart = (product) => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || "/face_cream_product.png",
      rating: 4.9,
      reviews: 85
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
              <button className="advanced-btn" onClick={() => {
                setActiveSkinType('All Skin Types');
                setActiveConcern('All');
                setPriceRange([0, 2000]);
              }}>Clear All</button>
            </div>

            {/* Skin Type Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Type</h3>
                <ChevronDown size={18} />
              </div>
              <div className="filter-options brand-list">
                {[
                  { name: 'Oily Skin', icon: '💧' },
                  { name: 'Dry Skin', icon: '🌿' },
                  { name: 'Sensitive Skin', icon: '✨' },
                  { name: 'Combination', icon: '🔄' },
                  { name: 'All Skin Types', icon: '🌸' }
                ].map(type => (
                  <div 
                    key={type.name} 
                    className={`brand-item ${activeSkinType === type.name ? 'selected' : ''}`}
                    onClick={() => setActiveSkinType(type.name)}
                  >
                    <div className="brand-logo-name">
                      <span className="skin-icon">{type.icon}</span>
                      <span>{type.name}</span>
                    </div>
                    {activeSkinType === type.name && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Skin Concern Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Skin Concern</h3>
                <ChevronDown size={18} />
              </div>
              <div className="filter-options brand-list">
                {[
                  { name: 'Brightening', icon: '✨' },
                  { name: 'Hydration', icon: '💧' },
                  { name: 'Anti-Aging', icon: '⏳' },
                  { name: 'Acne Control', icon: '💧' },
                  { name: 'Dark Spots', icon: '⭐' }
                ].map(concern => (
                  <div 
                    key={concern.name} 
                    className={`brand-item ${activeConcern === concern.name ? 'selected' : ''}`}
                    onClick={() => setActiveConcern(concern.name)}
                  >
                    <div className="brand-logo-name">
                      <span>{concern.icon}</span>
                      <span>{concern.name}</span>
                    </div>
                    {activeConcern === concern.name && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Price</h3>
                <ChevronDown size={18} />
              </div>
              <div className="price-range-premium">
                <div className="price-inputs" style={{ marginBottom: '15px' }}>
                  <div className="price-input-box">
                    <input 
                      type="number" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    />
                  </div>
                  <span className="price-separator">—</span>
                  <div className="price-input-box">
                    <input 
                      type="number" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="3000" 
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  style={{ width: '100%', accentColor: '#ff6b81' }}
                />
              </div>
            </div>

            {/* Key Ingredients */}
            <div className="filter-section expanded">
              <div className="filter-section-header">
                <h3>Key Ingredients</h3>
                <ChevronDown size={18} />
              </div>
              <div className="size-grid">
                {['Vit C', 'Retinol', 'HA 2%', 'Niacinam.', 'Peptide', 'Squalane'].map(ing => (
                  <button key={ing} className="size-btn">{ing}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-header">
            <span className="products-count">{filteredProducts.length} Premium Face Creams Found</span>
          </div>

          <div className="grid container-grid lips-grid">
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#64748b' }}>Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '100px', color: '#64748b' }}>No products found matching your filters.</div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="lip-card">

                  <div className="lip-card-img">
                    {product.status === 'Out of Stock' && <span className="tag-bestseller" style={{ background: '#f43f5e' }}>OUT OF STOCK</span>}
                    <img src={product.image_url || "/face_cream_product.png"} alt={product.name} className="primary-img" />
                    {product.hover_image_url && <img src={product.hover_image_url} alt={product.name} className="hover-img" />}
                  </div>
                  <div className="lip-card-info">
                    <h3 className="lip-card-title">{product.name}</h3>
                    <div className="lip-card-rating">
                      <Star size={14} />
                      <span>4.9 (85)</span>
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
    </div>
  );
};

export default FaceCream;
