import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search, Menu, X, LayoutDashboard, UserCheck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const { cartItems, setIsCartOpen } = useCart();
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

        <Link to="/" className="beauty-logo">
          <img src="/A2P%20final%20logo.png" alt="A2P Cosmetics" className="header-logo-img" />
        </Link>

        <nav className={`beauty-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/facewash" onClick={() => setIsMenuOpen(false)}>Face Wash</Link></li>
            <li><Link to="/faceserum" onClick={() => setIsMenuOpen(false)}>Face Serum</Link></li>
            <li><Link to="/facecream" onClick={() => setIsMenuOpen(false)}>Face Cream</Link></li>
            <li><Link to="/bodywash" onClick={() => setIsMenuOpen(false)}>Body Wash</Link></li>
            <li><Link to="/articles" onClick={() => setIsMenuOpen(false)}>Journal</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link></li>

          </ul>
        </nav>

        <div className="header-icons">
          <button className="header-icon-btn search-icon"><Search size={18} /></button>
          <button className="header-icon-btn wishlist-icon"><Heart size={18} /></button>
          <button className="header-icon-btn user-icon"><User size={18} /></button>
          <button className="header-icon-btn cart-badge-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={18} />
            {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
