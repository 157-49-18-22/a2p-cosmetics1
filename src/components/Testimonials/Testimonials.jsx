import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import './Testimonials.css';

const reviews = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    date: '15 JAN, 2025',
    rating: 5,
    text: '"The Velvet Matte Lipstick is absolutely stunning! The color lasts all day and feels so luxurious."',
  },
  {
    id: 2,
    name: 'Emily Rodriguez',
    date: '10 JAN, 2025',
    rating: 5,
    text: '"My skin has never looked better! The Radiant Glow Face Wash is a game-changer."',
  },
  {
    id: 3,
    name: 'Jessica Chen',
    date: '08 JAN, 2025',
    rating: 5,
    text: '"I\'m obsessed with the foundation! It gives such a natural, flawless finish."',
  },
  {
    id: 4,
    name: 'Amanda Foster',
    date: '05 JAN, 2025',
    rating: 5,
    text: '"The Hydra-Luxe Moisturizer keeps my skin hydrated all day. Worth every penny!"',
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? reviews.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1));
  };

  const activeReview = reviews[currentIndex];

  return (
    <section className="vicco-testimonials" id="reviews">
      <div className="vicco-testimonials-container">
        <h2 className="vicco-testimonials-title">WHAT OUR CUSTOMERS SAY</h2>

        <div className="vicco-slider-wrapper">
          <button className="vicco-slider-nav prev" onClick={handlePrev}>
            <ChevronLeft size={22} color="white" strokeWidth={2.5} />
          </button>

          <div className="vicco-slider-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="vicco-review-block"
              >
                <p className="vicco-review-text">{activeReview.text}</p>
                <div className="vicco-review-stars">
                  {[...Array(activeReview.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" strokeWidth={1} />
                  ))}
                </div>
                <h3 className="vicco-review-name">{activeReview.name.toUpperCase()}</h3>
                <span className="vicco-review-date">{activeReview.date}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="vicco-slider-nav next" onClick={handleNext}>
            <ChevronRight size={22} color="white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
