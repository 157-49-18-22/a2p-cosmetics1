import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Instagram, Twitter, Facebook, ChevronDown, CheckCircle2, Sparkles, Leaf, Droplets } from 'lucide-react';

import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pageRef = useRef(null);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days within India. International shipping may take 7-14 business days depending on the destination."
    },
    {
      question: "Are your products suitable for sensitive skin?",
      answer: "Yes! All A2P products are dermatologically tested and formulated with natural, science-backed ingredients designed to be gentle yet effective on all skin types, including sensitive skin."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day hassle-free return policy. If you're not completely satisfied with your purchase, you can return it within 30 days for a full refund or exchange."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location and are calculated at checkout."
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page unique-experience" ref={pageRef}>
      {/* Visual Progress Bar */}
      <div className="beauty-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Premium Background Layer */}
      <div className="premium-bg-overlay"></div>
      <div className="bg-animation-container">
        <div className="gradient-sphere gp-1"></div>
        <div className="gradient-sphere gp-2"></div>
        <div className="gradient-sphere gp-3"></div>
      </div>


      <section className="contact-hero-v3">
        <div className="container">
          <div className="hero-v3-inner">
            <div className="hero-badge-v3 animate-fade-in">
              <span className="dot"></span>
              Our experts are online
            </div>
            <h1 className="parallax-text">
              <span className="line">Beyond Beauty</span>
              <span className="line text-gradient">Connect with A2P</span>
            </h1>
            <p className="hero-desc animate-up">
              We're redefining skincare, one conversation at a time.
            </p>
            <div className="scroll-indicator">
              <p>Scroll to explore</p>
              <div className="mouse-wheel">
                <div className="wheel"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container main-content-v3">
        <div className="master-grid">
          {/* Quick Contact Cards - Hover 3D Effect */}
          <div className="contact-side-cards">
            {[
              { icon: <Phone />, label: "Call Us", val: "+91 98765 43210", color: "#ff6b81" },
              { icon: <Mail />, label: "Email Us", val: "support@a2p.com", color: "#6c5ce7" },
              { icon: <MessageSquare />, label: "Live Chat", val: "Active Now", color: "#2ed573" }
            ].map((card, i) => (
              <div key={i} className="magnetic-card animate-left" style={{'--card-color': card.color}}>
                <div className="m-card-icon">{card.icon}</div>
                <div className="m-card-info">
                  <span className="m-label">{card.label}</span>
                  <p className="m-value">{card.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Glass Form with Floating Labels */}
          <div className="form-portal animate-up">
            <div className="portal-glass">
              <div className="portal-header">
                <h2>Share Your Story</h2>
                <p>We listen, we care, we formulate for you.</p>
              </div>

              {submitted ? (
                <div className="portal-success">
                  <div className="sparkle-wrap">
                    <Sparkles size={48} color="#ff6b81" />
                  </div>
                  <h3>Message Delivered</h3>
                  <p>Check your email for a confirmation from our skin experts.</p>
                  <button onClick={() => setSubmitted(false)} className="classic-btn">Return to form</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="portal-form">
                  <div className="input-field">
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                    <label>Your Name</label>
                    <div className="border-line"></div>
                  </div>
                  <div className="input-field">
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    <label>Email Address</label>
                    <div className="border-line"></div>
                  </div>
                  <div className="input-field">
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                    <label>Subject</label>
                    <div className="border-line"></div>
                  </div>
                  <div className="input-field message">
                    <textarea name="message" value={formData.message} onChange={handleChange} required></textarea>
                    <label>Your Message</label>
                    <div className="border-line"></div>
                  </div>
                  <button type="submit" className="portal-submit">
                    <span>Dispatch Message</span>
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Interactive FAQ - Reveal on Scroll */}
        <div className="faq-v3-section animate-up">
          <div className="faq-v3-sidebar">
            <h2>Common <span>Curiosities</span></h2>
            <div className="faq-stats-grid">
              <div className="f-stat"><span>5k+</span><p>Daily Queries</p></div>
              <div className="f-stat"><span>10min</span><p>Avg. Reply</p></div>
            </div>
          </div>
          <div className="faq-v3-content">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`v3-faq-item ${activeFaq === index ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
              >
                <div className="v3-faq-header">
                  <h3>0{index + 1}. {faq.question}</h3>
                  <div className="v3-toggle-icon"></div>
                </div>
                <div className="v3-faq-body">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Showcase - The "Wow" Factor */}
      <section className="cosmetic-experience">
        <div className="experience-overlay"></div>
        <div className="container">
          <div className="exp-grid">
            <div className="exp-item animate-up">
              <div className="exp-num">01</div>
              <h3>Purity First</h3>
              <p>Everything we make is dermatologically tested and ethically sourced.</p>
            </div>
            <div className="exp-item animate-up delay-1">
              <div className="exp-num">02</div>
              <h3>Science Backed</h3>
              <p>Formulations developed by leading dermatologists across the globe.</p>
            </div>
            <div className="exp-item animate-up delay-2">
              <div className="exp-num">03</div>
              <h3>Results Guaranteed</h3>
              <p>Visible changes in your skin health within 21 days of routine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer-joined Map - Unique Split UI */}
      <div className="footer-map-v3">
        <div className="f-map-container">
          <div className="f-map-info animate-left">
            <span className="map-badge">Our Studio</span>
            <h2>Where the Magic Happens</h2>
            <p>123 Skin Care Ave, Beauty District, Mumbai</p>
            <button className="gold-btn">Open Map</button>
          </div>
          <div className="f-map-visual animate-right">
             <div className="map-glow-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
