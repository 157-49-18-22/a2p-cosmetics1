import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import FaceWash from './pages/FaceWash/FaceWash';
import FaceSerum from './pages/FaceSerum/FaceSerum';
import FaceCream from './pages/FaceCream/FaceCream';
import BodyWash from './pages/BodyWash/BodyWash';
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
        <Route path="/facecream" element={<FaceCream />} />
        <Route path="/bodywash" element={<BodyWash />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
