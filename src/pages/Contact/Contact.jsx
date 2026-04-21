import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Instagram, Twitter, Facebook, ChevronDown, CheckCircle2, Sparkles, Leaf, Droplets, Globe } from 'lucide-react';
import Lottie from 'lottie-react';
import girlAnimation from '../../assets/girl-face.json';
import './Contact.css';

const Contact = () => {
  const LottieComponent = Lottie?.default || Lottie;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mapState, setMapState] = useState('global'); // 'global', 'zooming', 'local'
  const pageRef = useRef(null);

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

  const handleZoomToggle = () => {
    if (mapState === 'global') {
      setMapState('zooming');
      setTimeout(() => setMapState('local'), 1500); // Transition to real map after 1.5s
    } else {
      setMapState('global');
    }
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

          <div className="form-portal animate-up">
            <div className="portal-glass">
              <div className="portal-header-wrapper">
                <div className="portal-header">
                  <h2>Share Your Story</h2>
                  <p>We listen, we care, we formulate for you.</p>
                </div>
                <div className="portal-lottie">
                  {LottieComponent && (
                    <LottieComponent
                      animationData={girlAnimation}
                      loop={true}
                      style={{ width: '120px', height: '120px' }}
                    />
                  )}
                </div>
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

      {/* Google-Maps Styled Earth Section */}
      <div className="footer-map-v3 space-section">
        <div className={`f-map-container ${mapState}`}>
          <div className="f-map-info animate-left">
            <span className="map-badge">Visit Us</span>
            <h2>Locate Our <span>Studio</span></h2>
            <p>From a global vision to your doorstep. Experience our science-backed beauty in person.</p>
            <div className="location-box-v3">
              <MapPin size={24} className="pin-main" />
              <div>
                <h4>Main Studio</h4>
                <p>A2P Cosmetics, Mumbai, India</p>
              </div>
            </div>
            <button className={`earth-zoom-btn ${mapState !== 'global' ? 'active' : ''}`} onClick={handleZoomToggle}>
              {mapState === 'global' ? 'Explore Location' : 'Back to Global'}
              <Globe size={18} />
            </button>
          </div>
          
          <div className="f-map-visual animate-right">
            <div className="google-style-map">
              {/* Stage 1: Earth Sphere */}
              <div className="earth-frame">
                <div className="earth-sphere">
                  <div className="earth-map-texture"></div>
                  <div className="earth-clouds"></div>
                  <div className="earth-atmosphere"></div>
                </div>

                <div className="earth-shadow"></div>
              </div>
              
              {/* Stage 2: Real Google Map */}
              <div className="real-map-embed">
                <iframe 
                  title="A2P Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120638.16327092176!2d72.8094625!3d19.102377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1713636545678!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Transition Layer */}
              <div className="map-curtain"></div>
            </div>
            
            <div className="space-star s1"></div>
            <div className="space-star s2"></div>
            <div className="space-star s3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
