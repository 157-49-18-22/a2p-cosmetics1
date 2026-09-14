import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { Star, Filter, X, ChevronDown, Heart, ShoppingBag, Eye, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import { useNavigate } from 'react-router-dom';
import './AllProducts.css';
import SEO from '../../components/SEO/SEO';
import { calculateRatingFromLikes } from '../../utils/ratingUtils';

const fallbackAllProducts = [
  // Face Washes
  {
    id: 'ap-1',
    name: 'DEEP CLEANSING FOAMING FACE WASH',
    category: 'Face Wash',
    price: 449,
    oldPrice: 599,
    rating: 4.9,
    reviews: 1250,
    image: '/facewash_product.png',
    hoverImage: '/facewash_hover_1.png'
  },
  {
    id: 'ap-2',
    name: 'GENTLE HYDRATING CLEANSER',
    category: 'Face Wash',
    price: 399,
    oldPrice: 499,
    rating: 4.8,
    reviews: 840,
    image: '/facewash_product.png',
    hoverImage: '/facewash_hover_2.png'
  },
  {
    id: 'ap-3',
    name: 'ACNE CONTROL SALICYLIC FACE WASH',
    category: 'Face Wash',
    price: 499,
    oldPrice: 650,
    rating: 4.7,
    reviews: 2100,
    image: '/facewash_product.png',
    hoverImage: '/facewash_hover_1.png'
  },
  {
    id: 'ap-4',
    name: 'VITAMIN C BRIGHTENING FACE WASH',
    category: 'Face Wash',
    price: 549,
    oldPrice: 649,
    rating: 4.8,
    reviews: 1560,
    image: '/facewash_product.png',
    hoverImage: '/facewash_hover_2.png'
  },

  // Face Serums
  {
    id: 'ap-5',
    name: 'ADVANCED VITAMIN C 15% GLOW SERUM',
    category: 'Face Serum',
    price: 899,
    oldPrice: 1199,
    rating: 4.9,
    reviews: 1420,
    image: '/luxury_serum_hero.png',
    hoverImage: '/faceserum_hover_1.png'
  },
  {
    id: 'ap-6',
    name: 'HYALURONIC ACID 2% DEEP HYDRATION SERUM',
    category: 'Face Serum',
    price: 749,
    oldPrice: 949,
    rating: 4.8,
    reviews: 980,
    image: '/faceserum_hover_1.png',
    hoverImage: '/luxury_serum_hero.png'
  },
  {
    id: 'ap-7',
    name: 'NIACINAMIDE 10% BLEMISH REMOVAL SERUM',
    category: 'Face Serum',
    price: 799,
    oldPrice: 999,
    rating: 4.7,
    reviews: 1850,
    image: '/faceserum_hover_1.png',
    hoverImage: '/luxury_serum_hero.png'
  },

  // Face Creams
  {
    id: 'ap-8',
    name: 'ULTRA REPAIR HYDRATING NIGHT CREAM',
    category: 'Face Cream',
    price: 999,
    oldPrice: 1299,
    rating: 4.9,
    reviews: 760,
    image: '/face_cream_product.png',
    hoverImage: '/facecream_hover_1.png'
  },
  {
    id: 'ap-9',
    name: 'LIGHTWEIGHT DAY CREAM WITH SPF 30',
    category: 'Face Cream',
    price: 849,
    oldPrice: 1099,
    rating: 4.8,
    reviews: 1150,
    image: '/hydrating_cream_hero.png',
    hoverImage: '/facecream_hover_1.png'
  },

  // Body Washes
  {
    id: 'ap-10',
    name: 'REFRESHING CITRUS & BASIL BODY WASH',
    category: 'Body Wash',
    price: 499,
    oldPrice: 650,
    rating: 4.8,
    reviews: 620,
    image: '/body_wash_product.png',
    hoverImage: '/bodywash_hover_1.png'
  },
  {
    id: 'ap-11',
    name: 'DEEP MOISTURIZING SHEA BUTTER BODY WASH',
    category: 'Body Wash',
    price: 599,
    oldPrice: 799,
    rating: 4.9,
    reviews: 890,
    image: '/body_wash_product.png',
    hoverImage: '/bodywash_hover_1.png'
  }
];

const bannerVideos = [
  {
    id: 1,
    src: '/video1.mp4',
    title: 'ALL PRODUCTS',
    subtitle: 'Discover our complete skincare, beauty & luxury cosmetic range'
  },
  {
    id: 2,
    src: '/video2.mp4',
    title: 'PURE BOTANICAL LUXURY',
    subtitle: 'Formulated with organic botanicals for radiant, glowing skin'
  },
  {
    id: 3,
    src: '/cream.mp4',
    title: 'NOURISHING RITUALS',
    subtitle: 'Experience deep hydration & revitalizing skincare essentials'
  }
];

const fallbackWithStock = fallbackAllProducts.map(p => ({
  ...p,
  stock: p.id === 'ap-3' ? 0 : 15
}));

const AllProducts = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { showNotification } = useNotifications();

  const [products, setProducts] = useState(fallbackWithStock);
  const [filteredProducts, setFilteredProducts] = useState(fallbackWithStock);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('RELEVANCE');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Video Slider State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Auto slide video every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % bannerVideos.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % bannerVideos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + bannerVideos.length) % bannerVideos.length);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Face Wash',
            price: parseFloat(p.price) || 599,
            oldPrice: p.old_price ? parseFloat(p.old_price) : null,
            rating: p.rating || calculateRatingFromLikes(p.likes).rating,
            reviews: p.review_count || calculateRatingFromLikes(p.likes).reviews,
            image: p.image_url || '/facewash_product.png',
            hoverImage: p.hover_image_url || '/facewash_hover_1.png',
            stock: p.stock !== undefined ? parseInt(p.stock) : 10,
            likes: p.likes || 0
          }));
          setProducts(mapped);
          setFilteredProducts(mapped);
        }
      })
      .catch(err => console.log('Using default all products data'));

    // Fetch categories dynamically
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data.filter(c => c.status === 'Active')); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase().replace(/\s+/g, '') === selectedCategory.toLowerCase().replace(/\s+/g, ''));
    }

    // Filter Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    if (sortBy === 'PRICE: LOW TO HIGH') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE: HIGH TO LOW') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'RATING') {
      result.sort((a, b) => b.rating - a.rating);
    }

    // Always sort out of stock products to the very bottom
    result.sort((a, b) => {
      const aOutOfStock = a.stock === 0 ? 1 : 0;
      const bOutOfStock = b.stock === 0 ? 1 : 0;
      return aOutOfStock - bOutOfStock;
    });

    setFilteredProducts(result);
  }, [selectedCategory, priceRange, sortBy, products]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/facewash_product.png',
      rating: product.rating || 4.8
    });
    showNotification({
      type: 'cart',
      title: 'Added to Selection',
      message: `${product.name} added to cart.`,
      duration: 3000
    });
  };

  const handleAddToWishlist = (product) => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/facewash_product.png'
    });
    showNotification({
      type: 'wishlist',
      title: 'Added to Wishlist',
      message: `${product.name} added to wishlist.`,
      duration: 3000
    });
  };

  const handleLike = async (product, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/products/${product.id}/like`, { method: 'PUT' });
      const data = await res.json();
      if (data.likes !== undefined) {
        setProducts(products.map(p => p.id === product.id ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="all-products-page">
      <SEO 
        title="All Products - A2P Cosmetics | Organic Skincare Collection"
        description="Explore A2P Cosmetics' complete range of premium organic skincare products - Face Wash, Face Serum, Face Cream, Body Wash and more."
        keywords="a2p cosmetics, organic skincare, face wash, face serum, face cream, body wash, luxury skincare india"
      />
      {/* Hero Video Banner Slider (video1.mp4, video2.mp4, cream.mp4) */}
      <div className="ap-hero-banner">
        {bannerVideos.map((vid, idx) => (
          <div 
            key={vid.id} 
            className={`ap-video-slide ${idx === currentVideoIndex ? 'active' : ''}`}
          >
            <video
              src={vid.src}
              autoPlay
              muted
              loop
              playsInline
              className="ap-banner-video"
            />
          </div>
        ))}

        {/* Video Slider Navigation Arrows */}
        <button 
          className="banner-nav-btn prev-btn" 
          onClick={prevVideo}
          aria-label="Previous Video"
        >
          <ChevronLeft size={28} />
        </button>

        <button 
          className="banner-nav-btn next-btn" 
          onClick={nextVideo}
          aria-label="Next Video"
        >
          <ChevronRight size={28} />
        </button>

        {/* Video Slider Dot Indicators */}
        <div className="banner-dots">
          {bannerVideos.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentVideoIndex ? 'active' : ''}`}
              onClick={() => setCurrentVideoIndex(idx)}
              aria-label={`Go to video ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="ap-container container">
        {/* Mobile Filter Toggle */}
        <button className="mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
          <Filter size={18} />
          <span>Filters</span>
        </button>

        {/* Sidebar Filters */}
        <aside className={`ap-sidebar ${isFilterOpen ? 'mobile-open' : ''}`}>
          <div className="ap-filters-card">
            <div className="ap-filters-header">
              <h2>Filter Products</h2>
              <div className="ap-filter-actions">
                <button 
                  className="clear-all-btn"
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 3000]);
                  }}
                >
                  Clear All
                </button>
                <button className="mobile-close-btn" onClick={() => setIsFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="ap-filter-section">
              <div className="ap-section-header">
                <h3>Category</h3>
                <ChevronDown size={18} />
              </div>
              <div className="ap-filter-options">
                {['All', ...categories.map(c => c.name)].map(cat => (
                  <div 
                    key={cat} 
                    className={`ap-filter-item ${selectedCategory === cat ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="check">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="ap-filter-section">
              <div className="ap-section-header">
                <h3>Price Range</h3>
                <ChevronDown size={18} />
              </div>
              <div className="ap-price-box">
                <div className="price-inputs">
                  <span>₹{priceRange[0]}</span>
                  <span>-</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="3000" 
                  step="50"
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="ap-range-slider"
                />
              </div>
            </div>

          </div>
        </aside>

        {/* Products Main View */}
        <main className="ap-products-content">
          <div className="ap-controls-header">
            <span className="ap-count-text">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
            <div className="ap-sort-box">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="RELEVANCE">SORT BY: RELEVANCE</option>
                <option value="PRICE: LOW TO HIGH">PRICE: LOW TO HIGH</option>
                <option value="PRICE: HIGH TO LOW">PRICE: HIGH TO LOW</option>
                <option value="RATING">HIGHEST RATED</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="ap-no-products">
              <h3>No products found</h3>
              <p>Try clearing filters to see all available products.</p>
            </div>
          ) : (
            <div className="ap-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className={`ap-card ${product.stock === 0 ? 'ap-card-out-of-stock' : ''}`}>
                  <div className="ap-card-img-container">
                    <div className="likes-badge" onClick={(e) => handleLike(product, e)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0f172a' }}>
                      <ThumbsUp size={14} />
                      <span>{product.likes}</span>
                    </div>
                    <button 
                      className="ap-wishlist-btn" 
                      onClick={() => handleAddToWishlist(product)}
                      title="Add to Wishlist"
                    >
                      <Heart size={16} />
                    </button>
                    {product.stock === 0 && (
                      <span className="ap-out-of-stock-tag">OUT OF STOCK</span>
                    )}
                    <img src={product.image} alt={product.name} className="ap-card-img" />
                  </div>
                  <div className="ap-card-body">
                    <span className="ap-card-cat">{product.category}</span>
                    <h3 className="ap-card-title">{product.name}</h3>
                    <div className="ap-card-rating">
                      <Star size={14} fill="#eab308" color="#eab308" />
                      <span>{product.rating} ({product.reviews})</span>
                    </div>
                    <div className="ap-card-price-row">
                      <span className="ap-price">₹{product.price}.00</span>
                      {product.oldPrice && <span className="ap-old-price">₹{product.oldPrice}.00</span>}
                    </div>
                    <button 
                      className={`ap-cart-btn ${product.stock === 0 ? 'ap-out-of-stock-btn' : ''}`} 
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.stock === 0 ? 'OUT OF STOCK' : 'SHOP NOW'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllProducts;
