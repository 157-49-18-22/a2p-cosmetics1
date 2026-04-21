import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './Bestsellers.css';

const products = [
  {
    id: 1,
    name: 'Radiant Glow Face Wash',
    desc: 'Gentle cleansing formula that reveals your natural radiance',
    price: '$24.99',
    rating: 4.8,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    tag: 'Skincare'
  },
  {
    id: 2,
    name: 'Velvet Matte Lipstick',
    desc: 'Long-lasting color with a luxurious matte finish',
    price: '$18.99',
    rating: 4.9,
    reviews: 528,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop',
    tag: 'Makeup'
  },
  {
    id: 3,
    name: 'Flawless Finish Foundation',
    desc: 'Buildable coverage for a natural, radiant complexion',
    price: '$32.99',
    rating: 4.7,
    reviews: 416,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    tag: 'Makeup'
  },
  {
    id: 4,
    name: 'Hydra-Luxe Moisturizer',
    desc: 'Deep hydration that keeps skin soft and supple all day',
    price: '$28.99',
    rating: 4.9,
    reviews: 651,
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
    tag: 'Skincare'
  },
];

const Bestsellers = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();

  const toggleWishlist = (product) => {
    const existingItem = wishlistItems.find(item => item.name === product.name);
    if (existingItem) {
      removeFromWishlist(existingItem.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <section className="section bestsellers" id="bestsellers">
      <div className="container">
        <div className="section-header text-center">
          <h2>Featured <span className="highlight-text">Products</span></h2>
          <p className="section-desc">
            Discover our carefully curated selection of premium cosmetics<br />
            designed to enhance your natural beauty
          </p>
        </div>

        <div className="products-grid">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="product-image-container">
                {product.tag && <span className="product-category-tag">{product.tag}</span>}
                <button 
                  className={`wishlist-btn ${isInWishlist(product.name) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart 
                    size={20} 
                    fill={isInWishlist(product.name) ? "var(--accent-color, #ff4d6d)" : "none"}
                    color={isInWishlist(product.name) ? "var(--accent-color, #ff4d6d)" : "currentColor"}
                  />
                </button>

                <img src={product.image} alt={product.name} />

                <div className="add-to-cart-wrapper">
                  <button 
                    className="add-to-cart-overlay"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>

              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-desc">{product.desc}</p>

                <div className="product-rating-box">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#ffb400" color="#ffb400" />
                    ))}
                  </div>
                  <span className="rating-text">{product.rating} ({product.reviews})</span>
                </div>

                <span className="product-price">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
