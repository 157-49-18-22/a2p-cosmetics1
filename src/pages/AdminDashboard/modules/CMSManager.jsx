import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, Layers, Package, ChevronRight, 
  Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';
import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import TestimonialManager from './TestimonialManager';

const API = 'http://localhost:5000/api';

const siteSections = [
  { id: 'testimonials', name: 'Testimonials', desc: 'Customer reviews', icon: MessageSquareQuote },
  { id: 'categories', name: 'Categories', desc: 'Product classification', icon: Layers },
  { id: 'products', name: 'Products', desc: 'Full catalog', icon: Package },
];

const CMSManager = () => {
  const [activeSection, setActiveSection] = useState('testimonials');
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const cRes = await fetch(`${API}/categories`);
      const cData = await cRes.json();
      setCategories(cData);
    } catch (e) {
      showToast('Failed to load CMS data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const activeCategory = categories.find(c => `cat_${c.slug}` === activeSection);
  const isCategoryView = !!activeCategory;

  const allSections = [
    ...siteSections,
    { id: 'divider', name: 'CATALOG SECTIONS', isDivider: true },
    ...categories.map(cat => ({
      id: `cat_${cat.slug}`,
      name: cat.name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      icon: Package
    }))
  ];

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
            CMS Manager <Sparkles size={20} color="#3b82f6" style={{ display: 'inline', marginLeft: 8 }} />
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Manage website banners, testimonials, and individual product categories.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>

        {/* Sidebar: Content Selection */}
        <div className="adm-card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div className="adm-card-header" style={{ padding: '16px 20px' }}>
            <h3 className="adm-card-title" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CONTENT MODULES</h3>
          </div>
          <div className="adm-card-body" style={{ padding: '8px' }}>
            {allSections.map((sec) => (
              sec.isDivider ? (
                <div key={sec.id} style={{ padding: '16px 14px 8px', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  {sec.name}
                </div>
              ) : (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: activeSection === sec.id ? '#eff6ff' : 'transparent',
                    color: activeSection === sec.id ? '#3b82f6' : '#64748b',
                    transition: '0.2s', marginBottom: '4px', textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <sec.icon size={18} strokeWidth={activeSection === sec.id ? 2.5 : 2} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sec.name}</span>
                  </div>
                  <ChevronRight size={14} opacity={activeSection === sec.id ? 1 : 0.3} />
                </button>
              )
            ))}
          </div>
        </div>

        {/* Main Workspace */}
        <div style={{ minWidth: 0 }}>
          {activeSection === 'testimonials' ? (
            <TestimonialManager />
          ) : activeSection === 'categories' ? (
            <CategoryManager />
          ) : activeSection === 'products' ? (
            <ProductManager />
          ) : isCategoryView ? (
            <ProductManager initialCategory={activeCategory.name} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CMSManager;
