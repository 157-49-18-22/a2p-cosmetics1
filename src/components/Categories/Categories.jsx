import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Sparkles, Waves, Flower, ArrowRight, Layers } from 'lucide-react';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  const getIcon = (index) => {
    const icons = [
      <Droplet size={24} color="white" strokeWidth={1.5} />,
      <Sparkles size={24} color="white" strokeWidth={1.5} />,
      <Waves size={24} color="white" strokeWidth={1.5} />,
      <Flower size={24} color="white" strokeWidth={1.5} />
    ];
    return icons[index % icons.length];
  };

  if (loading) {
     return (
        <section className="explore-categories">
           <div className="container text-center">
              <p>Loading Categories...</p>
           </div>
        </section>
     );
  }

  return (
    <section className="explore-categories">
      <div className="container">
        <div className="section-title">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Explore Our <span className="gradient-text">Categories</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            From skincare essentials to glamorous makeup, find everything you need for your beauty routine
          </motion.p>
        </div>

        <div className="categories-grid">
          {categories.length === 0 ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Layers size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>No categories found.</p>
             </div>
          ) : categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              className="cat-card-next"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="cat-image-wrapper">
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200'} 
                  alt={cat.name} 
                  className="cat-bg-image" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200'; }}
                />
                <div className="cat-overlay"></div>
              </div>

              <div className="cat-content">
                <div className="cat-header">
                  <div className="icon-badge">
                    {getIcon(index)}
                  </div>
                  <span className="product-count-badge">{cat.status}</span>
                </div>

                <div className="cat-bottom-content">
                  <div className="cat-info">
                    <h3>{cat.name}</h3>
                    <p>Experience the finest {cat.name} products</p>
                  </div>

                  <div className="cat-action">
                    <span>Explore Now</span>
                    <div className="arrow-circle">
                      <ArrowRight size={16} />
                    </div>
                  </div>
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
