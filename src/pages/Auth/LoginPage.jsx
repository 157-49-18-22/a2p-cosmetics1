import API_BASE_URL from '../../apiConfig.js';
import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Hyperspeed from './Hyperspeed';
import './LoginPage.css';

const API = API_BASE_URL;

// Stable reference — must not be recreated on each keystroke or Hyperspeed remounts
const LOGIN_HYPERSPEED_OPTIONS = {
  distortion: 'mountainDistortion',
  length: 600,
  roadWidth: 12,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 100,
  fovSpeedUp: 120,
  speedUp: 3,
  carLightsFade: 0.5,
  totalSideLightSticks: 30,
  lightPairsPerRoadWay: 50,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.1, 0.4],
  lightStickHeight: [1.5, 2.5],
  movingAwaySpeed: [80, 120],
  movingCloserSpeed: [-150, -200],
  carLightsLength: [600 * 0.05, 600 * 0.3],
  carLightsRadius: [0.03, 0.1],
  carWidthPercentage: [0.2, 0.4],
  carShiftX: [-1, 1],
  carFloorSeparation: [0, 3],
  colors: {
    roadColor: 0x050505,
    islandColor: 0x080808,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0x2563eb, 0x1d4ed8, 0x1e40af],
    rightCars: [0x60a5fa, 0x3b82f6, 0x2563eb],
    sticks: 0x3b82f6,
  }
};

const LoginVisual = memo(function LoginVisual() {
  return (
    <section className="auth-visual">
      <div className="auth-visual-bg">
        <Hyperspeed effectOptions={LOGIN_HYPERSPEED_OPTIONS} />
        <div className="auth-visual-overlay"></div>
      </div>

      <div className="auth-visual-content">
        <div className="auth-badge">
          <span className="auth-badge-dot"></span>
          <span className="auth-badge-text">System Online</span>
        </div>
        
        <h1 className="auth-title">
          High-Velocity <br/>
          <span className="auth-title-accent">Commerce Control.</span>
        </h1>
        
        <p className="auth-description">
          The next-generation interface for distributors and agents. Manage global inventory with precision and institutional trust.
        </p>

        <div className="auth-metric-card glass-panel">
          <div className="auth-metric-header">
            <span className="material-symbols-outlined metric-icon">insights</span>
            <span className="metric-label">Real-time throughput</span>
          </div>
          <div className="auth-metric-value">99.98%</div>
          <div className="auth-metric-sub">Fulfillment Accuracy</div>
          <div className="auth-metric-progress">
            <div className="auth-metric-progress-fill" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>

      <div className="auth-brand">
        <div className="auth-brand-logo">
          <span className="material-symbols-outlined">hub</span>
        </div>
        <span className="auth-brand-name">AgentPortal</span>
      </div>
    </section>
  );
});

const LoginPage = ({ type: initialType }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [type, setType] = useState(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = type === 'distributor' ? 'distributors/login' : type === 'agent' ? 'agent/login' : 'dealers/login';
      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // ← sends/receives HttpOnly cookie
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Backend endpoint not found. Please create ${endpoint} API endpoint.`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // ✅ JWT stored in HttpOnly cookie by backend
      // Update AuthContext so ProtectedRoute doesn't redirect
      login(data);
      if (type === 'dealer') {
        localStorage.setItem('active_dealer', JSON.stringify(data));
      }
      navigate(type === 'distributor' ? '/distributor' : type === 'agent' ? '/agent' : '/dealer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <LoginVisual />

      {/* Right Side: Login Form */}
      <section className="auth-form-section bg-mesh">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access the suite.</p>
          </div>

          <div className="auth-card glass-panel">
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Role Selection */}
              <div className="auth-field-group">
                <label className="auth-label">Account Role</label>
                <div className="auth-role-grid">
                  <button 
                    type="button"
                    className={`auth-role-btn ${type === 'distributor' ? 'active' : ''}`}
                    onClick={() => setType('distributor')}
                  >
                    <span className="material-symbols-outlined">inventory_2</span>
                    <span className="role-text">Distributor</span>
                  </button>
                  <button 
                    type="button"
                    className={`auth-role-btn ${type === 'agent' ? 'active' : ''}`}
                    onClick={() => setType('agent')}
                  >
                    <span className="material-symbols-outlined">support_agent</span>
                    <span className="role-text">Agent</span>
                  </button>
                  <button 
                    type="button"
                    className={`auth-role-btn ${type === 'dealer' ? 'active' : ''}`}
                    onClick={() => setType('dealer')}
                  >
                    <span className="material-symbols-outlined">store</span>
                    <span className="role-text">Dealer</span>
                  </button>
                </div>
              </div>

              {error && <div className="auth-error-box">{error}</div>}

              {/* Email Input */}
              <div className="auth-field-group">
                <label className="auth-label" htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input 
                    type="email" 
                    id="email"
                    placeholder="name@distributor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <a href="#" className="auth-link">Forgot?</a>
                </div>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>
          </div>

          <footer className="auth-footer">
            <p className="auth-footer-msg">
              Don't have an account? <a href="#" className="auth-link font-bold">Contact Administrator</a>
            </p>
            <div className="auth-footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Support</a>
            </div>
            <p className="auth-copyright">© 2024 High-Velocity Commerce. All rights reserved.</p>
          </footer>
        </div>
      </section>

      {/* Decorative Orbs */}
      <div className="auth-orb auth-orb-top"></div>
      <div className="auth-orb auth-orb-bottom"></div>
    </div>
  );
};

export default LoginPage;
