import React from 'react';
import { MapPin, Phone, Mail, Share2, Globe, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="footer-logo-link">
              <img src="/A2P final logo.png" alt="A2P Cosmetics" className="footer-logo-img" />
            </a>
            <p>Elevating beauty through science and nature. Our luxury cosmetics are crafted for those who demand excellence.</p>
            <div className="social-links">
              <a href="#"><Share2 size={20} /></a>
              <a href="#"><Globe size={20} /></a>
              <a href="#"><Heart size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Shop</h3>
            <ul>
              <li><a href="#">Skincare</a></li>
              <li><a href="#">Makeup</a></li>
              <li><a href="#">Fragrance</a></li>
              <li><a href="#">Gift Cards</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <ul>
              <li><MapPin size={18} /> 123 Beauty Lane, Glow City</li>
              <li><Phone size={18} /> +1 (555) AURA-GLO</li>
              <li><Mail size={18} /> hello@a2pcosmetics.com</li>
            </ul>
          </div>
        </div>

        {/* Cosmetic Landscape Animation */}
        <div className="footer-landscape">
          <img src="/cosmetic_landscape_footer_1776253078456.png" alt="Cosmetic Garden" className="landscape-img" />
          <div className="landscape-overlay"></div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 A2P AID 2 PINNACLE COSMETICS. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
