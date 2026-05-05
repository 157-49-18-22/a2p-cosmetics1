import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const navigate = useNavigate();

  if (!showLoginModal) return null;

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate('/login');
  };

  return (
    <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
      <motion.div 
        className="login-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <button className="modal-close" onClick={() => setShowLoginModal(false)}>
          <X size={24} />
        </button>

        <div className="modal-icon">
          <Lock size={32} />
        </div>

        <h2>Login Required</h2>
        <p>Please login to add items to your cart or wishlist and access your personal dashboard.</p>

        <button className="modal-login-btn" onClick={handleLoginRedirect}>
          Login Now
        </button>

        <div className="modal-footer">
          Don't have an account? 
          <Link to="/signup" className="modal-link" onClick={() => setShowLoginModal(false)}>Sign Up</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;
