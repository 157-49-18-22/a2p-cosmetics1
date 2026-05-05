import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, User, Heart, Search, Menu, X, 
  LayoutDashboard, UserCheck, ShieldCheck, 
  Package, MapPin, Bookmark, LogOut, Mail, Settings, Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '../../context/AuthContext';
import './Header.css';


const Header = () => {
  const { cartItems, setIsCartOpen } = useCart();
  const { wishlistItems, setIsWishlistOpen } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);


  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', () => handleScroll());
    return () => window.removeEventListener('scroll', () => handleScroll());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
        setIsLocked(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      setIsUserDropdownOpen(false);
    }
  };

  const toggleUserDropdown = (e) => {
    e.stopPropagation();
    const newState = !isLocked;
    setIsLocked(newState);
    setIsUserDropdownOpen(newState);
  };

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
          <button 
            className="header-icon-btn search-icon" 
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={18} />
          </button>
          
          <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

          <button className="header-icon-btn wishlist-icon" onClick={() => setIsWishlistOpen(true)}>
            <Heart size={18} />
            {wishlistItems.length > 0 && <span className="cart-count">{wishlistItems.length}</span>}
          </button>

          <div 
            className="user-dropdown-wrapper" 
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              className={`header-icon-btn user-icon ${isUserDropdownOpen ? 'active' : ''}`}
              onClick={toggleUserDropdown}
            >
              <User size={18} />
            </button>

            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.div 
                  className="user-dropdown-menu"
                  initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="dropdown-header">
                    {user ? (
                      <>
                        <div className="user-avatar-large">
                          <User size={22} />
                        </div>
                        <div className="user-info">
                          <span className="welcome-text">Welcome, {user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </>
                    ) : (
                      <div className="user-info" style={{ width: '100%' }}>
                        <span className="welcome-text">Welcome to A2P</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Log in to track orders and more</p>
                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsUserDropdownOpen(false)}>
                          Login / Join
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="dropdown-divider"></div>

                  {user && (
                    <div className="dropdown-links">
                      {[
                        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Admin Dashboard" },
                        { to: "/skin-profile", icon: Sparkles, label: "Skin Profile" },
                        { to: "/my-orders", icon: Package, label: "My Orders" },
                        { to: "/my-addresses", icon: MapPin, label: "My Addresses" },
                        { to: "/saved-items", icon: Bookmark, label: "Saved Items" },
                        { to: "/wishlist", icon: Heart, label: "Wishlist" },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + index * 0.03, duration: 0.3 }}
                        >
                          <Link to={item.to} className="dropdown-item" onClick={() => { setIsUserDropdownOpen(false); setIsLocked(false); }}>
                            <item.icon size={18} className="item-icon" />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      ))}
                      
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                      >
                        <button 
                          className="dropdown-item logout-btn"
                          onClick={() => {
                            logout();
                            setIsUserDropdownOpen(false);
                          }}
                        >
                          <LogOut size={18} className="item-icon" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

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

