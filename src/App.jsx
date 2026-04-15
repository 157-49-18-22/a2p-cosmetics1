import React from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Categories from './components/Categories/Categories';
import AdSection from './components/AdSection/AdSection';
import Bestsellers from './components/Bestsellers/Bestsellers';

import About from './components/About/About';
import CTASection from './components/CTASection/CTASection';

import Testimonials from './components/Testimonials/Testimonials';

import Newsletter from './components/Newsletter/Newsletter';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Categories />
        <AdSection />
        <Bestsellers />

        <About />
        <CTASection />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
