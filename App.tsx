import React, { useState, useEffect, useMemo } from 'react';
import { type Theme, type Route } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import FogCoinsPage from './pages/FogCoinsPage';
import AuthPage from './pages/AuthPage';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
// import WatchAdsPage from './pages/WatchAdsPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import PressPage from './pages/PressPage';
import BlogPage from './pages/BlogPage';
import FeaturesPage from './pages/FeaturesPage';
import ApiPage from './pages/ApiPage';
import HelpCenterPage from './pages/HelpCenterPage';
import CommunityPage from './pages/CommunityPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import FloatingActionButton from './components/FloatingActionButton';
import ChatPage from './pages/ChatPage';
import CustomerServicePage from './pages/CustomerServicePage';
import AdminPage from './pages/AdminPage';
import { onAuthStateChange, signOutUser } from './firebase/services/authService';
import { User } from './firebase/types/user';
import WatchAdPage from './pages/WatchAdPage';

// Helper function to get route from URL
const getRouteFromPath = (pathname: string): Route => {
  const path = pathname.replace('/', '') || 'home';
  
  const validRoutes: Route[] = [
    'home', 'fog-coins', 'auth', 'dashboard', 'profile', 'events', 
    'watch-ads', 'pricing', 'about', 'careers', 'press', 'blog', 
    'features', 'api', 'help-center', 'community', 'privacy-policy', 
    'terms', 'chat', 'customer-service', 'admin'
  ];
  
  return validRoutes.includes(path as Route) ? (path as Route) : 'home';
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [route, setRoute] = useState<Route>(() => getRouteFromPath(window.location.pathname));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Apply theme when changed
  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.className = currentTheme;
  }, [currentTheme]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          emailVerified: firebaseUser.emailVerified
        };
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const navigate = (newRoute: Route) => {
    setRoute(newRoute);
    
    // Update browser URL
    const path = newRoute === 'home' ? '/' : `/${newRoute}`;
    window.history.pushState(null, '', path);
    
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      setCurrentUser(null);
      navigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showHeaderAndFooter = route !== 'auth' && route !== 'admin' && !(route === 'dashboard' && !isLoggedIn) && !(route === 'profile' && !isLoggedIn);

  const renderContent = () => {
    // Show loading spinner while checking auth state
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[--color-primary]"></div>
        </div>
      );
    }

    switch (route) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'fog-coins': return <FogCoinsPage navigate={navigate} />;
      case 'auth': return <AuthPage navigate={navigate} onLogin={handleLogin} />;
      case 'dashboard': return isLoggedIn ? <DashboardPage /> : <AuthPage navigate={navigate} onLogin={handleLogin} />;
      case 'profile': return isLoggedIn ? <ProfilePage navigate={navigate} currentUser={currentUser} /> : <AuthPage navigate={navigate} onLogin={handleLogin} />;
      case 'events': return <EventsPage />;
      case 'watch-ads': return <WatchAdPage navigate={navigate} />;
      case 'pricing': return <PricingPage />;
      case 'about': return <AboutPage />;
      case 'careers': return <CareersPage />;
      case 'press': return <PressPage />;
      case 'blog': return <BlogPage />;
      case 'features': return <FeaturesPage />;
      case 'api': return <ApiPage />;
      case 'help-center': return <HelpCenterPage />;
      case 'community': return <CommunityPage />;
      case 'privacy-policy': return <PrivacyPolicyPage />;
      case 'terms': return <TermsPage />;
      case 'chat': return <ChatPage />;
      case 'customer-service': return <CustomerServicePage />;
      case 'admin': return <AdminPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--color-bg-primary] text-[--color-text-primary] transition-colors duration-300">
      {showHeaderAndFooter && (
        <Header
          currentTheme={currentTheme}
          setCurrentTheme={handleThemeChange}
          navigate={navigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      )}
      <main className="flex-1">
        {renderContent()}
      </main>
      {showHeaderAndFooter && <Footer navigate={navigate} />}
      <FloatingActionButton navigate={navigate} />
    </div>
  );
}