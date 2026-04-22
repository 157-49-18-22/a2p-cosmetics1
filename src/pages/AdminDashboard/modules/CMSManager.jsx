import React, { useState, useEffect } from 'react';
import {
  Layout, Image as ImageIcon, Type, MousePointer2, Save, RotateCcw, Plus,
  ChevronRight, Eye, Clock, Sparkles, Smartphone, Monitor, CheckCircle, AlertCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const siteSections = [
  { id: 'hero', name: 'Main Hero Banner', desc: 'Main headline, subtext and CTA button' },
  { id: 'offer_bar', name: 'Promo Offer Bar', desc: 'Top announcement banner text' },
  { id: 'ad_section_1', name: 'Ad Strip — Left', desc: 'Left promotional card content' },
  { id: 'ad_section_2', name: 'Ad Strip — Right', desc: 'Right promotional card content' },
];

const CMSManager = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [banners, setBanners] = useState({});
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/banners`);
      const data = await res.json();
      const map = {};
      data.forEach(b => { map[b.section_key] = b; });
      setBanners(map);
      setForm(map['hero'] || {});
    } catch (e) {
      showToast('Failed to load banners', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  useEffect(() => {
    setForm(banners[activeSection] || { title: '', subtitle: '', cta_label: '', cta_color: '#3b82f6', image_url: '' });
  }, [activeSection, banners]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/banners/${activeSection}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('Changes published! Website will update now.');
      fetchBanners();
    } catch (e) {
      showToast('Publish failed. Check backend.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(banners[activeSection] || {});
  };

  const currentSection = siteSections.find(s => s.id === activeSection);

  return (
    <div className="adm-fade-in">
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#10b981' : '#f43f5e', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
            Site Visual Editor <Sparkles size={20} color="#3b82f6" style={{ display: 'inline', marginLeft: 8 }} />
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Edit your A2P Eco storefront content. Changes go <strong>live instantly</strong> on the website.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Preview toggle */}
          <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex' }}>
            <button onClick={() => setPreviewMode('desktop')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: previewMode === 'desktop' ? '#fff' : 'transparent', boxShadow: previewMode === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              <Monitor size={16} color={previewMode === 'desktop' ? '#3b82f6' : '#94a3b8'} />
            </button>
            <button onClick={() => setPreviewMode('mobile')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: previewMode === 'mobile' ? '#fff' : 'transparent', boxShadow: previewMode === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              <Smartphone size={16} color={previewMode === 'mobile' ? '#3b82f6' : '#94a3b8'} />
            </button>
          </div>
          <button className="adm-btn adm-btn-outline" onClick={handleReset}><RotateCcw size={16} /> Reset</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving || loading}>
            <Save size={16} /> {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 360px', gap: '20px' }}>

        {/* Left: Section Navigator */}
        <div className="adm-card" style={{ height: 'fit-content' }}>
          <div className="adm-card-header" style={{ padding: '16px 20px' }}>
            <h3 className="adm-card-title" style={{ fontSize: '0.85rem' }}>SITE SECTIONS</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '10px' }}>
            {siteSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: activeSection === sec.id ? '#eff6ff' : 'transparent',
                  color: activeSection === sec.id ? '#3b82f6' : '#64748b',
                  transition: '0.2s', marginBottom: '4px', textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Layout size={16} strokeWidth={activeSection === sec.id ? 2.5 : 2} style={{ marginTop: '2px' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', display: 'block' }}>{sec.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>{sec.desc}</span>
                  </div>
                </div>
                <ChevronRight size={14} opacity={activeSection === sec.id ? 1 : 0.3} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Preview */}
        <div className="adm-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="adm-card-header" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="#3b82f6" />
              <h3 className="adm-card-title">Live Preview — {currentSection?.name}</h3>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>● WYSIWYG</span>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px', minHeight: '480px' }}>
            <div style={{
              width: previewMode === 'desktop' ? '100%' : '320px',
              maxWidth: '800px', background: '#fff', borderRadius: '20px', padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '6px solid #0f172a',
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden'
            }}>
              {/* Header Mockup */}
              <div style={{ height: '36px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
                <div style={{ width: '36px', height: '10px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '50px', height: '7px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '50px', height: '7px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '22px', height: '22px', background: '#f1f5f9', borderRadius: '50%', marginLeft: 'auto' }} />
              </div>

              {/* Hero Preview */}
              {activeSection === 'hero' && (
                <div style={{ textAlign: previewMode === 'mobile' ? 'center' : 'left' }}>
                  <div style={{ display: 'flex', flexDirection: previewMode === 'mobile' ? 'column' : 'row', gap: '24px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: previewMode === 'mobile' ? '1.4rem' : '2.2rem', margin: 0, color: '#1e293b', lineHeight: 1.3 }}>
                        {form.title || 'Your Hero Title Here'}
                      </h1>
                      <p style={{ color: '#64748b', marginTop: '12px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        {form.subtitle || 'Your subtitle text will appear here.'}
                      </p>
                      <button style={{ background: form.cta_color || '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '99px', fontWeight: 700, marginTop: '20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {form.cta_label || 'Shop Now'}
                      </button>
                    </div>
                    <div style={{ width: previewMode === 'mobile' ? '100%' : '200px', height: '180px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {form.image_url ? <img src={form.image_url} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : <ImageIcon size={40} color="#3b82f6" opacity={0.3} />}
                    </div>
                  </div>
                </div>
              )}

              {/* Offer Bar Preview */}
              {activeSection === 'offer_bar' && (
                <div style={{ background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                  {form.title || 'Your promo text here'}
                </div>
              )}

              {/* Ad Section Previews */}
              {(activeSection === 'ad_section_1' || activeSection === 'ad_section_2') && (
                <div style={{ background: activeSection === 'ad_section_1' ? 'linear-gradient(135deg,#fce7f3,#fbcfe8)' : 'linear-gradient(135deg,#e0f2fe,#bae6fd)', padding: '24px', borderRadius: '16px', minHeight: '140px' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>{form.title || 'Ad Title'}</h4>
                  <p style={{ margin: '8px 0', fontSize: '0.82rem', color: '#475569' }}>{form.subtitle || 'Subtitle text'}</p>
                  {form.cta_label && (
                    <button style={{ background: form.cta_color || '#3b82f6', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: '99px', fontWeight: 700, fontSize: '0.78rem', marginTop: '10px' }}>
                      {form.cta_label}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Edit Controls */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">SECTION CONTROLS</h3>
          </div>
          <div className="adm-card-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="adm-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Type size={14} color="#64748b" /> {activeSection === 'offer_bar' ? 'Offer Text' : 'Title / Headline'}
                  </label>
                  <input style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem' }}
                    value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter title..." />
                </div>

                {activeSection !== 'offer_bar' && (
                  <div className="adm-field">
                    <label>Subtitle / Description</label>
                    <textarea style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', minHeight: '80px', fontSize: '0.88rem', resize: 'vertical' }}
                      value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                      placeholder="Enter subtitle..." />
                  </div>
                )}

                {activeSection !== 'offer_bar' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="adm-field">
                      <label>CTA Label</label>
                      <input style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem' }}
                        value={form.cta_label || ''} onChange={e => setForm({ ...form, cta_label: e.target.value })}
                        placeholder="Shop Now" />
                    </div>
                    <div className="adm-field">
                      <label>CTA Color</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="color" value={form.cta_color || '#3b82f6'} onChange={e => setForm({ ...form, cta_color: e.target.value })}
                          style={{ width: '44px', height: '38px', borderRadius: '8px', border: '1.5px solid #e2e8f0', cursor: 'pointer', padding: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{form.cta_color || '#3b82f6'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'hero' && (
                  <div className="adm-field">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={14} color="#64748b" /> Hero Image URL</label>
                    <input style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem' }}
                      value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://..." />
                    {form.image_url && (
                      <img src={form.image_url} alt="preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '1px solid #e2e8f0' }}
                        onError={e => e.target.style.display='none'} />
                    )}
                  </div>
                )}

                <div className="adm-divider" />

                <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={14} color="#16a34a" />
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>LAST PUBLISHED</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: '2px 0 0' }}>
                      {banners[activeSection]?.updated_at ? new Date(banners[activeSection].updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </p>
                  </div>
                </div>

                <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving} style={{ justifyContent: 'center' }}>
                  <Save size={16} /> {saving ? 'Publishing...' : 'Publish to Website'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSManager;
