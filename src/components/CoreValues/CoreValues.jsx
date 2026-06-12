import React, { useState, useEffect, useRef } from 'react';
import './CoreValues.css';

const valuesData = [
  {
    id: 1,
    title: "COMMITMENT TO PURITY",
    description: "Rooted in the timeless wisdom of nature, we are dedicated to offering natural and holistic solutions that promote health, beauty, and overall well-being. Every product reflects our unwavering commitment to authentic, clean practices.",
    image: "/natural_skincare_hero.png"
  },
  {
    id: 2,
    title: "HOLISTIC WELLNESS",
    description: "We believe in nurturing the mind, body, and spirit. By using carefully selected organic ingredients, we craft products that help protect, rejuvenate, and enhance your well-being, offering a truly holistic approach to self-care.",
    image: "/hydrating_cream_hero.png"
  },
  {
    id: 3,
    title: "SUSTAINABLE & ETHICAL",
    description: "We are passionately committed to our planet and its creatures. Our eco-friendly approach and cruelty-free practices ensure that while we nurture your skin, we also protect the environment for future generations.",
    image: "/natural_skincare_hero.png"
  }
];

const CoreValues = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0);
  const containerRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px', // Trigger when section is within the middle/upper part of the screen
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.indexOf(entry.target);
          if (index !== -1) {
            setActiveIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    const handleMobileScroll = () => {
      if (window.innerWidth > 992) return; // Only process on mobile
      if (!mobileWrapRef.current) return;
      
      const el = mobileWrapRef.current;
      const rect = el.getBoundingClientRect();
      const maxScroll = el.offsetHeight - window.innerHeight;
      
      if (maxScroll <= 0) return;
      
      let progress = -rect.top / maxScroll;
      progress = Math.max(0, Math.min(1, progress));
      setMobileScrollProgress(progress);
    };

    window.addEventListener('scroll', handleMobileScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleMobileScroll);
    };
  }, []);

  return (
    <section className="cv-container" ref={containerRef}>
      <div className="cv-title-header">
        <h2>CORE VALUES</h2>
      </div>

      <div className="cv-layout">
        {/* Left Side: Scrollable Text Content */}
        <div className="cv-left">
          <div className="cv-timeline-line"></div>

          {valuesData.map((item, index) => (
            <div
              key={item.id}
              className={`cv-text-block ${index === activeIndex ? 'active' : ''}`}
              ref={el => sectionRefs.current[index] = el}
            >
              <div className="cv-timeline-dot">
                <div className="cv-timeline-dot-inner"></div>
              </div>
              <div className="cv-content-wrap">
                <h3 className="cv-block-title">{item.title}</h3>
                <p className="cv-block-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Sticky Images */}
        <div className="cv-right">
          <div className="cv-sticky-container">
            {valuesData.map((item, index) => {
              let posClass = 'next';
              if (index === activeIndex) posClass = 'active';
              else if (index < activeIndex) posClass = 'prev';

              return (
                <div
                  key={item.id}
                  className={`cv-image-layer ${posClass}`}
                  style={{ backgroundImage: `url(${item.image})` }}
                  title={`Page ${index + 1}`}
                >
                  {/* Subtle shadow overlay to simulate depth on flipped page */}
                  <div className="cv-page-shadow"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile View: Sticky Horizontal Scroll ── */}
      <div className="cv-mobile-wrapper" ref={mobileWrapRef}>
        <div className="cv-mobile-sticky">
          <div 
            className="cv-mobile-scroll-track" 
            style={{ transform: `translateX(-${mobileScrollProgress * (valuesData.length - 1) * 100}vw)` }}
          >
            {valuesData.map((item) => (
              <div className="cv-mobile-card" key={`mobile-${item.id}`}>
                <div className="cv-mobile-card-img" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="cv-mobile-card-content">
                  <h3 className="cv-mobile-card-title">{item.title}</h3>
                  <p className="cv-mobile-card-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
