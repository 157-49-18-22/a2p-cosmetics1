import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import FaceWash from './pages/FaceWash/FaceWash';
import FaceSerum from './pages/FaceSerum/FaceSerum';
import './App.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facewash" element={<FaceWash />} />
        <Route path="/faceserum" element={<FaceSerum />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
