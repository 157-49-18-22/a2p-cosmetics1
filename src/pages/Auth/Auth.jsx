import API_BASE_URL from '../../apiConfig.js';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await fetch(`${API_BASE_URL}/customers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (res.ok) {
          login({ id: data.id, name: data.name, email: data.email, tier: data.tier });
          navigate('/');
        } else {
          setError(data.error || 'Invalid email or password.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE_URL}/customers/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg('Account created successfully! Please sign in.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        } else {
          setError(data.error || 'Failed to create account.');
        }
      }
    } catch (err) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="al-page">
      {/* Left Panel — Editorial Image */}
      <div className="al-image-panel">
        <video
          className="al-bg-image"
          src="/logvid.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="al-image-overlay">
          <p className="al-image-quote">Beauty is a Ritual</p>
          <div className="al-image-divider" />
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="al-form-panel">
        <div className="al-form-inner">

          {/* Logo */}
          <Link to="/" className="al-logo-link">
            <img src="/A2P%20final%20logo.png" alt="A2P Cosmetics" className="al-logo" />
          </Link>

          {/* Mode Toggle */}
          <div className="al-toggle">
            <button
              type="button"
              className={`al-toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => switchMode(true)}
            >
              <motion.span 
                className="al-toggle-text"
                animate={{ 
                  scale: isLogin ? 1.1 : 1,
                  fontWeight: isLogin ? 700 : 600
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                Sign In
              </motion.span>
              {isLogin && (
                <motion.div
                  layoutId="active-pill"
                  className="al-toggle-active-bg"
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
            </button>
            <button
              type="button"
              className={`al-toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => switchMode(false)}
            >
              <motion.span 
                className="al-toggle-text"
                animate={{ 
                  scale: !isLogin ? 1.1 : 1,
                  fontWeight: !isLogin ? 700 : 600
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                Create Account
              </motion.span>
              {!isLogin && (
                <motion.div
                  layoutId="active-pill"
                  className="al-toggle-active-bg"
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    mass: 0.8
                  }}
                />
              )}
            </button>
          </div>

          {/* Header */}
          <div className="al-header">
            <h1 className="al-title">
              {isLogin ? 'Welcome back, beautiful' : 'Create your account'}
            </h1>
            <p className="al-subtitle">
              {isLogin
                ? 'Enter your details to access your ritual sanctuary.'
                : 'Join us for a personalized beauty experience.'}
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                className="al-alert al-alert--success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {successMsg}
              </motion.div>
            )}
            {error && (
              <motion.div
                className="al-alert al-alert--error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form className="al-form" onSubmit={handleSubmit}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  className="al-field"
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1.75rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="al-label" htmlFor="name">FULL NAME</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="al-input"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="al-field">
              <label className="al-label" htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                name="email"
                type="email"
                className="al-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="al-field">
              <div className="al-label-row">
                <label className="al-label" htmlFor="password">PASSWORD</label>
                {isLogin && <span className="al-forgot">Forgot password?</span>}
              </div>
              <div className="al-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="al-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button type="button" className="al-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  className="al-field"
                  key="confirm-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1.75rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="al-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                  <div className="al-input-wrap">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="al-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required={!isLogin}
                      autoComplete="new-password"
                    />
                    <button type="button" className="al-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && (
              <div className="al-remember">
                <label className="al-checkbox-label">
                  <input type="checkbox" className="al-checkbox" />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            <button type="submit" className="al-submit" disabled={loading}>
              {loading ? (
                <span className="al-spinner" />
              ) : (
                isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div className="al-social">
            <div className="al-divider">
              <span>OR CONTINUE WITH</span>
            </div>
            <div className="al-social-grid">
              <button className="al-social-btn">
                <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.6 0 326.3 0 249.8c0-98.6 29.5-232.2 119.1-362.5C200.9 49.3 358.4 0 412.2 0c152.2 0 226.4 91.5 264.9 91.5zM351.1 921.9c32.4 0 37.9 6.4 65.9 6.4 28.7 0 31.9-6.4 65.9-6.4 10.2 0 20.4-1.3 30.6-2.6-31.9-47.8-50.1-100.3-50.1-155.5 0-93.8 50.8-174.2 130.3-220.4-42.2-74.3-119.1-116.5-207.1-116.5-100.3 0-186.3 61.6-235.5 61.6-44.2 0-113.6-57.2-173.3-57.2-13.4 0-26.8 1.3-39.5 4.5.6 5.8.6 11.6.6 17.3 0 90.9 45.5 175.6 96.3 244.3 73.7 99.7 155.5 223.5 316.9 223.5z"/></svg>
                APPLE
              </button>
              <button className="al-social-btn">
                <svg width="16" height="16" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg"><path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285f4"/><path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34a853"/><path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#fbbc04"/><path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#ea4335"/></svg>
                GOOGLE
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Auth;
