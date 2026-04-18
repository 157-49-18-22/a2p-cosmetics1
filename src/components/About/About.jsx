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
      {/* Animated Orbs */}
      <div className="about-bg-orb orb-1"></div>
      <div className="about-bg-orb orb-2"></div>
      <div className="about-bg-orb orb-3"></div>

      {/* Cosmetics Floating SVG Icons */}
      <div className="cosmetic-floats">

        {/* Lipstick */}
        <svg className="cf cf-1" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="40" width="20" height="35" rx="3" fill="#ff4d6d" opacity="0.7"/>
          <rect x="13" y="20" width="14" height="22" rx="2" fill="#d11149" opacity="0.8"/>
          <path d="M13 20 Q20 8 27 20" fill="#ff8fa3" opacity="0.9"/>
          <rect x="8" y="38" width="24" height="5" rx="2" fill="#c0003c" opacity="0.6"/>
        </svg>

        {/* Perfume Bottle */}
        <svg className="cf cf-2" viewBox="0 0 50 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="5" width="8" height="10" rx="2" fill="#ff8fa3" opacity="0.8"/>
          <rect x="15" y="12" width="14" height="5" rx="1" fill="#ff4d6d" opacity="0.7"/>
          <rect x="8" y="25" width="34" height="50" rx="10" fill="#ff8fa3" opacity="0.5"/>
          <ellipse cx="25" cy="28" rx="14" ry="6" fill="#ffb3c1" opacity="0.6"/>
          <rect x="14" y="32" width="22" height="3" rx="1" fill="#ff4d6d" opacity="0.5"/>
        </svg>

        {/* 5-Petal Flower */}
        <svg className="cf cf-3" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="30" cy="14" rx="7" ry="13" fill="#ffb3c1" opacity="0.75"/>
          <ellipse cx="30" cy="46" rx="7" ry="13" fill="#ffb3c1" opacity="0.75"/>
          <ellipse cx="14" cy="30" rx="13" ry="7" fill="#ffb3c1" opacity="0.75"/>
          <ellipse cx="46" cy="30" rx="13" ry="7" fill="#ffb3c1" opacity="0.75"/>
          <ellipse cx="14" cy="14" rx="8" ry="13" transform="rotate(45 14 14)" fill="#ff8fa3" opacity="0.65"/>
          <ellipse cx="46" cy="46" rx="8" ry="13" transform="rotate(45 46 46)" fill="#ff8fa3" opacity="0.65"/>
          <ellipse cx="46" cy="14" rx="8" ry="13" transform="rotate(-45 46 14)" fill="#ff8fa3" opacity="0.65"/>
          <ellipse cx="14" cy="46" rx="8" ry="13" transform="rotate(-45 14 46)" fill="#ff8fa3" opacity="0.65"/>
          <circle cx="30" cy="30" r="8" fill="#ff4d6d" opacity="0.85"/>
        </svg>

        {/* Serum Drop */}
        <svg className="cf cf-4" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 5 C20 5 5 28 5 40 A15 15 0 0 0 35 40 C35 28 20 5 20 5Z" fill="#ff8fa3" opacity="0.6"/>
          <path d="M20 18 C20 18 11 33 11 40 A9 9 0 0 0 22 49" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" fill="none"/>
        </svg>

        {/* 4-Point Star Sparkle */}
        <svg className="cf cf-5" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 2 L28 22 L48 25 L28 28 L25 48 L22 28 L2 25 L22 22 Z" fill="#ff4d6d" opacity="0.7"/>
          <circle cx="25" cy="25" r="4" fill="#fff" opacity="0.8"/>
        </svg>

        {/* Leaf */}
        <svg className="cf cf-6" viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 65 C25 65 5 40 8 20 C10 5 25 2 25 2 C25 2 40 5 42 20 C45 40 25 65 25 65Z" fill="#ff8fa3" opacity="0.55"/>
          <line x1="25" y1="65" x2="25" y2="10" stroke="#ff4d6d" strokeWidth="1.5" opacity="0.5"/>
          <line x1="25" y1="30" x2="13" y2="22" stroke="#ff4d6d" strokeWidth="1" opacity="0.4"/>
          <line x1="25" y1="40" x2="37" y2="30" stroke="#ff4d6d" strokeWidth="1" opacity="0.4"/>
        </svg>

        {/* Lip Gloss Tube */}
        <svg className="cf cf-7" viewBox="0 0 30 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="0" width="20" height="60" rx="5" fill="#ff4d6d" opacity="0.65"/>
          <rect x="5" y="0" width="20" height="20" rx="5" fill="#d11149" opacity="0.7"/>
          <rect x="8" y="60" width="14" height="30" rx="3" fill="#ffb3c1" opacity="0.6"/>
          <rect x="5" y="57" width="20" height="6" rx="2" fill="#c0003c" opacity="0.5"/>
        </svg>

        {/* Heart */}
        <svg className="cf cf-8" viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 42 C25 42 3 27 3 15 A11 11 0 0 1 25 10 A11 11 0 0 1 47 15 C47 27 25 42 25 42Z" fill="#ff4d6d" opacity="0.65"/>
        </svg>

        {/* Bottle Cap Sparkle */}
        <svg className="cf cf-9" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="22" stroke="#ff8fa3" strokeWidth="2.5" fill="none" opacity="0.5"/>
          <circle cx="30" cy="30" r="12" fill="#ff4d6d" opacity="0.4"/>
          <path d="M30 10 L32 27 L30 30 L28 27 Z" fill="#ff4d6d" opacity="0.6"/>
          <path d="M30 50 L32 33 L30 30 L28 33 Z" fill="#ff4d6d" opacity="0.6"/>
          <path d="M10 30 L27 28 L30 30 L27 32 Z" fill="#ff4d6d" opacity="0.6"/>
          <path d="M50 30 L33 28 L30 30 L33 32 Z" fill="#ff4d6d" opacity="0.6"/>
        </svg>

        {/* 3-Point Sparkle */}
        <svg className="cf cf-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2 L22 18 L38 20 L22 22 L20 38 L18 22 L2 20 L18 18 Z" fill="#ffb3c1" opacity="0.8"/>
        </svg>

      </div>
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
