import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Hero.css';

const images = [
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2000&auto=format&fit=crop", // Vibrant Portrait
  "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=2000&auto=format&fit=crop", // Soft Portrait
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=2000&auto=format&fit=crop"  // Product Collage
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const collageTiles = [
    { id: 1, pos: '0% 0%' },
    { id: 2, pos: '50% 0%' },
    { id: 3, pos: '100% 0%' },
    { id: 4, pos: '0% 100%' },
    { id: 5, pos: '50% 100%' },
    { id: 6, pos: '100% 100%' },
  ];

  return (
    <section className="beauty-hero">
      <div className="hero-outer-bg">
        <div className="container hero-inner-container">
          <div className="hero-grid">
            <motion.div 
              className="hero-text-content"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="promo-badge">
                <div className="promo-thumb"></div>
                <span>20% off for your first purchase</span>
              </div>

              <h1>
                Beauty <br />
                that feels like <br />
                <span>self-care every day</span>
              </h1>

              <p>
                Clean, conscious skincare and cosmetics — made to love your skin the way it deserves.
              </p>

              <button className="btn-shop-maroon">Shop now</button>
            </motion.div>

            <div className="hero-collage-wrapper">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSlide}
                  className="collage-grid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                >
                  {collageTiles.map((tile, i) => (
                    <div 
                      key={tile.id}
                      className={`collage-tile tile-${i+1}`}
                      style={{ 
                        backgroundImage: `url("${images[currentSlide]}")`,
                        backgroundPosition: tile.pos
                      }}
                    ></div>
                  ))}
                </motion.div>
              </AnimatePresence>
              
              <div className="slider-dots">
                {images.map((_, i) => (
                  <div 
                    key={i} 
                    className={`dot ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
