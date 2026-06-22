import { useState, useEffect } from 'react';
import './Hero.css';

const slides = [
  {
    desktopSrc: '/bg.jpg',
    mobileSrc: '/bg1.png',
    alt: 'A2P Skincare Banner',
    link: '/facecream',
  },
  {
    desktopSrc: '/fc desk.png',
    mobileSrc: '/fc mob.png',
    alt: 'A2P Face Cream Banner',
    link: '/facecream',
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-static">
      <div className="hero-slider-wrapper">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === current ? 'active' : ''}`}
            onClick={() => window.location.href = slide.link}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={slide.desktopSrc}
              alt={`${slide.alt} Desktop`}
              className="hero-banner-img desktop-banner"
            />
            <img
              src={slide.mobileSrc}
              alt={`${slide.alt} Mobile`}
              className="hero-banner-img mobile-banner"
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
