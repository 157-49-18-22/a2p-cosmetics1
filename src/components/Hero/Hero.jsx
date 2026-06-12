
import './Hero.css';

const Hero = () => {
  return (
    <section 
      className="hero-static" 
      onClick={() => window.location.href = '/facecream'}
      style={{ cursor: 'pointer' }}
    >
      <img src="/bg.jpg" alt="A2P Skincare Banner Desktop" className="hero-banner-img desktop-banner" />
      <img src="/bg1.png" alt="A2P Skincare Banner Mobile" className="hero-banner-img mobile-banner" />
    </section>
  );
};

export default Hero;
