import React from 'react';
import './Profile.css';
import { Sparkles, Info, CheckCircle2 } from 'lucide-react';

const SkinProfile = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1>Skin Profile</h1>
        <p>Personalize your experience for better product recommendations.</p>
      </div>

      <div className="skin-profile-card">
        <div className="quiz-status-banner">
          <Sparkles className="sparkle-icon" />
          <div>
            <h3>Your Skin Type: Combination</h3>
            <p>Based on your last quiz on Oct 20, 2023</p>
          </div>
          <button className="retake-quiz-btn">Retake Quiz</button>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <label>Primary Concern</label>
            <div className="detail-value">Anti-Aging & Hydration</div>
          </div>
          <div className="profile-detail-item">
            <label>Sensitivity</label>
            <div className="detail-value">Low / Normal</div>
          </div>
          <div className="profile-detail-item">
            <label>Skin Tone</label>
            <div className="detail-value">Fair to Medium</div>
          </div>
        </div>

        <div className="recommmended-routine">
          <h3>Your Recommended Routine</h3>
          <div className="routine-steps">
            <div className="step">
              <span className="step-num">1</span>
              <div>
                <h4>Gently Cleanse</h4>
                <p>Use Charcoal Face Wash every morning.</p>
              </div>
              <CheckCircle2 size={18} className="done-icon" />
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <div>
                <h4>Hydrate</h4>
                <p>Apply Vitamin C Serum while skin is damp.</p>
              </div>
              <CheckCircle2 size={18} className="done-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinProfile;
