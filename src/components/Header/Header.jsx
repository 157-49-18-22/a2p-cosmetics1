import React, { useState } from 'react';
import { ShoppingBag, User, Heart, Search, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`beauty-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-content">
        <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <div className="beauty-logo">
          <img src="/A2P final logo.png" alt="A2P Cosmetics" className="header-logo-img" />
        </div>

        <nav className={`beauty-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><a href="/" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#brands" onClick={() => setIsMenuOpen(false)}>Brands</a></li>
            <li><a href="#categories" onClick={() => setIsMenuOpen(false)}>Categories</a></li>
            <li><a href="#about" onClick={() => setIsMenuOpen(false)}>About Us</a></li>
            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
          </ul>
        </nav>

        <div className="header-icons">
          <button className="header-icon-btn search-icon"><Search size={18} /></button>
          <button className="header-icon-btn wishlist-icon"><Heart size={18} /></button>
          <button className="header-icon-btn user-icon"><User size={18} /></button>
          <button className="header-icon-btn cart-badge-btn">
            <ShoppingBag size={18} />
            <span className="cart-count">3</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
