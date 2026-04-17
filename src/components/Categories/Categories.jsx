import React from 'react';
import { motion } from 'framer-motion';
import './Categories.css';

const categories = [
  { id: 1, name: 'Face Wash', image: '/skincare.png', count: '15+ Products' },
  { id: 2, name: 'Face Serum', image: '/hero-cosmetic.png', count: '10+ Products' },
  { id: 3, name: 'Face Cream', image: '/bestsellers.png', count: '12+ Products' }, 
  { id: 4, name: 'Body Wash', image: '/skincare.png', count: '8+ Products' }, 
  { id: 5, name: 'Hair Care', image: '/makeup.png', count: '20+ Products' }, 
];

const Categories = () => {
  return (
    <section className="section categories" id="collections">
      <div className="container">
        <div className="section-header">
          <span className="subtitle">Collections</span>
          <h2>Shop by Category</h2>
        </div>

        <div className="categories-grid">
          {categories.map((cat, index) => (
            <motion.div 
              key={cat.id}
              className="category-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="category-image">
                <img src={cat.image} alt={cat.name} />
                <div className="category-overlay">
                  <span className="product-count">{cat.count}</span>
                  <h3>{cat.name}</h3>
                  <a href={`#${cat.name.toLowerCase()}`} className="explore-link">Explore Collection</a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
