import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="beauty-hero" style={{ backgroundImage: "url('/bg.jpeg')" }}>
      <div className="hero-overlay"></div>
      <div className="container hero-inner-container">
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="discover-badge">
            <Sparkles size={16} />
            <span>Discover Your Natural Radiance</span>
          </div>

          <h1>
            <span className="gradient-text">Beauty</span> That Transforms
          </h1>

          <p>
            Elevate your skincare and makeup routine with our luxurious, science-backed formulas designed for your pinnacle of beauty.
          </p>

          <div className="hero-buttons">
            <button className="btn-shop-now">
              Shop Now <ArrowRight size={18} />
            </button>
            <button className="btn-explore">
              Explore Products
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="hero-stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="stat-card">
            <h3>90+</h3>
            <p>Premium Products</p>
          </div>
          <div className="stat-card">
            <h3>50K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-card">
            <h3 className="rating-stat">4.9 <Star size={20} className="star-icon" fill="currentColor" /></h3>
            <p>Average Rating</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
