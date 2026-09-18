import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Eye, ChevronLeft, ChevronRight, 
  Tag, Clock, Star, ArrowRight, Check, Sparkles,
  Award, RotateCcw, CreditCard, ThumbsUp
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import { Link, useNavigate } from 'react-router-dom';
import './NewArrivals.css';
import { calculateRatingFromLikes } from '../../utils/ratingUtils';

const defaultProductsData = {
  faceWash: [
    {
      id: 'fw-1',
      name: 'Pichwai Lotus Garden Cleanser',
      category: 'Face Wash',
      price: 699,
      oldPrice: 899,
      rating: 4.9,
      reviews: 84,
      viewsCount: 9,
      likes: 12,
      image: '/luxury_facewash_pump.png'
    },
    {
      id: 'fw-2',
      name: 'Deep Cleansing Foaming Face Wash',
      category: 'Face Wash',
      price: 449,
      oldPrice: 599,
      rating: 4.8,
      reviews: 120,
      viewsCount: 14,
      likes: 8,
      image: '/facewash_product.png'
    },
    {
      id: 'fw-3',
      name: 'Vit C Radiance Boosting Cleanser',
      category: 'Face Wash',
      price: 549,
      oldPrice: 699,
      rating: 4.8,
      reviews: 95,
      viewsCount: 12,
      likes: 15,
      image: '/facewash_product.png'
    },
    {
      id: 'fw-4',
      name: 'Tea Tree Purifying Face Wash',
      category: 'Face Wash',
      price: 389,
      oldPrice: 450,
      rating: 4.7,
      reviews: 64,
      viewsCount: 5,
      likes: 4,
      image: '/luxury_facewash_pump.png',
      stock: 0
    },
    {
      id: 'fw-5',
      name: 'Gentle Rose Petal Foam Wash',
      category: 'Face Wash',
      price: 620,
      oldPrice: 750,
      rating: 4.9,
      reviews: 38,
      viewsCount: 18,
      likes: 22,
      image: '/facewash_product.png'
    }
  ],
  faceSerum: [
    {
      id: 'fs-1',
      name: 'Pichwai Blossom Hydration Drops',
      category: 'Face Serum',
      price: 1299,
      oldPrice: 1599,
      rating: 4.9,
      reviews: 112,
      viewsCount: 25,
      likes: 30,
      image: '/luxury_serum_dropper.png'
    },
    {
      id: 'fs-2',
      name: 'Advanced Vit C 15% Glow Serum',
      category: 'Face Serum',
      price: 899,
      oldPrice: 1199,
      rating: 4.9,
      reviews: 180,
      viewsCount: 31,
      likes: 45,
      image: '/luxury_serum_hero.png'
    },
    {
      id: 'fs-3',
      name: 'Hyaluronic Water Surge Elixir',
      category: 'Face Serum',
      price: 1199,
      oldPrice: 1399,
      rating: 4.8,
      reviews: 78,
      viewsCount: 19,
      likes: 20,
      image: '/faceserum_hover_1.png'
    },
    {
      id: 'fs-4',
      name: 'Niacinamide 10% Blemish Serum',
      category: 'Face Serum',
      price: 799,
      oldPrice: 999,
      rating: 4.7,
      reviews: 140,
      viewsCount: 8,
      likes: 10,
      image: '/luxury_serum_dropper.png'
    },
    {
      id: 'fs-5',
      name: 'Retinol Youth Renewal Serum',
      category: 'Face Serum',
      price: 1599,
      oldPrice: 1899,
      rating: 4.9,
      reviews: 55,
      viewsCount: 22,
      likes: 28,
      image: '/luxury_serum_hero.png'
    }
  ],
  faceCream: [
    {
      id: 'fc-1',
      name: 'Crimson Red Shree Yantra Night Cream',
      category: 'Face Cream',
      price: 1499,
      oldPrice: 1899,
      rating: 4.9,
      reviews: 65,
      viewsCount: 17,
      likes: 24,
      image: '/face_cream_product.png'
    },
    {
      id: 'fc-2',
      name: 'Deep Nourishing Night Repair Cream',
      category: 'Face Cream',
      price: 1349,
      oldPrice: 1699,
      rating: 4.9,
      reviews: 130,
      viewsCount: 22,
      likes: 35,
      image: '/hydrating_cream_hero.png'
    },
    {
      id: 'fc-3',
      name: 'Ultra Repair Hydrating Day Cream',
      category: 'Face Cream',
      price: 999,
      oldPrice: 1299,
      rating: 4.8,
      reviews: 88,
      viewsCount: 11,
      likes: 18,
      image: '/face_cream_product.png'
    },
    {
      id: 'fc-4',
      name: 'Velvet Radiance Peptide Moisturizer',
      category: 'Face Cream',
      price: 1149,
      oldPrice: 1450,
      rating: 4.8,
      reviews: 52,
      viewsCount: 6,
      likes: 9,
      image: '/hydrating_cream_hero.png'
    },
    {
      id: 'fc-5',
      name: 'Saffron & Gold Radiance Cream',
      category: 'Face Cream',
      price: 1799,
      oldPrice: 2100,
      rating: 5.0,
      reviews: 41,
      viewsCount: 29,
      likes: 32,
      image: '/face_cream_product.png'
    }
  ],
  bodyWash: [
    {
      id: 'bw-1',
      name: 'Yellow Gold Shree Yantra Body Wash',
      category: 'Body Wash',
      price: 799,
      oldPrice: 999,
      rating: 4.8,
      reviews: 94,
      viewsCount: 17,
      likes: 21,
      image: '/body_wash_product.png'
    },
    {
      id: 'bw-2',
      name: 'Refreshing Citrus & Basil Body Wash',
      category: 'Body Wash',
      price: 499,
      oldPrice: 650,
      rating: 4.7,
      reviews: 110,
      viewsCount: 15,
      likes: 19,
      image: '/body_wash_product.png'
    },
    {
      id: 'bw-3',
      name: 'Velvet Soft Botanical Body Wash',
      category: 'Body Wash',
      price: 849,
      oldPrice: 1050,
      rating: 4.8,
      reviews: 56,
      viewsCount: 7,
      likes: 11,
      image: '/body_wash_product.png'
    },
    {
      id: 'bw-4',
      name: 'Deep Moisturizing Shea Shower Gel',
      category: 'Body Wash',
      price: 599,
      oldPrice: 799,
      rating: 4.9,
      reviews: 82,
      viewsCount: 12,
      likes: 14,
      image: '/body_wash_product.png'
    },
    {
      id: 'bw-5',
      name: 'Eucalyptus Mint Purifying Wash',
      category: 'Body Wash',
      price: 649,
      oldPrice: 799,
      rating: 4.8,
      reviews: 33,
      viewsCount: 16,
      likes: 16,
      image: '/body_wash_product.png'
    }
  ]
};

// Reusable Horizontal Row Component with Row-Level Navigation Arrows
const HorizontalProductRow = ({ products, handleAddToCart, handleAddToWishlist, handleLike }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = rowRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        current.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="product-row-wrapper">
      {/* Left Row Scroll Button */}
      {canScrollLeft && (
        <button 
          className="row-nav-btn left-btn" 
          onClick={() => scroll('left')}
          aria-label="Scroll Left"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Single Horizontal Row (No Grid, 1 Row Only) */}
      <div className="na-single-horizontal-row" ref={rowRef}>
        {products.map(product => (
          <div key={product.id} className={`na-product-card horizontal-card ${product.stock === 0 ? 'na-card-out-of-stock' : ''}`}>
            <div className="na-card-img-wrapper">
              <div className="likes-badge" onClick={(e) => handleLike(product, e)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#0f172a' }}>
                <ThumbsUp size={14} />
                <span>{product.likes}</span>
              </div>
              <button 
                className="wishlist-overlay-btn" 
                onClick={(e) => handleAddToWishlist(product, e)}
                title="Add to Wishlist"
              >
                <Heart size={16} />
              </button>
              {product.stock === 0 && (
                <span className="na-out-of-stock-tag">OUT OF STOCK</span>
              )}
              <img src={product.image} alt={product.name} className="na-card-primary-img" />
            </div>
            <div className="na-card-details">
              <h3 className="na-card-title">{product.name}</h3>
              <span className="na-card-category">{product.category}</span>
              <div className="na-card-price-row">
                <span className="na-card-price">₹{product.price}.00</span>
                {product.oldPrice && <span className="na-card-old-price">₹{product.oldPrice}.00</span>}
              </div>
              <button
                className={`na-add-cart-btn ${product.stock === 0 ? 'na-out-of-stock-btn' : ''}`}
                onClick={(e) => { if (product.stock !== 0) { e.stopPropagation(); navigate(`/product/${product.id}`); } }}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'OUT OF STOCK' : 'SHOP NOW'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Row Scroll Button */}
      {canScrollRight && (
        <button 
          className="row-nav-btn right-btn" 
          onClick={() => scroll('right')}
          aria-label="Scroll Right"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
};

const NewArrivals = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { showNotification } = useNotifications();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [emailInput, setEmailInput] = useState('');

  // Countdown timer for spotlight offer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 11,
    minutes: 23,
    seconds: 40
  });

  const [backendProducts, setBackendProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  // Initialize likes from localStorage so they persist on refresh
  const [localLikes, setLocalLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('product_likes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    // Fetch real products so wishlist tracking works
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBackendProducts(data);
      })
      .catch(err => console.error('Error fetching new arrivals products:', err));

    // Fetch categories dynamically
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDbCategories(data.filter(c => c.status === 'Active')); })
      .catch(() => {});
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Map backend products to categories, fallback to default data
  const mergeProducts = (catFilter, defaultList) => {
    const dbProducts = backendProducts.filter(p => p.category?.toLowerCase().includes(catFilter));
    // Use DB products if available, otherwise use defaults
    const combined = [...dbProducts];
    
    // Fill up to 5 items using defaults if needed
    let i = 0;
    while (combined.length < 5 && i < defaultList.length) {
      if (!combined.some(p => p.name === defaultList[i].name)) {
        combined.push(defaultList[i]);
      }
      i++;
    }
    
    // Normalize format
    return combined.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category || catFilter,
      price: parseFloat(p.price) || 0,
      oldPrice: p.old_price ? parseFloat(p.old_price) : (p.oldPrice || null),
      rating: p.rating || calculateRatingFromLikes(localLikes[p.id] !== undefined ? localLikes[p.id] : (p.likes || 0)).rating,
      viewsCount: p.viewsCount || Math.floor(Math.random() * 50) + 10,
      image: p.image_url || p.image || '/luxury_facewash_pump.png',
      stock: p.stock !== undefined ? parseInt(p.stock) : 10,
      likes: (localLikes[p.id] !== undefined ? localLikes[p.id] : (p.likes || 0))
    }));
  };

  const handleLike = async (product, e) => {
    e.stopPropagation();
    const currentLikes = localLikes[product.id] !== undefined ? localLikes[product.id] : (product.likes || 0);
    const newLikes = currentLikes + 1;

    // Instantly update UI + persist in localStorage (works for ALL products)
    const updated = { ...localLikes, [product.id]: newLikes };
    setLocalLikes(updated);
    try { localStorage.setItem('product_likes', JSON.stringify(updated)); } catch(e) {}

    // Also persist in DB for real products (numeric IDs)
    if (typeof product.id === 'number' || (typeof product.id === 'string' && !isNaN(parseInt(product.id)))) {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${product.id}/like`, { method: 'PUT' });
        const data = await res.json();
        if (data.likes !== undefined) {
          const dbUpdated = { ...updated, [product.id]: data.likes };
          setLocalLikes(dbUpdated);
          try { localStorage.setItem('product_likes', JSON.stringify(dbUpdated)); } catch(e) {}
        }
      } catch (err) { /* silently ignore */ }
    }
  };

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();
    const success = await addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/luxury_facewash_pump.png',
      rating: product.rating || 4.8
    });
    if (!success) return;

    showNotification({
      type: 'cart',
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`,
      duration: 3000
    });
  };

  const handleAddToWishlist = async (product, e) => {
    if (e) e.stopPropagation();
    const success = await addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/luxury_facewash_pump.png'
    });
    if (!success) return;

    showNotification({
      type: 'wishlist',
      title: 'Saved to Wishlist',
      message: `${product.name} saved to your wishlist.`,
      duration: 3000
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      showNotification({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        duration: 3000
      });
      return;
    }
    showNotification({
      type: 'success',
      title: 'Subscribed Successfully!',
      message: 'Thank you for subscribing to our luxury updates.',
      duration: 4000
    });
    setEmailInput('');
  };

  // Build dynamic category product lists
  const categoryProducts = dbCategories.length > 0
    ? dbCategories.map(cat => ({
        cat,
        products: mergeProducts(cat.name.toLowerCase(), [])
      }))
    : [
        { cat: { name: 'Face Wash', slug: 'face-wash' }, products: mergeProducts('face wash', defaultProductsData.faceWash) },
        { cat: { name: 'Face Serum', slug: 'face-serum' }, products: mergeProducts('serum', defaultProductsData.faceSerum) },
        { cat: { name: 'Face Cream', slug: 'face-cream' }, products: mergeProducts('cream', defaultProductsData.faceCream) },
        { cat: { name: 'Body Wash', slug: 'body-wash' }, products: mergeProducts('body wash', defaultProductsData.bodyWash) }
      ];

  const allProductsList = categoryProducts.flatMap(c => c.products);

  const dynamicTabs = ['ALL', ...categoryProducts.map(c => c.cat.name.toUpperCase())];

  const mainShowcaseProducts = activeCategory === 'ALL'
    ? allProductsList
    : (categoryProducts.find(c => c.cat.name.toUpperCase() === activeCategory)?.products || allProductsList);

  return (
    <div className="new-arrivals-page">
      {/* 1. Hero Section */}
      <section className="na-hero-section">
        <div className="na-hero-container">
          <span className="na-hero-eyebrow">SPRING / SUMMER 2026 COLLECTION</span>
          <h1 className="na-main-title">Discover Fresh Styles</h1>
          <p className="na-subtitle">
            Explore our latest collection in skincare, luxury cosmetics, and pure beauty essentials fresh arrivals for you and your space
          </p>
          <div className="na-hero-badges">
            <div className="na-badge-item">
              <Tag size={16} className="badge-icon" />
              <span>Exclusive Designs</span>
            </div>
            <span className="badge-divider">•</span>
            <div className="na-badge-item">
              <Clock size={16} className="badge-icon" />
              <span>Limited Time Offers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Spotlight Limited Time Offer Box */}
      <section className="na-spotlight-section container">
        <div className="spotlight-card">
          <div className="spotlight-img-box">
            <img src="/regal_blossom_box.png" alt="The Regal Blossom Box" className="spotlight-img" />
          </div>

          <div className="spotlight-content-box">
            <span className="spotlight-tag">LIMITED TIME OFFER</span>

            <div className="countdown-widget">
              <div className="timer-block">
                <span className="timer-num">{timeLeft.days}</span>
                <span className="timer-label">DAYS</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-block">
                <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="timer-label">HOURS</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-block">
                <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="timer-label">MIN</span>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-block">
                <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="timer-label">SEC</span>
              </div>
            </div>

            <h2 className="spotlight-title">The Regal Blossom Box</h2>
            <p className="spotlight-desc">
              Experience premium quality and exceptional skincare with this must-have piece from our latest collection.
            </p>

            <div className="spotlight-price-row">
              <span className="current-price">₹2399.20</span>
              <span className="old-price">₹2999.00</span>
            </div>

            <div className="spotlight-actions">
              <button 
                className="btn-dark-action"
                onClick={() => navigate('/product/fw-1')}
              >
                SHOP NOW
              </button>

              <button 
                className="btn-outline-action"
                onClick={() => handleAddToWishlist({
                  id: 'spotlight-regal-box',
                  name: 'The Regal Blossom Box',
                  price: 2399.20,
                  image: '/regal_blossom_box.png'
                })}
              >
                <Heart size={16} />
                <span>Add to Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS Showcase (Single Horizontal Scrollable Row) */}
      <section className="na-main-showcase container">
        <div className="na-section-header">
          <h2 className="na-title-bold">NEW ARRIVALS</h2>

          <div className="na-category-tabs-wrapper">
            <div className="na-category-tabs">
              {dynamicTabs.map(tab => (
                <button
                  key={tab}
                  className={`tab-link ${activeCategory === tab ? 'active' : ''}`}
                  onClick={() => setActiveCategory(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <p className="na-intro-text">
            Browse our complete selection of new arrivals, featuring the latest trends and must-have pieces for the season.
          </p>
        </div>

        {/* Horizontal Scroll Row with Left & Right Row Navigation Arrows */}
        <HorizontalProductRow 
          products={mainShowcaseProducts} 
          handleAddToCart={handleAddToCart} 
          handleAddToWishlist={handleAddToWishlist}
          handleLike={handleLike}
        />
      </section>

      {/* 4. DYNAMIC CATEGORY SECTIONS */}
      <section className="na-category-sections container">
        {categoryProducts.map(({ cat, products: catProds }) => (
          <div key={cat.slug || cat.name} className="na-cat-section">
            <div className="na-cat-section-header">
              <h2 className="cat-section-title">{cat.name}</h2>
              <Link to="/all-products" className="view-all-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <HorizontalProductRow 
              products={catProds.length > 0 ? catProds : []} 
              handleAddToCart={handleAddToCart} 
              handleAddToWishlist={handleAddToWishlist}
              handleLike={handleLike}
            />
          </div>
        ))}
      </section>

      {/* 5. TRUST BADGES + VIEW ALL COLLECTIONS + NEWSLETTER (IMAGE 3) */}
      <section className="na-trust-newsletter-section container">
        <div className="trust-badges-container">
          <div className="trust-item">
            <div className="trust-icon-box">
              <Award size={26} />
            </div>
            <div className="trust-text">
              <h4>Quality Guarantee</h4>
              <p>Crafted with premium materials</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <RotateCcw size={26} />
            </div>
            <div className="trust-text">
              <h4>Easy Returns</h4>
              <p>Easy 30-day return policy</p>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box">
              <CreditCard size={26} />
            </div>
            <div className="trust-text">
              <h4>Secure Payment</h4>
              <p>Multiple payment options</p>
            </div>
          </div>
        </div>

        <div className="view-collections-wrapper">
          <Link to="/all-products" className="btn-view-all-collections">
            View All Collections <ArrowRight size={16} />
          </Link>
        </div>

        <div className="newsletter-card-dark">
          <h2 className="newsletter-title">Stay Updated</h2>
          <p className="newsletter-subtitle">
            Subscribe to our newsletter for exclusive offers and early access to new arrivals
          </p>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email address" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-submit-btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;
