import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import './Bestsellers.css';

// Fallback products — always shown when DB image is missing
const FALLBACK_PRODUCTS = [
  { id: 1, name: 'A2P Turmeric Skin Cream', price: 75.00,  image_url: '/facewash_product.png' },
  { id: 2, name: 'A2P Vajradanti Paste',    price: 25.00,  image_url: '/face_cream_product.png' },
  { id: 3, name: 'WSO Skin Cream',          price: 37.00,  image_url: '/body_wash_product.png' },
  { id: 4, name: 'A2P Vajradanti Powder',   price: 20.00,  image_url: '/luxury_serum_hero.png' },
];

// Merge DB product with fallback to always guarantee images
const mergeProductWithFallback = (product, idx) => {
  const fallback = FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length];
  const img = product.image_url;
  const isValidImg = img && (img.startsWith('/') || img.startsWith('http'));
  return {
    ...product,
    image_url: isValidImg ? img : fallback.image_url,
  };
};

const Bestsellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setProducts(data.map(mergeProductWithFallback));
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setProducts(FALLBACK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="vicco-bestsellers">
        <div className="vicco-container">
          <p style={{textAlign: 'center'}}>Loading Best Sellers...</p>
        </div>
      </section>
    );
  }

  const displayProducts = products.length > 0 ? products : FALLBACK_PRODUCTS;

  return (
    <section className="vicco-bestsellers" id="bestsellers">
      <div className="vicco-container">
        
        {/* Top Header Row */}
        <div className="vicco-header-row">
          <h2 className="vicco-title">BEST SELLERS</h2>
          <a href="/shop" className="vicco-view-all-btn">VIEW ALL</a>
        </div>

        {/* Product Grid */}
        <div className="vicco-products-grid">
          {displayProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              className="vicco-product-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Image Box */}
              <div className="vicco-image-box">
                <span className="vicco-bestseller-badge">BESTSELLER</span>
                
                <button className="vicco-wishlist-btn">
                  <Heart size={20} strokeWidth={1.5} />
                </button>

                <img 
                  src={product.image_url || '/facewash_product.png'} 
                  alt={product.name}
                  className="vicco-product-img"
                  onError={(e) => { e.target.src = '/facewash_product.png'; }}
                />

                <button className="vicco-quick-add-btn">
                  QUICK ADD
                </button>
              </div>

              {/* Details Box */}
              <div className="vicco-details-box">
                <h3 className="vicco-product-name">{product.name}</h3>
                <p className="vicco-product-price">From ₹ {parseFloat(product.price).toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Bestsellers;
