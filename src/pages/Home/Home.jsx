import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Simulated Push Notifications
    const timer1 = setTimeout(() => {
      showNotification({
        type: 'promo',
        title: 'FLASH SALE LIVE!',
        message: 'Use code GLOW50 for 50% OFF on all Face Serums. Limited time only!',
        duration: 8000
      });
    }, 2000);

    const timer2 = setTimeout(() => {
      showNotification({
        type: 'info',
        title: 'New Journal Post',
        message: 'Read our latest article: "The Ultimate Guide to Glow: Morning vs Evening Routine".',
        duration: 6000
      });
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
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
