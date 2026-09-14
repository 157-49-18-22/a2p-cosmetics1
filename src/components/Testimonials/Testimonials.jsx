import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../../apiConfig.js';
import './Testimonials.css';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: 'SARAH MITCHELL',
    date: '15 JAN, 2025',
    rating: 5,
    text: '"The Velvet Matte Lipstick is absolutely stunning! The color lasts all day and feels so luxurious."',
  },
  {
    id: 2,
    name: 'EMILY RODRIGUEZ',
    date: '10 JAN, 2025',
    rating: 5,
    text: '"My skin has never looked better! The Radiant Glow Face Wash is a game-changer."',
  },
  {
    id: 3,
    name: 'JESSICA CHEN',
    date: '08 JAN, 2025',
    rating: 5,
    text: '"I\'m obsessed with the foundation! It gives such a natural, flawless finish."',
  },
  {
    id: 4,
    name: 'AMANDA FOSTER',
    date: '05 JAN, 2025',
    rating: 5,
    text: '"The Hydra-Luxe Moisturizer keeps my skin hydrated all day. Worth every penny!"',
  }
];

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

const Testimonials = () => {
  const [reviewsList, setReviewsList] = useState(DEFAULT_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/testimonials?limit=4&status=Active`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Strictly take maximum 4 latest reviews
            const formatted = data.slice(0, 4).map((item, idx) => ({
              id: item.id || idx,
              name: (item.name || 'Verified Customer').toUpperCase(),
              date: formatDate(item.created_at || item.date),
              rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
              text: item.content?.trim().startsWith('"') 
                ? item.content.trim() 
                : `"${item.content?.trim() || ''}"`,
              product_name: item.product_name || ''
            }));
            setReviewsList(formatted);
          }
        }
      } catch (error) {
        console.error('Error loading latest testimonials:', error);
      }
    };

    fetchLatestReviews();
  }, []);

  const totalReviews = reviewsList.length;

  // Ensure index is within bounds if reviews list length changes
  const safeIndex = totalReviews > 0 ? currentIndex % totalReviews : 0;
  const activeReview = reviewsList[safeIndex] || DEFAULT_REVIEWS[0];

  const handlePrev = () => {
    if (totalReviews <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalReviews - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    if (totalReviews <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex === totalReviews - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className="vicco-testimonials" id="reviews">
      <div className="vicco-testimonials-container">
        <h2 className="vicco-testimonials-title">WHAT OUR CUSTOMERS SAY</h2>

        <div className="vicco-slider-wrapper">
          {totalReviews > 1 && (
            <button className="vicco-slider-nav prev" onClick={handlePrev} aria-label="Previous Review">
              <ChevronLeft size={22} color="white" strokeWidth={2.5} />
            </button>
          )}

          <div className="vicco-slider-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReview.id || safeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="vicco-review-block"
              >
                <p className="vicco-review-text">{activeReview.text}</p>
                <div className="vicco-review-stars">
                  {[...Array(activeReview.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" strokeWidth={1} />
                  ))}
                </div>
                <h3 className="vicco-review-name">{activeReview.name}</h3>
                <span className="vicco-review-date">{activeReview.date}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {totalReviews > 1 && (
            <button className="vicco-slider-nav next" onClick={handleNext} aria-label="Next Review">
              <ChevronRight size={22} color="white" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

