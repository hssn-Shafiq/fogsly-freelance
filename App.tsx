import React, { useState, useEffect, useMemo } from 'react';
import { type Theme, type Route } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import FogCoinsPage from './pages/FogCoinsPage';
import AuthPage from './pages/AuthPage';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import { EarningsDashboardPage } from './pages/EarningsDashboardPage';
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
import RankCongratulationsModal from './components/modals/RankCongratulationsModal';
import { onAuthStateChange, signOutUser } from './firebase/services/authService';
import { getUserProfile } from './firebase/services/userService'; // ✅ Added getUserProfile import
import { User } from './firebase/types/user';
import WatchAdPage from './pages/WatchAdPage';
import AdAnalyticsPage from './pages/admin/AdAnalyticsPage'; 

// Helper function to get route from URL
const getRouteFromPath = (pathname: string): Route => {
  const path = pathname.replace('/', '') || 'home';
  
   // Handle admin sub-routes
  if (path.startsWith('admin/ad-analytics/')) {
    return 'admin/ad-analytics';
  }
  const validRoutes: Route[] = [
    'home', 'fog-coins', 'auth', 'dashboard', 'profile', 'earnings-dashboard',
    'events', 'watch-ads', 'pricing', 'about', 'careers', 'press', 'blog', 
    'features', 'api', 'help-center', 'community', 'privacy-policy', 
    'terms', 'chat', 'customer-service', 'admin', 'admin/ad-analytics'
  ];
  
  return validRoutes.includes(path as Route) ? (path as Route) : 'home';
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [route, setRoute] = useState<Route>(() => getRouteFromPath(window.location.pathname));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Congratulations modal state
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null); // ✅ Changed to null initially
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(false); // ✅ Added loading state

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

  // ✅ New function to fetch user profile and rank
  const fetchUserRank = async (userId: string): Promise<number> => {
    try {
      setIsLoadingUserProfile(true);
      const userProfile = await getUserProfile(userId);
      
      if (userProfile && typeof userProfile.rank === 'number') {
        return userProfile.rank;
      } else {
        // If no rank is set, return a default rank (e.g., for new users)
        console.log('No rank found in user profile, using default rank');
        return 1337; // Default rank for new users
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return default rank on error
      return 1337;
    } finally {
      setIsLoadingUserProfile(false);
    }
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          emailVerified: firebaseUser.emailVerified
        };
        
        const wasLoggedIn = isLoggedIn;
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // ✅ Fetch user's actual rank from profile
        try {
          const actualRank = await fetchUserRank(firebaseUser.uid);
          setUserRank(actualRank);
          
          // Show congratulations modal for new login (not on page refresh)
          if (!wasLoggedIn && !isAuthLoading) {
            setIsNewUser(true);
            
            // Delay showing modal to let navigation settle and rank to load
            setTimeout(() => {
              setShowCongratulationsModal(true);
            }, 2000); // ✅ Increased delay to allow rank loading
          }
        } catch (error) {
          console.error('Error loading user rank:', error);
          // Still show modal with default rank if there's an error
          setUserRank(1337);
          
          if (!wasLoggedIn && !isAuthLoading) {
            setIsNewUser(true);
            setTimeout(() => {
              setShowCongratulationsModal(true);
            }, 2000);
          }
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsLoggedIn(false);
        setUserRank(null); // ✅ Reset rank on logout
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isLoggedIn, isAuthLoading]);

  const navigate = (newRoute: Route | string) => {
    // Handle navigation with parameters
    if (typeof newRoute === 'string' && newRoute.startsWith('admin/ad-analytics/')) {
      // Update URL for dynamic route
      window.history.pushState(null, '', `/${newRoute}`);
      setRoute('admin/ad-analytics');
      return;
    }
    
    setRoute(newRoute as Route);
    window.history.pushState(null, '', newRoute === 'home' ? '/' : `/${newRoute}`);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUserRank(null); // ✅ Reset rank on logout
      navigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCloseCongratulationsModal = () => {
    setShowCongratulationsModal(false);
    setIsNewUser(false);
    // Navigate to home if not already there
    if (route !== 'home') {
      navigate('home');
    }
  };

  // ✅ Updated test function to refetch actual rank
  const triggerCongratulationsModal = async (testRank?: number) => {
    if (testRank) {
      // Use provided test rank
      setUserRank(testRank);
    } else if (currentUser) {
      // Fetch actual user rank
      const actualRank = await fetchUserRank(currentUser.uid);
      setUserRank(actualRank);
    } else {
      // Default rank if no user
      setUserRank(1337);
    }
    
    setIsNewUser(false);
    setShowCongratulationsModal(true);
  };

  // Make it available globally for testing
  React.useEffect(() => {
    (window as any).showRankModal = triggerCongratulationsModal;
  }, [currentUser]);

  const showHeaderAndFooter = route !== 'auth' && route !== 'admin' && !(route === 'dashboard' && !isLoggedIn) && !(route === 'profile' && !isLoggedIn) && !(route === 'earnings-dashboard' && !isLoggedIn);

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
      case 'earnings-dashboard': return isLoggedIn ? <EarningsDashboardPage /> : <AuthPage navigate={navigate} onLogin={handleLogin} />;
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
      case 'customer-service': return <CustomerServicePage navigate={navigate} />;
      case 'admin': return <AdminPage navigate={navigate} />;
     case 'admin/ad-analytics': {
        // Extract ad ID from current URL
        const currentPath = window.location.pathname;
        const adId = currentPath.split('/').pop();
        return <AdAnalyticsPage navigate={navigate} adId={adId} />;
      }
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
          currentUser={currentUser}
        />
      )}
      <main className="flex-1">
        {renderContent()}
      </main>
      {showHeaderAndFooter && <Footer navigate={navigate} />}
      <FloatingActionButton navigate={navigate} />
      
      {/* ✅ Updated Rank Congratulations Modal with real rank */}
      {userRank !== null && (
        <RankCongratulationsModal
          isOpen={showCongratulationsModal}
          onClose={handleCloseCongratulationsModal}
          userRank={userRank}
          userName={currentUser?.displayName || currentUser?.email?.split('@')[0] || 'FOGSLY User'}
          isNewUser={isNewUser}
        />
      )}
      
      {/* ✅ Optional: Show loading indicator when fetching user profile */}
      {isLoadingUserProfile && (
        <div className="fixed bottom-4 right-4 bg-[--color-bg-secondary] text-[--color-text-primary] px-4 py-2 rounded-lg shadow-lg border border-[--color-border]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--color-primary]"></div>
            <span className="text-sm">Loading rank...</span>
          </div>
        </div>
      )}
    </div>
  );
}