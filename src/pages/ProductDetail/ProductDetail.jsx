import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingBag, ArrowRight, Check, 
  RotateCcw, ShieldCheck, Mail, Facebook, Twitter, Instagram, Plus, Minus, X, RefreshCw
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import { calculateRatingFromLikes } from '../../utils/ratingUtils';
import ProductRating from '../../components/ProductRating/ProductRating';
import './ProductDetail.css';
import SEO from '../../components/SEO/SEO';

// Tracking & Analytics Imports
import { trackUserActivity } from '../../utils/track';
import { logGAEvent } from '../../utils/analytics';


// Master list of all products to resolve details locally
const MASTER_PRODUCTS = [
  {
    id: 'ap-1',
    name: 'DEEP CLEANSING FOAMING FACE WASH',
    category: 'Face Wash',
    price: 449,
    oldPrice: 599,
    rating: 4.9,
    reviews: 1250,
    image: '/facewash_product.png',
    images: ['/facewash_product.png', '/facewash_hover_1.png', '/facewash_hover_2.png'],
    description: 'Elevate your daily cleansing ritual with our Deep Cleansing Foaming Face Wash. Specially formulated with natural botanicals, it gently lifts impurities, oil, and makeup while retaining skin moisture. Perfect for a fresh, bright, and rejuvenated complexion.',
    details: 'Volume: 150ml | Skin Type: All Skin Types | Key Ingredients: Aloe Vera, Neem Extract, Tea Tree Oil.',
    shipping: 'Standard shipping: 3-5 business days. Express shipping options available at checkout. Easy 30-day returns.'
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
    images: ['/facewash_product.png', '/facewash_hover_2.png', '/facewash_hover_1.png'],
    description: 'A creamy, low-foaming cleanser that deeply hydrates while removing daily dirt. Infused with skin-identical ceramides and hyaluronic acid to lock in essential moisture.',
    details: 'Volume: 120ml | Skin Type: Dry, Sensitive | Key Ingredients: Ceramides, Hyaluronic Acid, Oatmeal.',
    shipping: 'Free delivery on orders above ₹499. Easy 30-day hassle-free return policy.'
  },
  {
    id: 'ap-5',
    name: 'ADVANCED VITAMIN C 15% GLOW SERUM',
    category: 'Face Serum',
    price: 899,
    oldPrice: 1199,
    rating: 4.9,
    reviews: 1420,
    image: '/luxury_serum_hero.png',
    images: ['/luxury_serum_hero.png', '/faceserum_hover_1.png', '/luxury_serum_dropper.png'],
    description: 'Unleash your skin’s natural glow. Our Advanced Vitamin C Serum contains a highly stable 15% concentration of pure Vitamin C combined with Vitamin E and Ferulic Acid to visibly brighten, firm, and protect against environmental pollutants.',
    details: 'Volume: 30ml | Skin Type: Dull, Aging | Key Ingredients: 15% Vitamin C, Ferulic Acid, Vitamin E.',
    shipping: 'Delivered in 2-4 business days. Safe and secure contactless payments.'
  },
  {
    id: 'ap-8',
    name: 'ULTRA REPAIR HYDRATING NIGHT CREAM',
    category: 'Face Cream',
    price: 999,
    oldPrice: 1299,
    rating: 4.9,
    reviews: 760,
    image: '/face_cream_product.png',
    images: ['/face_cream_product.png', '/facecream_hover_1.png', '/hydrating_cream_hero.png'],
    description: 'An ultra-nourishing, rich night cream designed to repair and restore the skin barrier while you sleep. Restores suppleness and reduces appearance of fine lines by morning.',
    details: 'Volume: 50g | Skin Type: Combination, Dry | Key Ingredients: Shea Butter, Peptides, Niacinamide.',
    shipping: 'Free express shipping on all skincare creams. Secure checkouts via UPI and cards.'
  },
  {
    id: 'fw-1',
    name: 'Pichwai Lotus Garden Cleanser',
    category: 'Face Wash',
    price: 699,
    oldPrice: 899,
    rating: 4.9,
    reviews: 84,
    image: '/luxury_facewash_pump.png',
    images: ['/luxury_facewash_pump.png', '/facewash_product.png', '/facewash_hover_1.png'],
    description: 'Inspired by traditional Pichwai art, this luxurious cleanser features pure white lotus extract to refresh your skin and senses, leaving a velvety soft texture.',
    details: 'Volume: 150ml | Skin Type: Sensitive, Normal | Key Ingredients: White Lotus extract, Rose Water.',
    shipping: 'Free shipping. Hassle-free 30 days return policy.'
  },
  {
    id: 'fs-1',
    name: 'Pichwai Blossom Hydration Drops',
    category: 'Face Serum',
    price: 1299,
    oldPrice: 1599,
    rating: 4.9,
    reviews: 112,
    image: '/luxury_serum_dropper.png',
    images: ['/luxury_serum_dropper.png', '/luxury_serum_hero.png', '/faceserum_hover_1.png'],
    description: 'Premium hydrating facial oil drops formulated with real botanical extracts to restore youthful elasticity and natural bounce to dehydrated skin.',
    details: 'Volume: 35ml | Skin Type: Dry, Normal | Key Ingredients: Jojoba Oil, Argan Oil, Squalane.',
    shipping: 'Shipped within 24 hours. Easy tracking link provided via SMS.'
  },
  {
    id: 'fc-1',
    name: 'Crimson Red Shree Yantra Night Cream',
    category: 'Face Cream',
    price: 1499,
    oldPrice: 1899,
    rating: 4.9,
    reviews: 65,
    image: '/face_cream_product.png',
    images: ['/face_cream_product.png', '/hydrating_cream_hero.png', '/facecream_hover_1.png'],
    description: 'An luxurious overnight facial balm formulated to promote longevity, glow, and deep cellular restoration. Promotes smooth, bright skin by morning.',
    details: 'Volume: 50g | Skin Type: All Skin Types | Key Ingredients: Red Algae Extract, Saffron Oil.',
    shipping: 'Express delivery. Easy refund/replacement policies.'
  },
  {
    id: 'bw-1',
    name: 'Yellow Gold Shree Yantra Body Wash',
    category: 'Body Wash',
    price: 799,
    oldPrice: 999,
    rating: 4.8,
    reviews: 94,
    image: '/body_wash_product.png',
    images: ['/body_wash_product.png', '/bodywash_hover_1.png', '/bodywash_hover_1.png'],
    description: 'Indulge in a golden shower experience. This luxury body cleanser nourishes the skin with fine oils and gold dust shimmer, leaving a pleasant scent.',
    details: 'Volume: 250ml | Skin Type: All Skin Types | Key Ingredients: Shea butter, Sandalwood oil, Gold shimmer.',
    shipping: 'Delivered in 3-5 business days. Safe packaging.'
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { showNotification } = useNotifications();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Standard');
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [recommendations, setRecommendations] = useState([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showQuickRating, setShowQuickRating] = useState(false);


  // ── Inline 360° View (no modal, drag directly on main image) ──
  const [is360Mode, setIs360Mode] = useState(false);
  const [rotDeg, setRotDeg] = useState(0);         // continuous rotation degrees
  const [isDragging360, setIsDragging360] = useState(false);
  const [isAutoSpin360, setIsAutoSpin360] = useState(false);
  const dragRef360 = useRef(null);
  const autoSpinRef360 = useRef(null);

  const REAL_IMGS = product ? (product.images_360?.length > 0 ? product.images_360 : [product.image]).filter(Boolean) : [];
  const SEG = REAL_IMGS.length > 0 ? 360 / REAL_IMGS.length : 360;

  // Which real image to show based on rotation
  const activeImgIdx = REAL_IMGS.length > 0
    ? Math.floor(((rotDeg % 360) + 360) % 360 / SEG) % REAL_IMGS.length
    : 0;
  // How far within current segment (0→1)
  const segFrac = REAL_IMGS.length > 0
    ? ((((rotDeg % 360) + 360) % 360) % SEG) / SEG
    : 0;
  // CSS tilt angle: lean left/right within segment. Heavily reduced to avoid stilted look.
  // If user provides a proper 360 sequence (> 5 images), disable tilt entirely for true 360.
  const tiltDeg = REAL_IMGS.length > 5 ? 0 : (segFrac - 0.5) * 8;

  // Auto-spin
  useEffect(() => {
    if (isAutoSpin360) {
      autoSpinRef360.current = setInterval(() => {
        setRotDeg(r => r + 4);
      }, 40);
    } else {
      clearInterval(autoSpinRef360.current);
    }
    return () => clearInterval(autoSpinRef360.current);
  }, [isAutoSpin360]);

  // On 360° mode enter: auto-spin once then stop
  useEffect(() => {
    if (is360Mode) {
      setRotDeg(0);
      setIsAutoSpin360(true);
      const t = setTimeout(() => setIsAutoSpin360(false), 1800);
      return () => clearTimeout(t);
    }
  }, [is360Mode]);

  const on360Down = useCallback((e) => {
    if (isAutoSpin360) setIsAutoSpin360(false);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    dragRef360.current = { startX: clientX, startRot: rotDeg };
    setIsDragging360(true);
  }, [isAutoSpin360, rotDeg]);

  const on360Move = useCallback((e) => {
    if (!dragRef360.current || !isDragging360) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const delta = dragRef360.current.startX - clientX; // drag left = rotate forward
    
    // Increased drag sensitivity (delta * 1.5). A 240px drag will now rotate a full 360 degrees.
    setRotDeg(dragRef360.current.startRot + delta * 1.5);
  }, [isDragging360]);

  const on360Up = useCallback(() => {
    setIsDragging360(false);
  }, []);

  const exit360 = useCallback((img) => {
    setIs360Mode(false);
    setIsAutoSpin360(false);
    setRotDeg(0);
    if (img) setSelectedImage(img);
  }, []);


  useEffect(() => {
    // 1. Find in master list
    let found = MASTER_PRODUCTS.find(p => p.id === id);
    if (!found) {
      // 2. Fetch from backend if not found in local master list
      fetch(`${API_BASE_URL}/products`)
        .then(res => res.json())
        .then(data => {
          const item = data.find(p => String(p.id) === String(id));
          if (item) {
            const mapped = {
              id: item.id,
              name: item.name,
              category: item.category || 'Skincare',
              price: parseFloat(item.price) || 599,
              oldPrice: item.old_price ? parseFloat(item.old_price) : null,
              rating: item.rating || calculateRatingFromLikes(item.likes).rating,
              reviews: item.review_count || calculateRatingFromLikes(item.likes).reviews,
              image: item.image_url || '/facewash_product.png',
              images: (item.images && item.images.length > 0) ? item.images : [],
              images_360: (item.images_360 && item.images_360.length > 0) ? item.images_360 : [],
              description: item.description || 'No description provided for this product.',
              details: item.details || 'No additional details available.',
              shipping: item.shipping || 'Standard shipping information applies.',
              meta_title: item.meta_title || '',
              meta_description: item.meta_description || '',
              meta_keywords: item.meta_keywords || '',
              sirv_spin_url: item.sirv_spin_url || ''
            };
            setProduct(mapped);
            setSelectedImage(mapped.image);
            setCurrentRating(mapped.rating);
            setTotalReviews(mapped.reviews);
            
            // Log Behavioural View & GA4
            trackUserActivity('View', mapped.name);
            logGAEvent('view_item', { item_name: mapped.name, item_id: mapped.id, price: mapped.price });
          } else {
            // Fallback to first item if completely missing
            setProduct(MASTER_PRODUCTS[0]);
            setSelectedImage(MASTER_PRODUCTS[0].image);
          }
        })
        .catch(() => {
          setProduct(MASTER_PRODUCTS[0]);
          setSelectedImage(MASTER_PRODUCTS[0].image);
        });
    } else {
      setProduct(found);
      setSelectedImage(found.image);
      setCurrentRating(found.rating);
      setTotalReviews(found.reviews);
      
      // Log Behavioural View & GA4
      trackUserActivity('View', found.name);
      logGAEvent('view_item', { item_name: found.name, item_id: found.id, price: found.price });
    }
    // Track recently viewed
    if (found) {
      saveToRecentlyViewed(found);
    }
  }, [id]);

  // Fetch Personalized Recommendations
  useEffect(() => {
    if (!product) return;
    fetch(`${API_BASE_URL}/products/recommendations?productId=${product.id}`)
      .then(res => res.json())
      .then(data => setRecommendations(data))
      .catch(() => setRecommendations(MASTER_PRODUCTS.slice(0, 4)));
  }, [product]);

  // Inject Schema.org JSON-LD Structured Product SEO
  useEffect(() => {
    if (!product) return;
    
    // Remove existing script if any
    const existingScript = document.getElementById('product-schema-jsonld');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [
        window.location.origin + product.image
      ],
      "description": product.description,
      "sku": product.sku || `A2P-${product.id}`,
      "brand": {
        "@type": "Brand",
        "name": "A2P Cosmetics"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": currentRating || "4.9",
        "reviewCount": totalReviews || "120"
      }
    };

    const scriptNode = document.createElement('script');
    scriptNode.type = 'application/ld+json';
    scriptNode.id = 'product-schema-jsonld';
    scriptNode.innerHTML = JSON.stringify(schema);
    document.head.appendChild(scriptNode);

    return () => {
      const scriptToRemove = document.getElementById('product-schema-jsonld');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [product]);

  const saveToRecentlyViewed = (prod) => {
    try {
      const current = localStorage.getItem('a2p_recently_viewed');
      let items = current ? JSON.parse(current) : [];
      items = items.filter(item => item.id !== prod.id);
      items.unshift(prod);
      localStorage.setItem('a2p_recently_viewed', JSON.stringify(items.slice(0, 4)));
    } catch (e) {
      console.log('Error saving recently viewed', e);
    }
  };

  const getRecentlyViewed = () => {
    try {
      const items = localStorage.getItem('a2p_recently_viewed');
      return items ? JSON.parse(items).filter(item => item.id !== id) : [];
    } catch {
      return [];
    }
  };




  const handleCheckPincode = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeStatus('Please enter a valid 6-digit pincode.');
      return;
    }

    // If product is from MASTER_PRODUCTS (not DB), show generic available
    if (!product || typeof product.id === 'string') {
      setPincodeStatus('✅ Available! Estimated Delivery in 2-3 Days.');
      return;
    }

    try {
      setPincodeStatus('Checking...');
      const res = await fetch(`${API_BASE_URL}/products/${product.id}/check-pincode?pincode=${pincode}`);
      const data = await res.json();
      setPincodeStatus(data.message || (data.available ? '✅ Available!' : '❌ Not available at this pincode.'));
    } catch (err) {
      setPincodeStatus('❌ Could not check availability. Please try again.');
    }
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
    showNotification({
      type: 'cart',
      title: 'Added to Selection',
      message: `${product.name} (${quantity} items) added to cart.`,
      duration: 3000
    });
    // Log tracking & analytics
    trackUserActivity('Cart', product.name);
    logGAEvent('add_to_cart', { item_name: product.name, item_id: product.id, price: product.price, quantity });
  };

  const handleAddToWishlistClick = () => {
    if (!product) return;
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    showNotification({
      type: 'wishlist',
      title: 'Saved to Wishlist',
      message: `${product.name} saved.`,
      duration: 3000
    });
    // Log tracking & analytics
    trackUserActivity('Wishlist', product.name);
    logGAEvent('add_to_wishlist', { item_name: product.name, item_id: product.id, price: product.price });
  };

  const handleRatingUpdate = (newRating, newTotalReviews) => {
    setCurrentRating(newRating);
    setTotalReviews(newTotalReviews);
    // Update the product state with new rating
    if (product) {
      setProduct({
        ...product,
        rating: newRating,
        reviews: newTotalReviews
      });
    }
  };

  const handleQuickRating = (rating) => {
    // Scroll to the rating section
    const ratingSection = document.querySelector('.product-rating-section');
    if (ratingSection) {
      ratingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Show hint to encourage full review
    setShowQuickRating(true);
    setTimeout(() => setShowQuickRating(false), 3000);
  };


  if (!product) {
    return (
      <div className="product-detail-loading">
        <p>Loading luxury product details...</p>
      </div>
    );
  }

  const recentlyViewed = getRecentlyViewed();

  return (
    <div className="product-detail-page">
      <SEO 
        title={product.meta_title || `${product.name} - A2P Cosmetics`} 
        description={product.meta_description || product.description} 
        keywords={product.meta_keywords || `${product.name}, skincare, a2p cosmetics`} 
      />
      <div className="pd-container container">
        {/* Breadcrumb navigation */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/all-products">Products</Link>
          <span>/</span>
          <span className="active">{product.category}</span>
        </div>

        {/* Core Product Info Split */}
        <div className="pd-split-grid">
          {/* Left Column: Image Gallery */}
          <div
            className="pd-gallery-box"
            onMouseMove={is360Mode ? on360Move : undefined}
            onMouseUp={is360Mode ? on360Up : undefined}
            onMouseLeave={is360Mode ? on360Up : undefined}
            onTouchMove={is360Mode ? on360Move : undefined}
            onTouchEnd={is360Mode ? on360Up : undefined}
          >
            <div className="pd-thumbnails-pane">
              {/* Show Primary, Hover, and Regular Gallery images in the thumbnail sidebar */}
              {[product.image_url, product.hover_image_url, ...(product.images || [])].filter(Boolean).map((img, idx) => (
                <div
                  key={idx}
                  className={`pd-thumb-wrapper ${!is360Mode && selectedImage === img ? 'active' : ''}`}
                  onClick={() => exit360(img)}
                >
                  <img src={img} alt={`view-${idx}`} />
                </div>
              ))}
              {/* 360° Thumbnail Trigger */}
              <div
                className={`pd-thumb-wrapper pd-360-thumb ${is360Mode ? 'active' : ''}`}
                onClick={() => setIs360Mode(m => !m)}
                title="360° View"
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* Product image as background */}
                {product.image && (
                  <img
                    src={product.image}
                    alt="360 view"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
                  />
                )}
                <div className="pd-360-thumb-inner" style={{ position: 'relative', zIndex: 1 }}>
                  <RefreshCw size={20} />
                  <span>360°</span>
                </div>
              </div>
            </div>

            {/* Main Image — becomes 360° viewer inline */}
            <div
              className={`pd-main-image-wrapper ${is360Mode ? 'pd-360-active-wrapper' : ''}`}
              onMouseDown={is360Mode ? on360Down : undefined}
              onTouchStart={is360Mode ? on360Down : undefined}
              style={{ cursor: is360Mode ? (isDragging360 ? 'grabbing' : 'grab') : 'default' }}
            >
              {is360Mode ? (
                product.sirv_spin_url ? (
                  <>
                    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
                      <iframe src={product.sirv_spin_url} width="100%" height="100%" style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} allowFullScreen></iframe>
                    </div>
                    <button className="pd-360-inline-exit" onClick={() => exit360(null)}>
                      <X size={14} /> Exit 360°
                    </button>
                  </>
                ) : (
                  <>
                    {/* Rotating product image with perspective tilt */}
                    <img
                      src={REAL_IMGS[activeImgIdx]}
                      alt={product.name}
                      className="pd-main-img pd-360-inline-img"
                      style={{
                        transform: `perspective(900px) rotateY(${tiltDeg}deg)`,
                        transition: isDragging360 ? 'none' : 'transform 0.25s ease',
                      }}
                      draggable={false}
                    />
                    {/* 360° badge top-left */}
                    <div className="pd-360-inline-badge">
                      <RefreshCw size={12} className={isAutoSpin360 ? 'pd-360-spin-anim' : ''} />
                      <span>360°</span>
                    </div>
                    {/* Drag hint bottom */}
                    <div className={`pd-360-inline-hint ${isDragging360 ? 'active' : ''}`}>
                      {isDragging360 ? '🔄 Rotating...' : '← Drag to Rotate →'}
                    </div>
                    {/* Exit button */}
                    <button className="pd-360-inline-exit" onClick={() => exit360(null)}>
                      <X size={14} /> Exit 360°
                    </button>
                  </>
                )
              ) : (
                <img src={selectedImage} alt={product.name} className="pd-main-img" />
              )}
            </div>
          </div>

          {/* Right Column: Title, Prices, Selectors */}
          <div className="pd-info-box">
            <h1 className="pd-title">{product.name}</h1>
            
            <div className="pd-price-row">
              <span className="pd-price">₹{product.price}.00</span>
              {product.oldPrice && <span className="pd-old-price">₹{product.oldPrice}.00</span>}
              <span className="pd-stock-badge">In Stock</span>
            </div>

            <div className="pd-ratings-row">
              <div className="pd-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < (hoverRating || currentRating) ? "#eab308" : "transparent"} 
                    color={i < (hoverRating || currentRating) ? "#eab308" : "#d1d5db"}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => handleQuickRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={i < (hoverRating || currentRating) ? 'star-hover' : ''}
                  />
                ))}
              </div>
              <span className="pd-rating-text">{currentRating} ({totalReviews} reviews)</span>
              {showQuickRating && (
                <span className="rate-hint">Click stars to rate!</span>
              )}
            </div>

            <div className="pd-trust-mini">
              <div className="pd-trust-badge">
                <RotateCcw size={16} />
                <span>Easy Return Policy</span>
              </div>
              <div className="pd-trust-badge">
                <ShieldCheck size={16} />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Colors */}
            <div className="pd-options-section">
              <span className="pd-option-label">Color: <strong>{selectedColor}</strong></span>
              <div className="pd-color-circles">
                {['Standard', 'Premium Glow', 'Aura Gold'].map(col => (
                  <button 
                    key={col}
                    className={`pd-color-circle ${selectedColor === col ? 'active' : ''}`}
                    onClick={() => setSelectedColor(col)}
                    title={col}
                  />
                ))}
              </div>
            </div>

            {/* Delivery Date Checker */}
            <div className="pd-delivery-widget">
              <span className="pd-option-label">Check Delivery Date</span>
              <form onSubmit={handleCheckPincode} className="pd-delivery-form">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                  className="pd-delivery-input"
                />
                <button type="submit" className="pd-delivery-btn">Check</button>
              </form>
              {pincodeStatus && (
                <p className={`pd-delivery-status ${pincodeStatus.includes('✅') ? 'success' : pincodeStatus === 'Checking...' ? '' : 'error'}`} style={pincodeStatus === 'Checking...' ? { color: '#64748b' } : {}}>
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Sizes */}
            <div className="pd-options-section">
              <div className="pd-option-header">
                <span className="pd-option-label font-bold">Select Size</span>
                <span className="pd-size-guide">Size Guide</span>
              </div>
              <div className="pd-size-selectors">
                {['50ml', '100ml', '150ml'].map(sz => (
                  <button 
                    key={sz}
                    className={`pd-size-btn ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Checkout CTA */}
            <div className="pd-purchase-section">
              <div className="pd-qty-box">
                <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus size={14} />
                </button>
                <span className="pd-qty-num">{quantity}</span>
                <button className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)}>
                  <Plus size={14} />
                </button>
              </div>

              <button className="pd-add-to-cart-cta" onClick={handleAddToCartClick}>
                <ShoppingBag size={18} />
                <span>ADD TO CART - ₹{product.price * quantity}.00</span>
              </button>

              <button className="pd-wishlist-action" onClick={handleAddToWishlistClick} title="Save to Favorites">
                <Heart size={20} />
              </button>
            </div>

            {/* Social Share */}
            <div className="pd-share-box">
              <span className="share-title">Share this product</span>
              <div className="share-icons">
                <a href="#facebook" className="share-link"><Facebook size={18} /></a>
                <a href="#twitter" className="share-link"><Twitter size={18} /></a>
                <a href="#instagram" className="share-link"><Instagram size={18} /></a>
                <a href="#email" className="share-link"><Mail size={18} /></a>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Info Section */}
        <div className="pd-tabs-section">
          <div className="pd-tabs-header">
            {[
              { id: 'description', label: 'Description' },
              { id: 'details', label: 'Details' },
              { id: 'reviews', label: `Reviews (${totalReviews})` },
              { id: 'shipping', label: 'Shipping & Returns' }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`pd-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pd-tabs-content">
            {activeTab === 'description' && (
              <div className="pd-tab-pane fade-in">
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="pd-tab-pane fade-in">
                <p>{product.details}</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="pd-tab-pane fade-in">
                <div className="pd-reviews-summary">
                  <h3>Customer Reviews</h3>
                  <p>Average Rating: <strong>{currentRating} / 5.0</strong> based on verified purchases.</p>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="pd-tab-pane fade-in">
                <p>{product.shipping}</p>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like Slider */}
        <div className="pd-related-section">
          <h2 className="pd-section-title text-center">You May Also Like</h2>
          <div className="pd-related-grid">
            {(recommendations.length > 0 ? recommendations : MASTER_PRODUCTS.slice(0, 4)).map(item => {
              const imgUrl = item.image_url || item.image || '/facewash_product.png';
              return (
                <div key={item.id} className="pd-related-card">
                  <div className="pd-rc-img-box">
                    <img src={imgUrl} alt={item.name} />
                  </div>
                  <div className="pd-rc-body">
                    <h4>{item.name}</h4>
                    <p className="price">₹{item.price}.00</p>
                    <Link to={`/product/${item.id}`} className="pd-rc-shop-btn">
                      Shop Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Rating and Review System */}
        <ProductRating 
          productId={product.id}
          productName={product.name}
          currentRating={currentRating}
          totalReviews={totalReviews}
          onRatingUpdate={handleRatingUpdate}
        />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="pd-related-section recently-viewed">
            <h2 className="pd-section-title text-center">Recently Viewed</h2>
            <div className="pd-related-grid">
              {recentlyViewed.slice(0, 4).map(item => (
                <div key={item.id} className="pd-related-card">
                  <div className="pd-rc-img-box">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="pd-rc-body">
                    <h4>{item.name}</h4>
                    <p className="price">₹{item.price}.00</p>
                    <Link to={`/product/${item.id}`} className="pd-rc-shop-btn">
                      Shop Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp Floating Chat Widget */}
        <a 
          href={`https://wa.me/919876543210?text=Hi!%20I%20am%20interested%20in%20buying%20"${encodeURIComponent(product.name)}"%20priced%20at%20Rs.%20${product.price}.%20Is%20it%20available?`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="pd-whatsapp-float"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.805-9.778.002-2.613-1.01-5.068-2.853-6.906C16.38 2.085 13.927 1.07 11.31 1.07c-5.4 0-9.8 4.387-9.802 9.782-.001 1.542.487 3.051 1.413 4.437l-.988 3.613 3.71-.973zm13.11-6.983c-.328-.164-1.94-.957-2.24-1.066-.3-.11-.518-.164-.737.164-.219.328-.847 1.066-1.038 1.284-.19.219-.383.246-.71.082-.328-.164-1.386-.51-2.64-1.628-.975-.87-1.633-1.944-1.825-2.272-.19-.328-.02-.505.143-.668.147-.147.328-.383.493-.574.164-.19.219-.328.328-.546.11-.219.055-.41-.027-.574-.082-.164-.737-1.776-1.01-2.434-.265-.636-.532-.55-.737-.56-.19-.01-.41-.01-.628-.01-.219 0-.574.082-.875.41-.3.328-1.148 1.12-1.148 2.733 0 1.613 1.175 3.17 1.339 3.388.164.219 2.313 3.532 5.6 4.954.783.339 1.395.54 1.872.69.787.25 1.5.215 2.066.13.63-.094 1.94-.793 2.214-1.559.274-.766.274-1.422.19-1.559-.082-.138-.3-.22-.628-.383z"/>
          </svg>
        </a>

      </div>
    </div>
  );
};

export default ProductDetail;

