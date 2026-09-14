import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Step 1: Send OTP for Signup or Direct Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const res = await fetch(`${API_BASE_URL}/customers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (res.ok) {
          login({ id: data.id, name: data.name, email: data.email, tier: data.tier, role: data.role || 'Customer' });
          navigate('/');
        } else {
          setError(data.error || 'Invalid email or password.');
        }
      } else {
        // Signup: Validate fields before requesting OTP
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (!formData.phone || formData.phone.length < 10) {
          setError('Please enter a valid 10-digit phone number.');
          setLoading(false);
          return;
        }

        // Send OTP to email
        const res = await fetch(`${API_BASE_URL}/customers/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        const data = await res.json();
        if (res.ok) {
          setOtpStep(true);
          setResendTimer(30);
          setSuccessMsg('OTP verification code sent to your email!');
          if (data.devOtp) {
            setDevOtpHint(data.devOtp);
          }
        } else {
          setError(data.error || 'Failed to send OTP. Please check email address.');
        }
      }
    } catch (err) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/customers/verify-otp-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otp: otp.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/customers/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setResendTimer(30);
        setSuccessMsg('A new OTP has been sent to your email.');
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
      } else {
        setError(data.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Error resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setOtpStep(false);
    setOtp('');
    setDevOtpHint('');
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
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

          {/* Mode Toggle (Hidden during OTP step) */}
          {!otpStep && (
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
          )}

          {/* Header */}
          <div className="al-header">
            {otpStep ? (
              <>
                <button 
                  type="button" 
                  className="al-back-btn"
                  onClick={() => { setOtpStep(false); setError(''); setSuccessMsg(''); }}
                >
                  <ArrowLeft size={16} /> Back to details
                </button>
                <h1 className="al-title">Verify Your Email</h1>
                <p className="al-subtitle">
                  We sent a 6-digit verification code to <strong style={{ color: '#0f172a' }}>{formData.email}</strong>
                </p>
              </>
            ) : (
              <>
                <h1 className="al-title">
                  {isLogin ? 'Welcome back, beautiful' : 'Create your account'}
                </h1>
                <p className="al-subtitle">
                  {isLogin
                    ? 'Enter your details to access your ritual sanctuary.'
                    : 'Join us for a personalized beauty experience.'}
                </p>
              </>
            )}
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

          {/* OTP Verification Form */}
          {otpStep ? (
            <form className="al-form" onSubmit={handleVerifyOtp}>
              <div className="al-field">
                <label className="al-label" htmlFor="otp-input">ENTER 6-DIGIT OTP</label>
                <div className="al-otp-wrap">
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    className="al-input al-otp-input"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="al-submit" disabled={loading || otp.length < 6}>
                {loading ? <span className="al-spinner" /> : 'VERIFY & CREATE ACCOUNT'}
              </button>

              <div className="al-resend-row">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  className="al-resend-btn"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResendOtp}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          ) : (
            /* Main Login / Register Details Form */
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

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    className="al-field"
                    key="phone-field"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1.75rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="al-label" htmlFor="phone">PHONE NUMBER *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="al-input"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required={!isLogin}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      autoComplete="tel"
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
                  isLogin ? 'SIGN IN' : 'GET OTP & CREATE ACCOUNT'
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;
