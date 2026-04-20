import React, { useState } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  Type, 
  MousePointer2, 
  Save, 
  RotateCcw, 
  Plus, 
  ChevronRight, 
  Eye, 
  Clock,
  Sparkles,
  Smartphone,
  Monitor
} from 'lucide-react';

const CMSManager = () => {
  const [activeSection, setActiveSection] = useState('Hero');
  const [previewMode, setPreviewMode] = useState('desktop');

  const siteSections = [
    { id: 'Hero', name: 'Main Hero Banner', items: ['Headline', 'Subtext', 'CTA Button', 'Image'], status: 'Live' },
    { id: 'AdSection', name: 'Promo Ad Strips', items: ['Offer Title', 'Product Image', 'Background Color'], status: 'Live' },
    { id: 'Collections', name: 'Featured Collections', items: ['Category Grid', 'Title'], status: 'Draft' },
    { id: 'Offers', name: 'Top Offer Bar', items: ['Promo Text', 'Countdown'], status: 'Live' },
    { id: 'Testimonials', name: 'Customer Stories', items: ['Quotes', 'Avatars'], status: 'Live' },
    { id: 'Footer', name: 'Footer Links', items: ['Contact Info', 'Social Links'], status: 'Live' },
  ];

  return (
    <div className="adm-fade-in">
      {/* CMS Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Site Visual Editor <Sparkles size={20} color="#3b82f6" style={{display: 'inline', marginLeft: 8}} /></h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>Control your A2P Eco storefront without writing a single line of code.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex', marginRight: '10px' }}>
            <button 
              onClick={() => setPreviewMode('desktop')}
              style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: previewMode === 'desktop' ? '#fff' : 'transparent', boxShadow: previewMode === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              <Monitor size={16} color={previewMode === 'desktop' ? '#3b82f6' : '#94a3b8'} />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: previewMode === 'mobile' ? '#fff' : 'transparent', boxShadow: previewMode === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              <Smartphone size={16} color={previewMode === 'mobile' ? '#3b82f6' : '#94a3b8'} />
            </button>
          </div>
          <button className="adm-btn adm-btn-outline"><RotateCcw size={16} /> Reset</button>
          <button className="adm-btn adm-btn-primary"><Save size={16} /> Publish Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 380px', gap: '20px' }}>
        
        {/* Left: Section Navigator */}
        <div className="adm-card" style={{ height: 'fit-content' }}>
          <div className="adm-card-header" style={{ padding: '16px 20px' }}>
            <h3 className="adm-card-title" style={{ fontSize: '0.85rem' }}>SITE ARCHITECTURE</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '10px' }}>
            {siteSections.map((sec) => (
              <button 
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeSection === sec.id ? '#eff6ff' : 'transparent',
                  color: activeSection === sec.id ? '#3b82f6' : '#64748b',
                  cursor: 'pointer',
                  transition: '0.2s',
                  marginBottom: '4px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layout size={16} strokeWidth={activeSection === sec.id ? 2.5 : 2} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sec.name}</span>
                </div>
                <ChevronRight size={14} opacity={activeSection === sec.id ? 1 : 0.3} />
              </button>
            ))}
            <div className="adm-divider" style={{ margin: '10px 0' }} />
            <button className="adm-btn adm-btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}>
              <Plus size={14} /> Add Custom Section
            </button>
          </div>
        </div>

        {/* Center: Live Preview Builder */}
        <div className="adm-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="adm-card-header" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} color="#3b82f6" />
              <h3 className="adm-card-title">Live Preview: {activeSection}</h3>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>● WYSIWYG MODE</span>
          </div>
          <div className="adm-card-body" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            padding: '40px 20px',
            minHeight: '500px'
          }}>
            {/* Morphing Preview Container */}
            <div style={{ 
              width: previewMode === 'desktop' ? '100%' : '320px',
              maxWidth: '800px',
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              border: '8px solid #0f172a',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Header Mockup */}
              <div style={{ height: '40px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ width: '40px', height: '12px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '60px', height: '8px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '60px', height: '8px', background: '#f1f5f9', borderRadius: '4px' }} />
                <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', marginLeft: 'auto' }} />
              </div>

              {/* Dynamic Content Preview */}
              {activeSection === 'Hero' && (
                <div style={{ textAlign: previewMode === 'desktop' ? 'left' : 'center', padding: '20px 0' }}>
                  <div style={{ display: 'flex', flexDirection: previewMode === 'desktop' ? 'row' : 'column', gap: '30px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: previewMode === 'desktop' ? '2.5rem' : '1.5rem', margin: 0, color: '#1e293b' }}>
                        Elegance in Every Skin Cell
                      </h1>
                      <p style={{ color: '#64748b', marginTop: '15px', fontSize: '0.9rem' }}>
                        Discover the premium secret to glowing skin with our new botanical range.
                      </p>
                      <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '99px', fontWeight: 700, marginTop: '25px', cursor: 'pointer' }}>
                        Shop Collection
                      </button>
                    </div>
                    <div style={{ width: previewMode === 'desktop' ? '240px' : '100%', height: '240px', background: '#eff6ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={48} color="#3b82f6" opacity={0.3} />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'AdSection' && (
                <div style={{ display: 'grid', gridTemplateColumns: previewMode === 'desktop' ? '1fr 1fr' : '1fr', gap: '15px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', padding: '20px', borderRadius: '16px', height: '140px', position: 'relative', overflow: 'hidden' }}>
                    <h4 style={{ margin: 0, fontWeight: 800 }}>Face Cream</h4>
                    <span style={{ fontSize: '0.7rem', background: '#fff', padding: '2px 8px', borderRadius: '99px', marginTop: 10, display: 'inline-block' }}>Upto 40% OFF</span>
                    <div style={{ position: 'absolute', bottom: -10, right: -10, width: '80px', height: '80px', background: '#fff', opacity: 0.5, borderRadius: '50%' }} />
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', padding: '20px', borderRadius: '16px', height: '140px' }}>
                    <h4 style={{ margin: 0, fontWeight: 800 }}>Body Wash</h4>
                    <span style={{ fontSize: '0.7rem', background: '#fff', padding: '2px 8px', borderRadius: '99px', marginTop: 10, display: 'inline-block' }}>Limited Edition</span>
                  </div>
                </div>
              )}

              {/* Placeholder for other sections */}
              {['Hero', 'AdSection'].indexOf(activeSection) === -1 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Layout size={48} color="#e2e8f0" style={{ margin: '0 auto' }} />
                  <p style={{ color: '#94a3b8', marginTop: '10px' }}>Section: {activeSection} Preview ready for update.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Edit Controls */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">SECTION CONTROLS</h3>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="adm-field">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Type size={14} color="#64748b" /> Section Title
                </label>
                <input style={{ padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '8px' }} defaultValue="Elegance in Every Skin Cell" />
              </div>

              <div className="adm-field">
                <label>Description / Subtext</label>
                <textarea 
                  style={{ padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }} 
                  defaultValue="Discover the premium secret to glowing skin with our new botanical range."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="adm-field">
                  <label>CTA Label</label>
                  <input style={{ padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '8px' }} defaultValue="Shop Collection" />
                </div>
                <div className="adm-field">
                  <label>CTA Color</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '38px', height: '38px', background: '#3b82f6', borderRadius: '8px', cursor: 'pointer', border: '3px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
                    <div style={{ width: '38px', height: '38px', background: '#f43f5e', borderRadius: '8px', cursor: 'pointer' }} />
                    <div style={{ width: '38px', height: '38px', background: '#1e293b', borderRadius: '8px', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>

              <div className="adm-divider" />

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '10px', display: 'block' }}>MEDIA ASSETS</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={20} color="#94a3b8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>Banner_Primary.png</p>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>1.2 MB • 1920x1080</span>
                  </div>
                  <button className="adm-btn adm-btn-outline" style={{ padding: '6px', minWidth: '40px' }}><MousePointer2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '10px', flex: 1, border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                    <Clock size={12} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>LAST SYNC</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: '4px 0 0' }}>4 mins ago</p>
                </div>
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', flex: 1, border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>
                    <Plus size={12} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>VERSIONS</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: '4px 0 0' }}>#12 Active</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CMSManager;
