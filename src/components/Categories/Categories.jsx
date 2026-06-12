import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import './Categories.css';

// Static fallback category cards matching the reference design
const FALLBACK_CATEGORIES = [
  { id: 1, name: 'FACE WASH',   slug: 'face-wash',  image_url: '/facewash_banner.png',     hover_image_url: '/facewash_hover_1.png' },
  { id: 2, name: 'FACE SERUM',  slug: 'face-serum', image_url: '/luxury_serum_hero.png',   hover_image_url: '/faceserum_hover_1.png' },
  { id: 3, name: 'FACE CREAM',  slug: 'face-cream', image_url: '/hydrating_cream_hero.png', hover_image_url: '/facecream_hover_1.png' },
  { id: 4, name: 'BODY WASH',   slug: 'body-wash',  image_url: '/body_wash_banner.png',    hover_image_url: '/bodywash_hover_1.png' },
  { id: 5, name: 'SKIN CARE',   slug: 'skin-care',  image_url: '/skincare.png',            hover_image_url: '/natural_skincare_hero.png' },
  { id: 6, name: 'MAKE UP',     slug: 'makeup',     image_url: '/makeup.png',              hover_image_url: '/lipstick_shade_finder.png' },
];

// Items for the bottom marquee slider
const MARQUEE_ITEMS = [
  { label: 'Face Wash',    image: '/facewash_product.png'   },
  { label: 'Face Serum',   image: '/luxury_serum_hero.png'  },
  { label: 'Face Cream',   image: '/face_cream_product.png' },
  { label: 'Body Wash',    image: '/body_wash_product.png'  },
  { label: 'Skin Care',    image: '/skincare.png'           },
  { label: 'Natural Glow', image: '/natural_skincare_hero.png' },
  { label: 'Hydration',    image: '/hydrating_cream_hero.png'  },
  { label: 'Make Up',      image: '/makeup.png'             },
];

// Helper: merge DB cat with fallback to always guarantee images
const mergeCatWithFallback = (cat, idx) => {
  const fallback = FALLBACK_CATEGORIES[idx % FALLBACK_CATEGORIES.length];
  const img = cat.image_url;
  const isValidImg = img && (img.startsWith('/') || img.startsWith('http'));
  return {
    ...cat,
    image_url: isValidImg ? img : fallback.image_url,
    hover_image_url: cat.hover_image_url || fallback.hover_image_url,
    slug: cat.slug || fallback.slug,
  };
};

const Categories = () => {
  // Initialize directly with fallback — no loading state needed
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const trackRef = useRef(null);

  useEffect(() => {
    // Silently upgrade with DB data if available
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setCategories(data.map(mergeCatWithFallback));
        }
      })
      .catch(() => {
        // Already showing fallback, nothing to do
      });
  }, []);

  const displayCats = categories;

  return (
    <section className="cat-wrapper">
      {/* ── Section Header ── */}
      <div className="cat-header-block">
        <p className="cat-eyebrow">A2P COSMETICS COLLECTION</p>
        <h2 className="cat-heading">
          Explore Our <span className="cat-heading-accent">Categories</span>
        </h2>
      </div>

      <div className="cat-grid">
        {displayCats.slice(0, 6).map((cat, i) => (
          <a
            key={cat.id}
            href={`/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={`cat-tile cat-tile--${i}`}
          >
            <img
              src={cat.image_url || '/skincare.png'}
              alt={cat.name}
              className="cat-tile__img cat-tile__img--main"
              onError={e => { e.target.src = '/skincare.png'; }}
            />
            {cat.hover_image_url && (
              <img
                src={cat.hover_image_url}
                alt={`${cat.name} hover`}
                className="cat-tile__img cat-tile__img--hover"
                onError={e => { e.target.src = cat.image_url || '/skincare.png'; }}
              />
            )}
            <div className="cat-tile__veil" />
            <div className="cat-tile__label">
              <span className="cat-tile__name">{cat.name}</span>
              <span className="cat-tile__explore">EXPLORE</span>
            </div>
          </a>
        ))}

        {/* Last tile — Shop All CTA */}
        <div className="cat-tile cat-tile--cta">
          <div className="cat-tile__cta-inner">
            <p className="cat-tile__cta-tag">— All Products</p>
            <h3 className="cat-tile__cta-title">SHOP OUR COLLECTION</h3>
            <a href="/shop" className="cat-tile__cta-btn">SHOP NOW</a>
          </div>
        </div>
      </div>

      {/* ── Marquee Product Slider ── */}
      <div className="cat-marquee-wrap">
        <div className="cat-marquee-track" ref={trackRef}>
          {/* Duplicate for seamless loop */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div key={idx} className="cat-marquee-item">
              <img src={item.image} alt={item.label} className="cat-marquee-img"
                   onError={e => { e.target.src = '/skincare.png'; }} />
              <span className="cat-marquee-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
