import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, Recycle, FlaskConical } from 'lucide-react';
import './About.css';

const About = () => {
  const benefits = [
    {
      icon: <Leaf className="benefit-icon icon-pink" size={24} />,
      title: 'Natural Ingredients',
      description: 'We harness the power of nature’s botanicals for pure, effective beauty.'
    },
    {
      icon: <Heart className="benefit-icon icon-pink" size={24} />,
      title: 'Cruelty-Free',
      description: 'All our products are developed without animal testing.'
    },
    {
      icon: <Recycle className="benefit-icon icon-pink" size={24} />,
      title: 'Sustainable',
      description: 'Committed to eco-friendly packaging and ethical sourcing.'
    },
    {
      icon: <FlaskConical className="benefit-icon icon-pink" size={24} />,
      title: 'Science-Backed',
      description: 'Formulated with proven ingredients for visible results.'
    }
  ];

  return (
    <section className="section about" id="about">
      <div className="container about-container">
        <motion.div 
          className="about-image"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src="/about.png" alt="A2P Skincare journey" />
        </motion.div>

        <motion.div 
          className="about-content"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="about-brand">Aid 2 Pinnacle</span>
          <h2 className="about-heading">Your Journey to <span className="highlight-pink">Radiant Beauty</span></h2>
          <p className="about-description">
            At A2P, we believe beauty is a journey, not a destination. Our carefully crafted 
            cosmetics blend nature's finest ingredients with cutting-edge science to help you 
            reach your pinnacle of confidence and radiance.
          </p>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <div className="icon-wrapper">
                  {benefit.icon}
                </div>
                <div className="benefit-info">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
