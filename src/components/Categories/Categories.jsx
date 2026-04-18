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
    icon: <Droplet size={24} color="white" strokeWidth={1.5} />,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1200'
  },
  {
    id: 2,
    title: 'Makeup',
    desc: 'Express your unique beauty',
    products: '36 Products',
    icon: <Sparkles size={24} color="white" strokeWidth={1.5} />,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'
  },
  {
    id: 3,
    title: 'Haircare',
    desc: 'Beautiful hair, naturally',
    products: '18 Products',
    icon: <Waves size={24} color="white" strokeWidth={1.5} />,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=1200'
  },
  {
    id: 4,
    title: 'Fragrance',
    desc: 'Signature scents for every moment',
    products: '12 Products',
    icon: <Flower size={24} color="white" strokeWidth={1.5} />,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200'
  }
];

const Categories = () => {
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
          {categoriesData.map((cat, index) => (
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
                <img src={cat.image} alt={cat.title} className="cat-bg-image" />
                <div className="cat-overlay"></div>
              </div>

              <div className="cat-content">
                <div className="cat-header">
                  <div className="icon-badge">
                    {cat.icon}
                  </div>
                  <span className="product-count-badge">{cat.products}</span>
                </div>

                <div className="cat-bottom-content">
                  <div className="cat-info">
                    <h3>{cat.title}</h3>
                    <p>{cat.desc}</p>
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
