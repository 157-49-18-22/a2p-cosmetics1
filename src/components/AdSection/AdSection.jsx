import React, { useRef, useState, useEffect } from 'react';
import './AdSection.css';

const AdSection = () => {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const update = () => setProgress((video.currentTime / video.duration) * 100 || 0);
    video.addEventListener('timeupdate', update);
    return () => video.removeEventListener('timeupdate', update);
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
    else { videoRef.current.pause(); setIsPlaying(false); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <section className="ad-section" ref={sectionRef} id="advertisement">

      {/* Animated BG Particles */}
      <div className="ad-bg-glow ad-glow-1" />
      <div className="ad-bg-glow ad-glow-2" />

      {/* Section Header */}
      <div className="ad-header">
        <div className="ad-header-line" />
        <span className="ad-label">Official Brand Film</span>
        <div className="ad-header-line" />
      </div>

      {/* Main Content */}
      <div className="ad-inner">

        {/* LEFT — Phone Frame Video */}
        <div className="ad-phone-area">

          {/* Phone Frame */}
          <div className="ad-phone-frame">
            <div className="ad-phone-notch" />
            <div className="ad-phone-screen">
              <video
                ref={videoRef}
                src="/video.mp4"
                muted loop playsInline preload="metadata"
                className="ad-video"
              />
              {/* Progress */}
              <div className="ad-progress-track">
                <div className="ad-progress-fill-full" style={{ width: `${progress}%` }} />
              </div>

              {/* Controls inside phone screen */}
              <div className="ad-phone-controls">
                <button className="ad-ctrl-btn" onClick={togglePlay}>
                  {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  )}
                </button>
                <button className="ad-ctrl-btn" onClick={toggleMute}>
                  {isMuted ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                      <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                      <path d="M15.54,8.46a5,5,0,0,1,0,7.07"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Decorative ring */}
          <div className="ad-deco-ring" />
        </div>

        {/* RIGHT — Brand Content */}
        <div className="ad-content-side">

          <div className="ad-eyebrow">
            <span className="ad-eyebrow-dot" />
            Pure · Natural · Luxurious
          </div>

          <h2 className="ad-headline">
            Experience<br />the <span className="ad-a2p-badge">A2P</span><br />Difference
          </h2>

          <p className="ad-description">
            Crafted with the finest natural ingredients, A2P Cosmetics blends
            science with nature to deliver skincare that truly transforms.
            Pure formulas. Real results. Made for you.
          </p>

          {/* Feature Pills */}
          <div className="ad-features">
            <span className="ad-pill">🌱 Vegan</span>
            <span className="ad-pill">✨ Dermatologist Tested</span>
            <span className="ad-pill">🐰 Cruelty Free</span>
          </div>

          <a href="#shop" className="ad-cta-btn">
            <span>Discover Our Collection</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          {/* Trust bar */}
          <div className="ad-trust">
            <img src="/A2P final logo.png" alt="A2P" className="ad-trust-logo" />
            <span className="ad-trust-text">Trusted by skincare enthusiasts across India</span>
          </div>
        </div>
      </div>

      {/* Bottom Stats Strip */}
      <div className="ad-stats-strip">
        <div className="ad-stat">
          <span className="stat-number">100%</span>
          <span className="stat-label">Natural</span>
        </div>
        <div className="ad-stat-div" />
        <div className="ad-stat">
          <span className="stat-number">10K+</span>
          <span className="stat-label">Customers</span>
        </div>
        <div className="ad-stat-div" />
        <div className="ad-stat">
          <span className="stat-number">4.9★</span>
          <span className="stat-label">Avg Rating</span>
        </div>
        <div className="ad-stat-div" />
        <div className="ad-stat">
          <span className="stat-number">50+</span>
          <span className="stat-label">Products</span>
        </div>
      </div>

    </section>
  );
};

export default AdSection;
