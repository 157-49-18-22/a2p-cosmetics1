import React, { useState, useEffect } from 'react';
import { Search, Clock, ArrowRight, Sparkles, Filter, X, Share2, Check, BookOpen, Calendar, User } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';
import './Articles.css';

const DEFAULT_ARTICLES = [
  {
    id: 1,
    title: "The Ultimate Guide to Glow: Morning vs Evening Routine",
    slug: "the-ultimate-guide-to-glow-morning-vs-evening-routine",
    excerpt: "Learn why swapping your Vitamin C serum with Retinol at night is the secret to waking up with radiant skin...",
    content: "Learn why swapping your Vitamin C serum with Retinol at night is the secret to waking up with radiant skin.\n\nMorning Routine Essentials:\n1. Gentle Cleanser: Wash away overnight impurities without stripping essential moisture.\n2. Vitamin C Serum: Protects against free radicals and environmental stressors throughout the day.\n3. Hydrating Moisturizer: Locks in hydration and creates a smooth base.\n4. Broad-Spectrum Sunscreen (SPF 50+): Non-negotiable defense against UV rays.\n\nEvening Routine Essentials:\n1. Double Cleanse: Remove sunscreen, pollution, and makeup thoroughly.\n2. Active Treatment (Retinol / Exfoliating Acids): Stimulates collagen and cellular renewal overnight.\n3. Barrier Repair Night Cream: Nourishes deep skin layers for wake-up glow.",
    category: "Skincare 101",
    author: "Dr. Ananya Sharma",
    date: "April 18, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    id: 2,
    title: "5 Himalayan Herbs That Revive Dull Skin",
    slug: "5-himalayan-herbs-that-revive-dull-skin",
    excerpt: "We dive deep into the botanical treasures of the North to bring you the purest extracts for your skin...",
    content: "We dive deep into the botanical treasures of the Himalayas to bring you the purest extracts for revitalizing tired, dull skin.\n\n1. Ashwagandha: Powerful adaptogen that combats stress-induced skin fatigue.\n2. Seabuckthorn Berry: Loaded with rare Omega-7 and Vitamin C for intense cellular repair.\n3. Himalayan Rose: Deeply hydrating floral distillate that balances skin pH naturally.\n4. Turmeric Extract: Natural brightening agent that fades pigmentation and evens skin tone.\n5. Brahmi: Calms inflammation and promotes natural skin barrier elasticity.",
    category: "Ingredients",
    author: "Rohan Varma",
    date: "April 15, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1556228578-8c7c2f23d0b2?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 3,
    title: "Why pH Balance Matters More Than You Think",
    slug: "why-ph-balance-matters-more-than-you-think",
    excerpt: "Your skin's acid mantle is its first line of defense. Here is how to keep it perfectly balanced at 5.5...",
    content: "Your skin's acid mantle is its first line of defense against bacteria, pollution, and moisture loss.\n\nThe optimal pH for human facial skin is slightly acidic, sitting comfortably between 4.7 and 5.5.\n\nWhat happens when pH is unbalanced?\n- Too Alkaline (pH > 6.0): Leads to dryness, sensitivity, irritation, and premature fine lines.\n- Too Acidic (pH < 4.0): Can cause inflammation, breakouts, and redness.\n\nHow to maintain 5.5 pH balance:\n- Use gentle, sulfate-free cleansers.\n- Avoid overly harsh physical scrubs.\n- Apply balancing toner with soothing botanicals.\n- Protect with antioxidant-rich serums.",
    category: "Science",
    author: "Dr. Ananya Sharma",
    date: "April 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
    featured: false
  },
  {
    id: 4,
    title: "Debunking Organic Skincare Myths",
    slug: "debunking-organic-skincare-myths",
    excerpt: "Does 'natural' always mean better? We separate facts from marketing buzz in this deep dive...",
    content: "Does 'natural' always mean safer or more effective? We separate scientific facts from marketing hype in this deep dive into clean beauty.\n\nMyth 1: All synthetic ingredients are harmful.\nFact: Many synthetic compounds like Hyaluronic Acid and Niacinamide are bio-identical, stable, and highly beneficial.\n\nMyth 2: Preservative-free skincare is always better.\nFact: Without safe preservatives, water-based skincare products can harbor dangerous mold and bacteria within weeks.\n\nMyth 3: Natural oils never clog pores.\nFact: Some natural oils (like Coconut oil) are highly comedogenic, while others (like Jojoba and Squalane) are pore-friendly.",
    category: "Lifestyle",
    author: "Sarah Jenkins",
    date: "April 10, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

const Articles = () => {
  const [articlesList, setArticlesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch articles from backend
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/articles`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            content: item.content,
            category: item.category || 'Skincare 101',
            author: item.author || 'Dr. Ananya Sharma',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'April 2026',
            readTime: item.read_time || '5 min read',
            image: item.image_url || 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
            featured: !!item.featured,
            status: item.status || 'Published',
            meta_title: item.meta_title,
            meta_description: item.meta_description,
            meta_keywords: item.meta_keywords
          }));
          setArticlesList(formatted);
          return;
        }
      }
      // Fallback
      setArticlesList(DEFAULT_ARTICLES);
    } catch (e) {
      console.warn('Using default articles fallback:', e);
      setArticlesList(DEFAULT_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Sync hash in URL for direct article deep links (e.g. /articles#5-himalayan-herbs)
  useEffect(() => {
    if (articlesList.length > 0 && window.location.hash) {
      const hashSlug = window.location.hash.replace('#', '');
      const found = articlesList.find(a => a.slug === hashSlug || String(a.id) === hashSlug);
      if (found) {
        setSelectedArticle(found);
      }
    }
  }, [articlesList]);

  const handleOpenArticle = (art) => {
    setSelectedArticle(art);
    window.location.hash = art.slug || art.id;
    if (art.meta_title) {
      document.title = `${art.meta_title} | A2P Cosmetics`;
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.history.replaceState(null, '', window.location.pathname);
    document.title = 'Skincare Journal & Articles | A2P Cosmetics';
  };

  const handleCopyLink = (art) => {
    const url = `${window.location.origin}/articles#${art.slug || art.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Derive unique categories
  const categories = ['All Stories', ...Array.from(new Set(articlesList.map(a => a.category).filter(Boolean)))];

  // Filtered articles
  const filtered = articlesList.filter(article => {
    const matchesCategory = selectedCategory === 'All Stories' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = filtered.find(a => a.featured) || filtered[0];
  const regularArticles = filtered.filter(a => a !== featuredArticle);

  return (
    <div className="articles-page">
      {/* Background Elements */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* Blog Hero Section */}
      <section className="articles-hero">
        <div className="container">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>A2P Skincare Journal</span>
          </div>
          <h1>Expert Insights for <br /><span>Your Natural Beauty</span></h1>
          <p>Discover the science behind our ingredients, expert dermatological routines, and wellness tips.</p>

          <div className="articles-search-bar">
            <Search size={22} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search for tips, ingredients, or routines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn" onClick={() => {}}>Search</button>
          </div>
        </div>
      </section>

      <div className="container main-content-wrapper">
        {/* Featured Article */}
        {featuredArticle && !searchQuery && selectedCategory === 'All Stories' && (
          <section className="featured-section">
            <h2 className="section-title">Editor's Choice</h2>
            <div className="featured-card">
              <div className="featured-img-wrap">
                <img src={featuredArticle.image} alt={featuredArticle.title} />
                <span className="featured-tag">Featured</span>
              </div>
              <div className="featured-content">
                <span className="article-cat">{featuredArticle.category}</span>
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.excerpt}</p>
                <div className="article-meta">
                  <div className="author-info">
                    <div className="author-avatar">
                      {featuredArticle.author ? featuredArticle.author[0] : 'A'}
                    </div>
                    <div>
                      <span className="author-name">{featuredArticle.author}</span>
                      <span className="article-date">{featuredArticle.date}</span>
                    </div>
                  </div>
                  <div className="read-time">
                    <Clock size={16} />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
                <button className="read-more-btn" onClick={() => handleOpenArticle(featuredArticle)}>
                  Read Full Article <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        <section className="articles-grid-section">
          <div className="grid-header">
            <h2 className="section-title">
              {searchQuery ? `Search Results (${filtered.length})` : 'Latest Updates'}
            </h2>
            <div className="filter-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3>No articles found</h3>
              <p>Try searching for a different keyword or select another category.</p>
            </div>
          ) : (
            <div className="articles-grid">
              {(searchQuery || selectedCategory !== 'All Stories' ? filtered : regularArticles).map(article => (
                <div key={article.id} className="article-card" onClick={() => handleOpenArticle(article)}>
                  <div className="article-img">
                    <img src={article.image} alt={article.title} />
                    <span className="article-cat-tag">{article.category}</span>
                  </div>
                  <div className="article-card-content">
                    <div className="article-meta-small">
                      <span>{article.date}</span>
                      <span className="dot" style={{ margin: '0 6px' }}>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3>{article.title}</h3>
                    <p>{(article.excerpt || '').substring(0, 110)}...</p>
                    <button className="text-link" onClick={(e) => { e.stopPropagation(); handleOpenArticle(article); }}>
                      Explore Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter In-feed */}
        <section className="blog-newsletter">
          <div className="newsletter-content">
            <span className="newsletter-badge">Stay Updated</span>
            <h3>Subscribe to our Journal</h3>
            <p>Get exclusive skincare tips and early access to new launches directly in your inbox.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button onClick={(e) => { e.preventDefault(); alert('Thank you for subscribing to A2P Journal!'); }}>
                Subscribe Now
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/*  FULL ARTICLE READING MODAL                 */}
      {/* ═══════════════════════════════════════════ */}
      {selectedArticle && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
          }}
          onClick={handleCloseArticle}
        >
          <div
            style={{
              background: '#ffffff', borderRadius: '24px', width: '850px',
              maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative',
              animation: 'fadeInUp 0.3s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseArticle}
              style={{
                position: 'absolute', top: 20, right: 20, zIndex: 10,
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)', border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a'
              }}
            >
              <X size={20} />
            </button>

            {/* Article Image Banner */}
            {selectedArticle.image && (
              <div style={{ position: 'relative', height: '340px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
                }} />
                <span style={{
                  position: 'absolute', bottom: 24, left: 32,
                  background: '#c9937e', color: '#fff', padding: '6px 16px',
                  borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  {selectedArticle.category}
                </span>
              </div>
            )}

            {/* Content Container */}
            <div style={{ padding: '36px 40px 48px' }}>
              {/* Meta Info Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: '#fdf2f0', color: '#c9937e', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff', boxShadow: '0 4px 10px rgba(201,147,126,0.2)'
                  }}>
                    {selectedArticle.author ? selectedArticle.author[0] : 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedArticle.author}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {selectedArticle.date} • {selectedArticle.readTime}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyLink(selectedArticle)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '100px',
                    background: copied ? '#ecfdf5' : '#f8fafc',
                    color: copied ? '#059669' : '#475569',
                    border: `1px solid ${copied ? '#a7f3d0' : '#e2e8f0'}`,
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={16} /> : <Share2 size={16} />}
                  {copied ? 'Link Copied!' : 'Share Article'}
                </button>
              </div>

              {/* Title */}
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '2.4rem', lineHeight: 1.25, color: '#0f172a',
                marginBottom: '20px', fontWeight: 600
              }}>
                {selectedArticle.title}
              </h1>

              {/* Excerpt Lead */}
              {selectedArticle.excerpt && (
                <div style={{
                  fontSize: '1.15rem', color: '#475569', lineHeight: 1.7,
                  fontStyle: 'italic', borderLeft: '4px solid #c9937e',
                  paddingLeft: '20px', marginBottom: '30px', background: '#fdfbf9',
                  padding: '16px 20px', borderRadius: '0 12px 12px 0'
                }}>
                  {selectedArticle.excerpt}
                </div>
              )}

              {/* Body Content */}
              <div style={{
                fontSize: '1.05rem', color: '#334155', lineHeight: 1.9,
                whiteSpace: 'pre-line'
              }}>
                {selectedArticle.content || selectedArticle.excerpt}
              </div>

              {/* Back to top button */}
              <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={handleCloseArticle}
                  style={{
                    background: '#1a1a1a', color: '#fff', border: 'none',
                    padding: '12px 28px', borderRadius: '100px', fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ← Back to All Articles
                </button>

                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  A2P Skincare Journal © 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;

