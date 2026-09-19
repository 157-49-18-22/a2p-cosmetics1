import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import NewArrivals from './pages/NewArrivals/NewArrivals';
import AllProducts from './pages/AllProducts/AllProducts';
import FaceWash from './pages/FaceWash/FaceWash';
import FaceSerum from './pages/FaceSerum/FaceSerum';
import FaceCream from './pages/FaceCream/FaceCream';
import BodyWash from './pages/BodyWash/BodyWash';
import Articles from './pages/Articles/Articles';
import Contact from './pages/Contact/Contact';
import ProductDetail from './pages/ProductDetail/ProductDetail';

// Tracking & Analytics Imports
import { initGA, logGAEvent } from './utils/analytics';
import { trackUserActivity, getOrCreateSession, incrementSessionPage } from './utils/track';


import CartSidebar from './components/Cart/CartSidebar';
import WishlistSidebar from './components/Cart/WishlistSidebar';
import WhatsAppWidget from './components/WhatsAppWidget/WhatsAppWidget';
import DistributorDashboard from './pages/DistributorDashboard/DistributorDashboard';
import AgentDashboard from './pages/AgentDashboard/AgentDashboard';
import DealerDashboard from './pages/DealerDashboard/DealerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import LoginModal from './components/Modals/LoginModal';
import { useAuth } from './context/AuthContext';

// Profile Pages
import MyOrders from './pages/Profile/MyOrders';
import MyAddresses from './pages/Profile/MyAddresses';
import SavedItems from './pages/Profile/SavedItems';
import HelpSupport from './pages/Profile/HelpSupport';
import Checkout from './pages/Checkout/Checkout';
import OrderSuccess from './pages/Checkout/OrderSuccess';
import LoginPage from './pages/Auth/LoginPage';
import Auth from './pages/Auth/Auth';
import { Navigate } from 'react-router-dom';


const ProtectedRoute = ({ children, type }) => {
  const { user, loading } = useAuth();

  // Wait for the cookie-based auth check to complete before deciding
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0f172a', color: '#fff', fontSize: '1rem' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    // Redirect to the correct login page based on portal type
    const loginPath = type === 'distributor' ? '/distributor/login'
      : type === 'agent' ? '/agent/login'
      : type === 'dealer' ? '/dealer/login'
      : '/login';
    return <Navigate to={loginPath} replace />;
  }

  const isAdmin = user && (user.role === 'Admin' || user.role === 'admin' || user.email === 'admin@crm.com' || user.email?.startsWith('admin@'));
  if (type === 'admin' && !isAdmin) {
    return <Navigate to="/my-orders" replace />;
  }

  return children;
};


import './App.css';

// Scroll to top on route change, track page views, session & behaviour
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);

    // Initialise / refresh session
    getOrCreateSession();
    incrementSessionPage();

    // Log page_view to GA4 with session info
    logGAEvent('page_view', { page_path: pathname });

    // Track activity in DB (with session data attached inside trackUserActivity)
    trackUserActivity('page_navigate', pathname);
  }, [pathname]);
  return null;
};


function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboard = pathname.startsWith('/distributor') || pathname.startsWith('/agent') || pathname.startsWith('/dealer') || pathname.startsWith('/admin') || isAuthPage;

  React.useEffect(() => {
    initGA();
  }, []);

  return (
    <div className="app">
      <ScrollToTop />
      <CartSidebar />
      <WishlistSidebar />
      <WhatsAppWidget />
      <LoginModal />

      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/newarrivals" element={<Navigate to="/new-arrivals" replace />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/products" element={<Navigate to="/all-products" replace />} />
        <Route path="/facewash" element={<FaceWash />} />
        <Route path="/faceserum" element={<FaceSerum />} />
        <Route path="/facecream" element={<FaceCream />} />
        <Route path="/bodywash" element={<BodyWash />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* User Profile Routes */}
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        <Route path="/support" element={<Navigate to="/help-support" replace />} />
        <Route path="/report" element={<Navigate to="/help-support" replace />} />
        <Route path="/my-addresses" element={<ProtectedRoute><MyAddresses /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><SavedItems /></ProtectedRoute>} />
        <Route path="/saved-items" element={<Navigate to="/wishlist" replace />} />
        <Route path="/skin-profile" element={<Navigate to="/my-orders" replace />} />
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

        <Route path="/dealer/login" element={<LoginPage type="dealer" />} />
        <Route 
          path="/dealer/*" 
          element={
            <ProtectedRoute type="dealer">
              <DealerDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute type="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;

