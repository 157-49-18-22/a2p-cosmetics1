import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Sparkles, ArrowRight, Star } from 'lucide-react';
import './Hero.css';

// ─── GLSL Shaders ───────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform vec2 uImageSize1;
  uniform vec2 uImageSize2;

  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 containerRes, vec2 imgSize) {
    float containerAspect = containerRes.x / containerRes.y;
    float imgAspect       = imgSize.x / imgSize.y;
    vec2 scale;
    if (containerAspect > imgAspect) {
      scale = vec2(1.0, imgAspect / containerAspect);
    } else {
      scale = vec2(containerAspect / imgAspect, 1.0);
    }
    return (uv - 0.5) / scale + 0.5;
  }

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // Sine-wave ripple displacement
    float wave = sin(uv.y * 12.0 + uProgress * 6.28318) * 0.5 + 0.5;
    float wave2 = sin(uv.x * 8.0  - uProgress * 6.28318) * 0.5 + 0.5;
    float disp = smoothNoise(uv * 4.0 + uProgress) * wave * wave2;

    float envelope = sin(uProgress * 3.14159);
    float dispStrength = uIntensity * envelope;

    vec2 distortedUv1 = uv + dispStrength * vec2(disp - 0.5, disp - 0.5) * 0.6;
    vec2 distortedUv2 = uv - dispStrength * vec2(disp - 0.5, disp - 0.5) * 0.6;

    vec4 tex1 = texture2D(uTexture1, coverUv(distortedUv1, uResolution, uImageSize1));
    vec4 tex2 = texture2D(uTexture2, coverUv(distortedUv2, uResolution, uImageSize2));

    gl_FragColor = mix(tex1, tex2, uProgress);
  }
`;

// ─── Slide Data ──────────────────────────────────────────────────
const slides = [
  {
    title: "Beauty That Transforms",
    subtitle: "Elevate your skincare routine with our luxurious, science-backed formulas.",
    image: "/bg.jpeg",
    badge: "Discover Your Natural Radiance",
    cta: "Shop Now",
    link: "/face-wash",
    color: "#ff4d6d",
  },
  {
    title: "Radiance Reimagined",
    subtitle: "Experience the glow with our luxury Face Serum and specialized treatments.",
    image: "/luxury_serum_hero.png",
    badge: "New Arrival: Face Serum",
    cta: "Shop Serum",
    link: "/face-serum",
    color: "#ff8fa3",
  },
  {
    title: "Hydration Redefined",
    subtitle: "Experience deep nourishment and a fresh glow with our premium moisture collection.",
    image: "/hydrating_cream_hero.png",
    badge: "Refresh Your Skin",
    cta: "Explore Cream",
    link: "/face-cream",
    color: "#4dabff",
  },
  {
    title: "Purely Organic",
    subtitle: "Harnessing the power of nature to bring you the cleanest, most effective skincare.",
    image: "/natural_skincare_hero.png",
    badge: "100% Natural Ingredients",
    cta: "View Collection",
    link: "/body-wash",
    color: "#4dbf4d",
  },
];

// ─── Text Scramble Hook ──────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
function useScramble(text, trigger) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = 18;
    cancelAnimationFrame(frameRef.current);

    const animate = () => {
      setDisplay(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      iteration += 0.6;
      if (iteration < text.length) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, trigger]); // eslint-disable-line

  return display;
}

// ─── Main Component ──────────────────────────────────────────────
const Hero = () => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const uniformsRef = useRef(null);
  const texturesRef = useRef([]);
  const animFrameRef = useRef(null);
  const isTransitioning = useRef(false);
  const progressRef = useRef(0);
  const currentIdxRef = useRef(0);
  const autoTimerRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const [scrambleTrigger, setScrambleTrigger] = useState(0);

  const scrambledTitle = useScramble(slides[currentIndex].title, scrambleTrigger);

  // ── Init Three.js ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Preload all textures
    const loader = new THREE.TextureLoader();
    const promises = slides.map(
      (s) =>
        new Promise((resolve) => {
          loader.load(s.image, (tex) => {
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            resolve(tex);
          });
        })
    );

    Promise.all(promises).then((textures) => {
      texturesRef.current = textures;

      const uniforms = {
        uTexture1:   { value: textures[0] },
        uTexture2:   { value: textures[1] },
        uProgress:   { value: 0.0 },
        uIntensity:  { value: 1.2 },
        uResolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
        uImageSize1: { value: new THREE.Vector2(textures[0].image.width, textures[0].image.height) },
        uImageSize2: { value: new THREE.Vector2(textures[1].image.width, textures[1].image.height) },
      };
      uniformsRef.current = uniforms;

      const geo = new THREE.PlaneGeometry(2, 2);
      const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      });
      const mesh = new THREE.Mesh(geo, mat);
      meshRef.current = mesh;
      scene.add(mesh);

      const render = () => {
        animFrameRef.current = requestAnimationFrame(render);
        renderer.render(scene, camera);
      };
      render();
    });

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h);
      if (uniformsRef.current) {
        uniformsRef.current.uResolution.value.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // ── Transition logic ──
  const goTo = useCallback((nextIdx) => {
    if (isTransitioning.current) return;
    const curr = currentIdxRef.current;
    if (nextIdx === curr) return;

    isTransitioning.current = true;
    const uniforms = uniformsRef.current;
    const textures = texturesRef.current;
    if (!uniforms || textures.length === 0) return;

    uniforms.uTexture1.value = textures[curr];
    uniforms.uTexture2.value = textures[nextIdx];
    uniforms.uImageSize1.value.set(textures[curr].image.width, textures[curr].image.height);
    uniforms.uImageSize2.value.set(textures[nextIdx].image.width, textures[nextIdx].image.height);
    progressRef.current = 0;

    // Hide text
    setContentVisible(false);

    const duration = 1400; // ms
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      uniforms.uProgress.value = eased;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        uniforms.uProgress.value = 0;
        uniforms.uTexture1.value = textures[nextIdx];
        const nextNextIdx = (nextIdx + 1) % slides.length;
        uniforms.uTexture2.value = textures[nextNextIdx];
        uniforms.uImageSize1.value.set(textures[nextIdx].image.width, textures[nextIdx].image.height);
        uniforms.uImageSize2.value.set(textures[nextNextIdx].image.width, textures[nextNextIdx].image.height);
        currentIdxRef.current = nextIdx;
        isTransitioning.current = false;
        setCurrentIndex(nextIdx);
        setScrambleTrigger((p) => p + 1);
        setContentVisible(true);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  // ── Auto-play ──
  useEffect(() => {
    const tick = () => {
      const next = (currentIdxRef.current + 1) % slides.length;
      goTo(next);
    };
    autoTimerRef.current = setInterval(tick, 5000);
    return () => clearInterval(autoTimerRef.current);
  }, [goTo]);

  const handleIndicatorClick = (idx) => {
    clearInterval(autoTimerRef.current);
    goTo(idx);
    autoTimerRef.current = setInterval(() => {
      goTo((currentIdxRef.current + 1) % slides.length);
    }, 5000);
  };

  const slide = slides[currentIndex];

  return (
    <section className="hero-root">
      {/* WebGL Canvas */}
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Dark overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className={`hero-content ${contentVisible ? 'visible' : ''}`}>
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>{slide.badge}</span>
        </div>

        <h1 className="hero-title">{scrambledTitle}</h1>

        <p className="hero-subtitle">{slide.subtitle}</p>

        <div className="hero-buttons">
          <a href={slide.link} className="hero-btn-primary" style={{ '--accent': slide.color }}>
            {slide.cta} <ArrowRight size={18} />
          </a>
          <button className="hero-btn-ghost">Explore Products</button>
        </div>
      </div>

      {/* Stats */}
      <div className={`hero-stats ${contentVisible ? 'visible' : ''}`}>
        <div className="stat-item">
          <span className="stat-num">90+</span>
          <span className="stat-label">Premium Products</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">50K+</span>
          <span className="stat-label">Happy Customers</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">4.9 <Star size={16} fill="currentColor" /></span>
          <span className="stat-label">Average Rating</span>
        </div>
      </div>

      {/* Bottom bar — index + nav */}
      <div className="hero-bottom-bar">
        <span className="hero-slide-label">DISCOVER</span>
        <div className="hero-progress-track">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-prog-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="hero-slide-count">
          {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};

export default Hero;
