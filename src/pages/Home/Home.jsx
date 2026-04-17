import React from 'react';
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import AdSection from '../../components/AdSection/AdSection';
import Bestsellers from '../../components/Bestsellers/Bestsellers';
import About from '../../components/About/About';
import CTASection from '../../components/CTASection/CTASection';
import Testimonials from '../../components/Testimonials/Testimonials';
import Newsletter from '../../components/Newsletter/Newsletter';

const Home = () => {
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
