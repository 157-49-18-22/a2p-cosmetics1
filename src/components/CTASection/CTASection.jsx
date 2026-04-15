import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-background">
        <img src="/eye.jpg" alt="Radiance Naturally Yours" />
      </div>
      <div className="cta-content">
        <h2 className="fade-in-up">Radiance, Naturally Yours</h2>
        <p className="fade-in-up">Embrace your natural beauty with our scientifically-backed formulations</p>
      </div>
    </section>
  );
};

export default CTASection;
