import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="section newsletter">
      <div className="container">
        <motion.div 
          className="newsletter-box"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="newsletter-content">
            <h2>Join the Aura Club</h2>
            <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn btn-primary">
                Subscribe <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
