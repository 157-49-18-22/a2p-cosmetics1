import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import FaceWash from './pages/FaceWash/FaceWash';
import FaceSerum from './pages/FaceSerum/FaceSerum';
import FaceCream from './pages/FaceCream/FaceCream';
import BodyWash from './pages/BodyWash/BodyWash';
import Articles from './pages/Articles/Articles';
import Contact from './pages/Contact/Contact';


import CartSidebar from './components/Cart/CartSidebar';
import DistributorDashboard from './pages/DistributorDashboard/DistributorDashboard';
import AgentDashboard from './pages/AgentDashboard/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
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
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/distributor') || pathname.startsWith('/agent') || pathname.startsWith('/admin');

  return (
    <div className="app">
      <ScrollToTop />
      <CartSidebar />
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facewash" element={<FaceWash />} />
        <Route path="/faceserum" element={<FaceSerum />} />
        <Route path="/facecream" element={<FaceCream />} />
        <Route path="/bodywash" element={<BodyWash />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/contact" element={<Contact />} />


        <Route path="/distributor/*" element={<DistributorDashboard />} />
        <Route path="/agent/*" element={<AgentDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;
