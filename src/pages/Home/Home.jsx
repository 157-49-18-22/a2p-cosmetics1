import API_BASE_URL from '../../apiConfig.js';
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../../components/Notifications/NotificationHub';
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import AdSection from '../../components/AdSection/AdSection';
import Bestsellers from '../../components/Bestsellers/Bestsellers';
import About from '../../components/About/About';
import CTASection from '../../components/CTASection/CTASection';
import Testimonials from '../../components/Testimonials/Testimonials';
import Newsletter from '../../components/Newsletter/Newsletter';

const Home = () => {
  const { showNotification } = useNotifications();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let timers = [];
    const fetchBroadcasts = async () => {
      try {
        const res = await fetch(`API_BASE_URL_PLACEHOLDER/announcements');
        const data = await res.json();
        const active = data.filter(n => n.status === 'Active');
        
        active.forEach((n, index) => {
          const t = setTimeout(() => {
            showNotification({
              type: n.type.toLowerCase() === 'promotion' ? 'promo' : 'info',
              title: n.title,
              message: n.message,
              duration: 8000
            });
          }, 2000 + (index * 4000));
          timers.push(t);
        });
      } catch (err) { console.error('Broadcast fetch failed:', err); }
    };

    fetchBroadcasts();
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <>
      <div className="hero-header-stack">
        <Hero />
      </div>
      <main>
        <Categories />
        <AdSection />
        <Bestsellers />
        <About />
        <CTASection />
        <Testimonials />
        <Newsletter />
      </main>
    </>
  );
};

export default Home;
