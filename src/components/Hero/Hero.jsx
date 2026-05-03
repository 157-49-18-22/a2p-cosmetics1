import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      title: "Beauty That Transforms",
      subtitle: "Elevate your skincare and makeup routine with our luxurious, science-backed formulas.",
      image: "/bg.jpeg",
      badge: "Discover Your Natural Radiance",
      cta: "Shop Now",
      color: "#ff4d6d"
    },
    {
      title: "Radiance Reimagined",
      subtitle: "Experience the glow with our luxury Face Serum and specialized treatments.",
      image: "/luxury_serum_hero.png",
      badge: "New Arrival: Face Serum",
      cta: "Shop Serum",
      color: "#ff8fa3"
    },
    {
      title: "Hydration Redefined",
      subtitle: "Experience deep nourishment and a fresh glow with our premium moisture collection.",
      image: "/hydrating_cream_hero.png",
      badge: "Refresh Your Skin",
      cta: "Explore Cream",
      color: "#4dabff"
    },
    {
      title: "Purely Organic",
      subtitle: "Harnessing the power of nature to bring you the cleanest, most effective skincare.",
      image: "/natural_skincare_hero.png",
      badge: "100% Natural Ingredients",
      cta: "View Collection",
      color: "#4dbf4d"
    }


  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideVariants = {
    initial: { 
      opacity: 0, 
      rotateX: 45, 
      y: 80,
      scale: 0.95,
      filter: 'blur(10px)'
    },
    animate: { 
      opacity: 1, 
      rotateX: 0, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Custom smooth ease-out
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { 
      opacity: 0, 
      rotateX: -45, 
      y: -80,
      scale: 0.95,
      filter: 'blur(10px)',
      transition: {
        duration: 0.8,
        ease: [0.7, 0, 0.84, 0]
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };


  return (
    <section className="beauty-hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="hero-slide-bg"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ backgroundImage: `url('${slides[currentIndex].image}')` }}
        >
          <div className="hero-overlay"></div>
        </motion.div>
      </AnimatePresence>

      <div className="container hero-inner-container">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="hero-content"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div variants={itemVariants} className="discover-badge">
              <Sparkles size={16} />
              <span>{slides[currentIndex].badge}</span>
            </motion.div>

            <motion.h1 variants={itemVariants}>
              <span className="gradient-text">{slides[currentIndex].title}</span>
            </motion.h1>

            <motion.p variants={itemVariants}>{slides[currentIndex].subtitle}</motion.p>

            <motion.div variants={itemVariants} className="hero-buttons">
              <button className="btn-shop-now" style={{ backgroundColor: slides[currentIndex].color }}>
                {slides[currentIndex].cta} <ArrowRight size={18} />
              </button>
              <button className="btn-explore">
                Explore Products
              </button>
            </motion.div>

          </motion.div>
        </AnimatePresence>

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

      <div className="hero-indicators">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
