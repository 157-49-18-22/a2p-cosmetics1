import React from 'react';
import { ShoppingBag, User, Heart, Search } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="beauty-header">
      <div className="container header-content">
        <div className="beauty-logo">
          <img src="/A2P final logo.png" alt="A2P Cosmetics" className="header-logo-img" />
        </div>

        <nav className="beauty-nav">
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="#brands">Brands</a></li>
            <li><a href="#categories">Categories</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <div className="header-icons">
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn"><Heart size={20} /></button>
          <button className="icon-btn"><User size={20} /></button>
          <button className="icon-btn cart-badge-btn">
            <ShoppingBag size={20} />
            <span className="cart-count">3</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
