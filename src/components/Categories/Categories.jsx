import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Sparkles, Waves, Flower, ArrowRight } from 'lucide-react';
import './Categories.css';

const categoriesData = [
  {
    id: 1,
    title: 'Skincare',
    desc: 'Nourish and protect your skin',
    products: '24 Products',
    icon: <Droplet size={28} color="white" strokeWidth={1.5} />
  },
  {
    id: 2,
    title: 'Makeup',
    desc: 'Express your unique beauty',
    products: '36 Products',
    icon: <Sparkles size={28} color="white" strokeWidth={1.5} />
  },
  {
    id: 3,
    title: 'Haircare',
    desc: 'Beautiful hair, naturally',
    products: '18 Products',
    icon: <Waves size={28} color="white" strokeWidth={1.5} />
  },
  {
    id: 4,
    title: 'Fragrance',
    desc: 'Signature scents for every moment',
    products: '12 Products',
    icon: <Flower size={28} color="white" strokeWidth={1.5} />
  }
];

const Categories = () => {
  return (
    <section className="explore-categories">
      <div className="container">
        <div className="section-title">
          <h2>Explore Our <span className="gradient-text">Categories</span></h2>
          <p>From skincare essentials to glamorous makeup, find everything you need for your beauty routine</p>
        </div>

        <div className="categories-grid">
          {categoriesData.map((cat, index) => (
            <motion.div 
              key={cat.id}
              className="cat-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="icon-wrapper">
                {cat.icon}
              </div>
              <h3>{cat.title}</h3>
              <p className="cat-desc">{cat.desc}</p>
              
              <div className="cat-footer">
                <span className="product-count">{cat.products}</span>
                <div className="arrow-btn">
                  <ArrowRight size={18} strokeWidth={2} />
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
