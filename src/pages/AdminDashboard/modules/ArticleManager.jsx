import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Search, X, Save,
  BookOpen, Star, Eye, Upload, Globe,
  CheckCircle, AlertCircle, RefreshCw, FileText,
  Tag, Clock, User, Sparkles, ExternalLink, HelpCircle
} from 'lucide-react';

const API = API_BASE_URL;

const PRESET_CATEGORIES = [
  'Skincare 101',
  'Ingredients',
  'Science',
  'Lifestyle',
  'Routines',
  'Product Spotlights',
  'Beauty Tips'
];

const EMPTY_ARTICLE = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Skincare 101',
  author: 'Dr. Ananya Sharma',
  read_time: '5 min read',
  image_url: '',
  featured: false,
  status: 'Published',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  canonical_url: '',
  og_image: ''
};

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form, setForm] = useState(EMPTY_ARTICLE);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'seo'
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState(null);

  // Preview Modal
  const [previewArticle, setPreviewArticle] = useState(null);

  const fileInputRef = useRef(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/articles`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      showToast('Failed to load articles from server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const autoSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!editingArticle) {
      setForm({
        ...form,
        title: val,
        slug: autoSlug(val),
        meta_title: form.meta_title ? form.meta_title : val
      });
    } else {
      setForm({ ...form, title: val });
    }
  };

  const openAdd = () => {
    setEditingArticle(null);
    setForm(EMPTY_ARTICLE);
    setActiveTab('content');
    setShowModal(true);
  };

  const openEdit = (art) => {
    setEditingArticle(art);
    setForm({
      title: art.title || '',
      slug: art.slug || '',
      excerpt: art.excerpt || '',
      content: art.content || '',
      category: art.category || 'Skincare 101',
      author: art.author || 'Dr. Ananya Sharma',
      read_time: art.read_time || '5 min read',
      image_url: art.image_url || '',
      featured: !!art.featured,
      status: art.status || 'Published',
      meta_title: art.meta_title || art.title || '',
      meta_description: art.meta_description || art.excerpt || '',
      meta_keywords: art.meta_keywords || '',
      canonical_url: art.canonical_url || '',
      og_image: art.og_image || art.image_url || ''
    });
    setActiveTab('content');
    setShowModal(true);
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) {
        setForm(prev => ({
          ...prev,
          image_url: data.imageUrl,
          og_image: prev.og_image ? prev.og_image : data.imageUrl
        }));
        showToast('Image uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      showToast('Image upload failed', 'danger');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast('Article Title is required', 'danger');
      setActiveTab('content');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug ? autoSlug(form.slug) : autoSlug(form.title),
        featured: form.featured ? 1 : 0
      };

      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle ? `${API}/articles/${editingArticle.id}` : `${API}/articles`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Save failed');
      }

      showToast(editingArticle ? 'Article updated successfully!' : 'Article published successfully!');
      setShowModal(false);
      fetchArticles();
    } catch (e) {
      showToast(e.message || 'Save failed. Please check backend.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (art) => {
    try {
      const res = await fetch(`${API}/articles/${art.id}/featured`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      showToast(`Article ${art.featured ? 'unmarked from' : 'marked as'} Featured!`);
      fetchArticles();
    } catch (e) {
      showToast('Failed to toggle featured status', 'danger');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete article "${title}"?`)) return;
    try {
      const res = await fetch(`${API}/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Article deleted successfully');
      fetchArticles();
    } catch (e) {
      showToast('Failed to delete article', 'danger');
    }
  };

  // Filtered list
  const filteredArticles = articles.filter(a => {
    const matchesSearch =
      (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const totalPublished = articles.filter(a => a.status === 'Published').length;
  const totalDrafts = articles.filter(a => a.status === 'Draft').length;
  const totalFeatured = articles.filter(a => !!a.featured).length;

  return (
    <div className="adm-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 99999,
          background: toast.type === 'success' ? '#10b981' : '#f43f5e',
          color: '#fff', padding: '14px 24px', borderRadius: '12px',
          fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="adm-module-header" style={{ marginBottom: '20px' }}>
        <div className="adm-header-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Articles & Journal CMS</h2>
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>
              SEO Optimized
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Publish skincare blogs, manage search engine meta tags, and control journal editorial content.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="adm-btn adm-btn-outline" onClick={fetchArticles} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="adm-btn adm-btn-primary" onClick={openAdd}>
            <Plus size={18} /> Write New Article
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px', marginBottom: '20px'
      }}>
        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{articles.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Articles</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{totalPublished}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Published Live</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{totalDrafts}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Drafts</div>
          </div>
        </div>

        <div className="adm-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>{totalFeatured}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Editor's Choice</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="adm-card">
        {/* Filters Header */}
        <div className="adm-card-header adm-card-header-flex" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="adm-search-container" style={{ minWidth: '260px' }}>
            <div className="adm-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search articles by title, author, keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem', fontWeight: 600, color: '#475569', background: '#fff'
              }}
            >
              <option value="All">All Categories</option>
              {PRESET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                fontSize: '0.85rem', fontWeight: 600, color: '#475569', background: '#fff'
              }}
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>

            <span className="adm-count-badge">
              {filteredArticles.length} / {articles.length} articles
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="adm-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <RefreshCw size={36} className="adm-spin" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
              Loading articles from database...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <BookOpen size={48} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }} />
              <h4 style={{ color: '#475569', fontWeight: 700, marginBottom: '6px' }}>No Articles Found</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                {search || selectedCategory !== 'All' ? 'Try adjusting your search filters' : 'Start publishing your first skincare article!'}
              </p>
              <button className="adm-btn adm-btn-primary" onClick={openAdd}>
                <Plus size={16} /> Create Article
              </button>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Cover</th>
                  <th>Article & SEO Slug</th>
                  <th>Category</th>
                  <th>Author / Time</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>SEO Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => {
                  const hasMetaTitle = !!art.meta_title;
                  const hasMetaDesc = !!art.meta_description;
                  const hasKeywords = !!art.meta_keywords;
                  const seoFilled = [hasMetaTitle, hasMetaDesc, hasKeywords].filter(Boolean).length;

                  return (
                    <tr key={art.id}>
                      {/* Image */}
                      <td>
                        {art.image_url ? (
                          <img
                            src={art.image_url}
                            alt={art.title}
                            style={{
                              width: '58px', height: '42px', borderRadius: '8px',
                              objectFit: 'cover', border: '1px solid #e2e8f0'
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{
                            width: '58px', height: '42px', borderRadius: '8px',
                            background: '#f1f5f9', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#94a3b8'
                          }}>
                            <BookOpen size={18} />
                          </div>
                        )}
                      </td>

                      {/* Title & Slug */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', maxWidth: '320px', lineHeight: 1.3 }}>
                          {art.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <code style={{ fontSize: '0.72rem', background: '#f8fafc', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            /articles#{art.slug || art.id}
                          </code>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                          background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 700
                        }}>
                          {art.category || 'General'}
                        </span>
                      </td>

                      {/* Author & Read Time */}
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{art.author || 'Admin'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{art.read_time || '5 min read'}</div>
                      </td>

                      {/* Featured Star Toggle */}
                      <td>
                        <button
                          onClick={() => handleToggleFeatured(art)}
                          style={{
                            background: art.featured ? '#fef3c7' : '#f8fafc',
                            border: `1px solid ${art.featured ? '#f59e0b' : '#e2e8f0'}`,
                            color: art.featured ? '#d97706' : '#94a3b8',
                            padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700,
                            transition: '0.2s'
                          }}
                          title="Click to toggle Editor's Choice"
                        >
                          <Star size={14} fill={art.featured ? '#d97706' : 'none'} />
                          {art.featured ? 'Featured' : 'Standard'}
                        </button>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`adm-badge adm-badge-${art.status === 'Published' ? 'success' : 'danger'}`}>
                          {art.status}
                        </span>
                      </td>

                      {/* SEO Score Badge */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.72rem', fontWeight: 700,
                          padding: '3px 8px', borderRadius: '6px',
                          background: seoFilled === 3 ? '#ecfdf5' : seoFilled > 0 ? '#fffbeb' : '#fef2f2',
                          color: seoFilled === 3 ? '#059669' : seoFilled > 0 ? '#d97706' : '#dc2626'
                        }}>
                          <Globe size={12} />
                          {seoFilled === 3 ? 'SEO Ready' : `${seoFilled}/3 SEO tags`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="adm-icon-btn"
                            title="Preview Article"
                            onClick={() => setPreviewArticle(art)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="adm-icon-btn"
                            title="Edit & SEO Settings"
                            onClick={() => openEdit(art)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="adm-icon-btn"
                            title="Delete Article"
                            style={{ color: '#f43f5e' }}
                            onClick={() => handleDelete(art.id, art.title)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/*  ADD / EDIT ARTICLE MODAL WITH SEO TAB     */}
      {/* ═══════════════════════════════════════════ */}
      {showModal && (
        <div className="adm-modal-overlay">
          <div
            className="adm-modal adm-fade-in"
            style={{ width: '840px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 26px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                  {editingArticle ? 'Edit Article & SEO' : 'Create New Article'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                  Write article content and optimize search engine metadata for Google ranking.
                </p>
              </div>
              <button className="adm-icon-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{
              display: 'flex', borderBottom: '1px solid #e2e8f0',
              padding: '0 26px', background: '#fafafa'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                style={{
                  padding: '12px 20px', border: 'none', background: 'transparent',
                  fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                  borderBottom: activeTab === 'content' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'content' ? '#2563eb' : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <FileText size={16} /> Article Content
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                style={{
                  padding: '12px 20px', border: 'none', background: 'transparent',
                  fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                  borderBottom: activeTab === 'seo' ? '3px solid #2563eb' : '3px solid transparent',
                  color: activeTab === 'seo' ? '#2563eb' : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <Globe size={16} /> SEO & Google Preview
                <span style={{
                  fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px',
                  background: activeTab === 'seo' ? '#dbeafe' : '#f1f5f9',
                  color: activeTab === 'seo' ? '#1e40af' : '#64748b'
                }}>
                  Rankings
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {activeTab === 'content' ? (
                <div style={{ display: 'flex', gap: '0', minHeight: '100%' }}>

                  {/* ── LEFT: Main Content Area ── */}
                  <div style={{ flex: 1, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: '22px', borderRight: '1px solid #f1f5f9' }}>

                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>Article Title *</label>
                      <input
                        style={{ width: '100%', padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                        value={form.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. 5 Himalayan Herbs That Revive Dull Skin"
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>

                    {/* URL Slug */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                        URL Slug <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'none' }}>· auto-generated from title</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        <span style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#94a3b8', borderRight: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 600, whiteSpace: 'nowrap' }}>/articles/</span>
                        <input
                          style={{ flex: 1, padding: '12px 14px', border: 'none', outline: 'none', fontSize: '0.88rem', fontFamily: 'monospace', background: 'transparent', color: '#334155' }}
                          value={form.slug}
                          onChange={e => setForm({ ...form, slug: autoSlug(e.target.value) })}
                          placeholder="article-url-slug"
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Short Excerpt / Summary</label>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Shown on blog listing cards</span>
                      </div>
                      <textarea
                        style={{ width: '100%', padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', minHeight: '80px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color 0.2s' }}
                        value={form.excerpt}
                        onChange={e => setForm({ ...form, excerpt: e.target.value, meta_description: form.meta_description ? form.meta_description : e.target.value })}
                        placeholder="Write a brief 1-2 sentence teaser that hooks the reader and makes them want to read more..."
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>

                    {/* Full Content */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Full Article Content</label>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Markdown supported</span>
                      </div>
                      <textarea
                        style={{ width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', minHeight: '240px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7, transition: 'border-color 0.2s' }}
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        placeholder="Write your in-depth article here...&#10;&#10;## Introduction&#10;Share insights, ingredient breakdowns, skincare routines...&#10;&#10;## Section 2&#10;Continue with detailed content..."
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                      <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px' }}>Tip: Use ## for headings, **bold**, *italic*, and - for bullet points</p>
                    </div>
                  </div>

                  {/* ── RIGHT: Metadata Sidebar ── */}
                  <div style={{ width: '260px', flexShrink: 0, padding: '28px 20px', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Publish Status */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Publish Settings</p>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Status</label>
                        <select
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="Published">✅ Published</option>
                          <option value="Draft">📝 Draft</option>
                          <option value="Archived">🗄️ Archived</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Author</label>
                        <input
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          value={form.author}
                          onChange={e => setForm({ ...form, author: e.target.value })}
                          placeholder="Dr. Ananya Sharma"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Read Time</label>
                          <input
                            style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            value={form.read_time}
                            onChange={e => setForm({ ...form, read_time: e.target.value })}
                            placeholder="5 min"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Category</label>
                          <input
                            list="categories-list"
                            style={{ width: '100%', padding: '9px 10px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            placeholder="Category"
                          />
                          <datalist id="categories-list">{PRESET_CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
                        </div>
                      </div>

                      {/* Featured Toggle */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', background: form.featured ? '#fffbeb' : '#f8fafc', border: `1.5px solid ${form.featured ? '#f59e0b' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                        <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: form.featured ? '#f59e0b' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: '2px', left: form.featured ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
                        </div>
                        <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} style={{ display: 'none' }}/>
                        <div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: form.featured ? '#d97706' : '#475569', margin: 0 }}>⭐ Editor's Choice</p>
                          <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>Show in featured section</p>
                        </div>
                      </label>
                    </div>

                    {/* Cover Image */}
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Cover Image</p>

                      {form.image_url ? (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={form.image_url}
                            alt="Cover"
                            style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', display: 'block' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image_url: '' })}
                            style={{ position: 'absolute', top: '6px', right: '6px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}
                          >✕</button>
                        </div>
                      ) : (
                        <div
                          style={{ height: '90px', border: '2px dashed #e2e8f0', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', background: '#f8fafc' }}
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          <Upload size={20} color="#94a3b8"/>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Click to upload</span>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />

                      <input
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#475569' }}
                        value={form.image_url}
                        onChange={e => setForm({ ...form, image_url: e.target.value, og_image: form.og_image ? form.og_image : e.target.value })}
                        placeholder="Or paste image URL here..."
                      />

                      {uploadingImage && (
                        <p style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, textAlign: 'center' }}>⏳ Uploading image...</p>
                      )}
                    </div>

                  </div>
                </div>
              ) : (
                /* ════════ SEO & SERP PREVIEW TAB ════════ */
                <div style={{ padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Google SERP Live Preview Box */}
                  <div style={{
                    background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px',
                    padding: '18px 22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} color="#2563eb" /> Google Search Result Live Preview
                      </span>
                      <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        Desktop & Mobile
                      </span>
                    </div>

                    {/* Fake Google SERP Box */}
                    <div style={{
                      background: '#fff', border: '1px solid #dfe1e5', borderRadius: '10px',
                      padding: '14px 18px', maxWidth: '600px'
                    }}>
                      {/* URL Line */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#202124', marginBottom: '4px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          A2P
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: '#202124' }}>A2P Cosmetics</span>
                          <span style={{ color: '#5f6368', marginLeft: '4px' }}>
                            › articles › {form.slug || 'article-title'}
                          </span>
                        </div>
                      </div>

                      {/* Clickable Title */}
                      <h4 style={{
                        fontSize: '1.15rem', color: '#1a0dab', fontWeight: 500, margin: '2px 0 4px',
                        lineHeight: 1.3, cursor: 'pointer'
                      }}>
                        {form.meta_title || form.title || 'Your Article SEO Title Here'}
                      </h4>

                      {/* Snippet Description */}
                      <p style={{ fontSize: '0.85rem', color: '#4d5156', lineHeight: 1.4, margin: 0 }}>
                        {form.meta_description || form.excerpt || 'Write a compelling meta description to improve your organic click-through rate on search results...'}
                      </p>
                    </div>
                  </div>

                  {/* SEO Meta Title */}
                  <div className="adm-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontWeight: 700, color: '#1e293b' }}>
                        SEO Meta Title
                      </label>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: (form.meta_title || '').length > 60 ? '#ef4444' : (form.meta_title || '').length >= 40 ? '#10b981' : '#64748b'
                      }}>
                        {(form.meta_title || '').length} / 60 chars (Recommended: 50-60)
                      </span>
                    </div>
                    <input
                      style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem' }}
                      value={form.meta_title}
                      onChange={e => setForm({ ...form, meta_title: e.target.value })}
                      placeholder="e.g. 5 Himalayan Herbs for Radiant Skin | A2P Skincare Journal"
                    />
                  </div>

                  {/* SEO Meta Description */}
                  <div className="adm-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontWeight: 700, color: '#1e293b' }}>
                        SEO Meta Description
                      </label>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: (form.meta_description || '').length > 160 ? '#ef4444' : (form.meta_description || '').length >= 120 ? '#10b981' : '#64748b'
                      }}>
                        {(form.meta_description || '').length} / 160 chars (Recommended: 150-160)
                      </span>
                    </div>
                    <textarea
                      style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', minHeight: '80px', resize: 'vertical' }}
                      value={form.meta_description}
                      onChange={e => setForm({ ...form, meta_description: e.target.value })}
                      placeholder="Summary shown in Google search result snippet to encourage clicks..."
                    />
                  </div>

                  {/* Meta Keywords & Canonical */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="adm-field">
                      <label style={{ fontWeight: 700, color: '#1e293b' }}>
                        Focus Keywords / Tags
                      </label>
                      <input
                        style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem' }}
                        value={form.meta_keywords}
                        onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
                        placeholder="skincare, himalayan herbs, dull skin, organic beauty"
                      />
                    </div>

                    <div className="adm-field">
                      <label style={{ fontWeight: 700, color: '#1e293b' }}>
                        Canonical URL <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Optional)</span>
                      </label>
                      <input
                        style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem' }}
                        value={form.canonical_url}
                        onChange={e => setForm({ ...form, canonical_url: e.target.value })}
                        placeholder="https://a2pcosmetics.com/articles#slug"
                      />
                    </div>
                  </div>

                  {/* Social Share / OG Image */}
                  <div className="adm-field">
                    <label style={{ fontWeight: 700, color: '#1e293b' }}>
                      Open Graph (OG) Social Share Image URL
                    </label>
                    <input
                      style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem' }}
                      value={form.og_image}
                      onChange={e => setForm({ ...form, og_image: e.target.value })}
                      placeholder="Image displayed when sharing link on WhatsApp / Twitter / Facebook..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 26px', borderTop: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa'
            }}>
              <div>
                {activeTab === 'content' ? (
                  <button
                    type="button"
                    className="adm-btn adm-btn-outline"
                    onClick={() => setActiveTab('seo')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Next: Configure SEO & Preview →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="adm-btn adm-btn-outline"
                    onClick={() => setActiveTab('content')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    ← Back to Content
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/*  ARTICLE PREVIEW MODAL                      */}
      {/* ═══════════════════════════════════════════ */}
      {previewArticle && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-fade-in" style={{ width: '700px', maxWidth: '95vw', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '12px', fontWeight: 800 }}>
                {previewArticle.category || 'Article Preview'}
              </span>
              <button className="adm-icon-btn" onClick={() => setPreviewArticle(null)}>
                <X size={18} />
              </button>
            </div>

            {previewArticle.image_url && (
              <img
                src={previewArticle.image_url}
                alt={previewArticle.title}
                style={{ width: '100%', height: '260px', objectFit: 'cover' }}
              />
            )}

            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{previewArticle.author}</span>
                <span>•</span>
                <span>{previewArticle.read_time}</span>
                <span>•</span>
                <span>{previewArticle.created_at ? new Date(previewArticle.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '16px' }}>
                {previewArticle.title}
              </h2>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '4px solid #3b82f6', paddingLeft: '14px', marginBottom: '20px' }}>
                {previewArticle.excerpt}
              </p>

              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {previewArticle.content || previewArticle.excerpt}
              </div>

              {/* SEO Summary at bottom of preview */}
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                  SEO Metadata Configuration
                </h5>
                <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>Meta Title:</strong> {previewArticle.meta_title || previewArticle.title}</div>
                  <div><strong>Meta Description:</strong> {previewArticle.meta_description || previewArticle.excerpt || 'N/A'}</div>
                  <div><strong>Keywords:</strong> {previewArticle.meta_keywords || 'N/A'}</div>
                  <div><strong>Slug URL:</strong> <code>/articles#{previewArticle.slug || previewArticle.id}</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleManager;
