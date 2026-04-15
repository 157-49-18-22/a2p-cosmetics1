import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';
import './Testimonials.css';

const reviews = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    date: '2025-01-15',
    rating: 5,
    text: '"The Velvet Matte Lipstick is absolutely stunning! The color lasts all day and feels so luxurious."',
    product: 'Velvet Matte Lipstick',
    initial: 'S',
    color: '#ec4899'
  },
  {
    id: 2,
    name: 'Emily Rodriguez',
    date: '2025-01-10',
    rating: 5,
    text: '"My skin has never looked better! The Radiant Glow Face Wash is a game-changer."',
    product: 'Radiant Glow Face Wash',
    initial: 'E',
    color: '#ef4444'
  },
  {
    id: 3,
    name: 'Jessica Chen',
    date: '2025-01-08',
    rating: 5,
    text: '"I\'m obsessed with the foundation! It gives such a natural, flawless finish."',
    product: 'Flawless Finish Foundation',
    initial: 'J',
    color: '#e11d48'
  },
  {
    id: 4,
    name: 'Amanda Foster',
    date: '2025-01-05',
    rating: 5,
    text: '"The Hydra-Luxe Moisturizer keeps my skin hydrated all day. Worth every penny!"',
    product: 'Hydra-Luxe Moisturizer',
    initial: 'A',
    color: '#f472b6'
  }
];

const Testimonials = () => {
  return (
    <section className="section testimonials" id="reviews">
      <div className="container">
        <div className="section-header">
          <h2 className="testimonials-heading">What Our <span className="highlight-pink">Customers Say</span></h2>
          <p className="testimonials-subheading">Real stories from real people who love our products</p>
        </div>

        <div className="testimonials-grid">
          {reviews.map((review, index) => (
            <motion.div 
              key={review.id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="stars">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              
              <p className="review-text">{review.text}</p>
              
              <div className="product-tag-bubble">
                {review.product}
              </div>

              <div className="user-info">
                <div className="avatar" style={{ backgroundColor: review.color }}>
                  {review.initial}
                </div>
                <div className="user-details">
                  <div className="user-row">
                    <h3>{review.name}</h3>
                    <div className="verified">
                      <CheckCircle size={14} className="check-icon" />
                      <span>Verified</span>
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
