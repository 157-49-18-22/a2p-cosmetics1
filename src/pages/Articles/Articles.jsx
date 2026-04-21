import React from 'react';
import { Search, Clock, ArrowRight, Sparkles, Filter } from 'lucide-react';
import './Articles.css';

const articles = [
  {
    id: 1,
    title: "The Ultimate Guide to Glow: Morning vs Evening Routine",
    excerpt: "Learn why swapping your Vitamin C serum with Retinol at night is the secret to waking up with radiant skin...",
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
    excerpt: "We dive deep into the botanical treasures of the North to bring you the purest extracts for your skin...",
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
    excerpt: "Your skin's acid mantle is its first line of defense. Here is how to keep it perfectly balanced at 5.5...",
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
    excerpt: "Does 'natural' always mean better? We separate facts from marketing buzz in this deep dive...",
    category: "Lifestyle",
    author: "Sarah Jenkins",
    date: "April 10, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=800",
    featured: false
  }
];

const Articles = () => {
  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

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
          <p>Discover the science behind our ingredients and tips for your unique skin journey.</p>

          <div className="articles-search-bar">
            <Search size={22} strokeWidth={1.5} />
            <input type="text" placeholder="Search for tips, ingredients, or routines..." />
            <button className="search-btn">Search</button>
          </div>
        </div>
      </section>

      <div className="container main-content-wrapper">
        {/* Featured Article */}
        {featuredArticle && (
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
                      {featuredArticle.author[0]}
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
                <button className="read-more-btn">
                  Read Full Article <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        <section className="articles-grid-section">
          <div className="grid-header">
            <h2 className="section-title">Latest Updates</h2>
            <div className="filter-chips">
              <button className="chip active">All Stories</button>
              <button className="chip">Routines</button>
              <button className="chip">Ingredients</button>
              <button className="chip">Science</button>
              <button className="chip">Lifestyle</button>
            </div>
          </div>

          <div className="articles-grid">
            {regularArticles.map(article => (
              <div key={article.id} className="article-card">
                <div className="article-img">
                  <img src={article.image} alt={article.title} />
                  <span className="article-cat-tag">{article.category}</span>
                </div>
                <div className="article-card-content">
                  <div className="article-meta-small">
                    <span>{article.date}</span>
                    <span className="dot">•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt.substring(0, 100)}...</p>
                  <button className="text-link">
                    Explore Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter In-feed */}
        <section className="blog-newsletter">
          <div className="newsletter-content">
            <h3>Subscribe to our Journal</h3>
            <p>Get exclusive skincare tips and early access to new launches directly in your inbox.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button>Subscribe Now</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Articles;
