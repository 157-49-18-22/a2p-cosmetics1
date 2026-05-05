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
import WishlistSidebar from './components/Cart/WishlistSidebar';
import DistributorDashboard from './pages/DistributorDashboard/DistributorDashboard';
import AgentDashboard from './pages/AgentDashboard/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import LoginModal from './components/Modals/LoginModal';
import { useAuth } from './context/AuthContext';

// Profile Pages
import MyOrders from './pages/Profile/MyOrders';
import MyAddresses from './pages/Profile/MyAddresses';
import SavedItems from './pages/Profile/SavedItems';
import SkinProfile from './pages/Profile/SkinProfile';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/Checkout/OrderSuccess';
import LoginPage from './pages/Auth/LoginPage';
import Auth from './pages/Auth/Auth';
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children, type }) => {
  const { user } = useAuth();
  
  if (type === 'distributor' || type === 'agent') {
    const storageKey = type === 'distributor' ? 'active_distributor' : 'active_agent';
    const authUser = localStorage.getItem(storageKey);
    if (!authUser) {
      return <Navigate to={type === 'distributor' ? '/distributor/login' : '/agent/login'} replace />;
    }
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};


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
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboard = pathname.startsWith('/distributor') || pathname.startsWith('/agent') || pathname.startsWith('/admin') || isAuthPage;

  return (
    <div className="app">
      <ScrollToTop />
      <CartSidebar />
      <WishlistSidebar />
      <LoginModal />
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/facewash" element={<FaceWash />} />
        <Route path="/faceserum" element={<FaceSerum />} />
        <Route path="/facecream" element={<FaceCream />} />
        <Route path="/bodywash" element={<BodyWash />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/contact" element={<Contact />} />

        {/* User Profile Routes */}
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/my-addresses" element={<ProtectedRoute><MyAddresses /></ProtectedRoute>} />
        <Route path="/saved-items" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
        <Route path="/skin-profile" element={<ProtectedRoute><SkinProfile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />


        <Route path="/distributor/login" element={<LoginPage type="distributor" />} />
        <Route 
          path="/distributor/*" 
          element={
            <ProtectedRoute type="distributor">
              <DistributorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/agent/login" element={<LoginPage type="agent" />} />
        <Route 
          path="/agent/*" 
          element={
            <ProtectedRoute type="agent">
              <AgentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;

