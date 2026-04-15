import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import './Bestsellers.css';

const products = [
  { id: 1, name: 'Glow Vitamin C Serum', price: '$45.00', rating: 4.9, image: '/skincare.png', tag: 'Bestseller' },
  { id: 2, name: 'Velvet Matte Lipstick', price: '$28.00', rating: 4.8, image: '/makeup.png', tag: 'New' },
  { id: 3, name: 'Hydrating Night Cream', price: '$52.00', rating: 5.0, image: '/bestsellers.png', tag: 'Bestseller' },
  { id: 4, name: 'Essential Oil Cleanser', price: '$35.00', rating: 4.7, image: '/hero-cosmetic.png', tag: '' },
];

const Bestsellers = () => {
  return (
    <section className="section bestsellers" id="bestsellers">
      <div className="container">
        <div className="section-header">
          <span className="subtitle">Must Haves</span>
          <h2>Our Bestsellers</h2>
        </div>

        <div className="products-grid">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="product-image">
                {product.tag && <span className="product-tag">{product.tag}</span>}
                <img src={product.image} alt={product.name} />
                <div className="product-actions">
                  <button className="icon-btn"><Heart size={18} /></button>
                  <button className="icon-btn"><ShoppingCart size={18} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{product.rating}</span>
                </div>
                <h3>{product.name}</h3>
                <span className="product-price">{product.price}</span>
                <button className="add-to-cart">Add to Bag</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
