import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  TrendingUp,
  Calendar,
  PlayCircle,
  BadgeDollarSign,
  LogOut,
  LogIn,
  Sparkles,
  HeadphonesIcon,
} from 'lucide-react';
import { type Theme, type Route } from '../types';
import { Button } from './ui/Button';
import { User as FirebaseUser } from '../firebase/types/user';
import { getUserData } from '../firebase/services/userService';

interface HeaderProps {
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  navigate: (route: Route) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUser: FirebaseUser | null;
  enableBottomMobileBar?: boolean;
}

const navLinks: { label: string; route: Route; icon: React.ReactNode }[] = [
  { label: 'Dashboard', route: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Events', route: 'events', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Watch Ads', route: 'watch-ads', icon: <PlayCircle className="w-5 h-5" /> },
  { label: 'Pricing', route: 'pricing', icon: <BadgeDollarSign className="w-5 h-5" /> },
  { label: 'Buy Coin', route: 'fog-coins', icon: <HeadphonesIcon className="w-5 h-5" /> },
];

const themeSwatches: { value: Theme; label: string; colorClass: string }[] = [
  { value: 'light', label: 'Light', colorClass: 'bg-gray-200' },
  { value: 'dark', label: 'Dark', colorClass: 'bg-gray-700' },
  { value: 'desert', label: 'Desert', colorClass: 'bg-orange-300' },
];

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  setCurrentTheme,
  navigate,
  isLoggedIn,
  onLogout,
  currentUser,
  enableBottomMobileBar = true,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser?.uid) {
        try {
          const userData = await getUserData(currentUser.uid);
          setIsAdmin(userData?.role === 'admin');
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [currentUser]);

  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add('overflow-hidden', 'touch-none');
    } else {
      document.documentElement.classList.remove('overflow-hidden', 'touch-none');
    }
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleMobile = () => setMobileOpen(o => !o);

  const handleNavClick = (route: Route) => {
    if ((route === 'dashboard' || route === 'earnings-dashboard') && !isLoggedIn) {
      navigate('auth');
    } else {
      navigate(route);
    }
    setMobileOpen(false);
  };

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate('admin');
    } else {
      navigate('profile');
    }
    setMobileOpen(false);
  };

  const ThemeSelector = () => (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-[--color-bg-secondary]/70 backdrop-blur-sm">
        {themeSwatches.map(ts => (
          <motion.button
            key={ts.value}
            onClick={() => setCurrentTheme(ts.value)}
            className={`w-6 h-6 rounded-full transition-all border border-transparent ${
              currentTheme === ts.value
                ? 'ring-2 ring-[--color-primary] ring-offset-2 ring-offset-[--color-bg-secondary]'
                : 'hover:ring-2 hover:ring-[--color-primary]/50'
            } ${ts.colorClass}`}
            aria-label={`${ts.label} theme`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      <motion.button
        onClick={() => {
          const order: Theme[] = ['light', 'dark', 'desert'];
          const idx = order.indexOf(currentTheme);
          const next = order[(idx + 1) % order.length];
          setCurrentTheme(next);
        }}
        whileTap={{ scale: 0.9 }}
        className="md:hidden relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[--color-bg-secondary]/70 backdrop-blur-sm border border-white/10 hover:border-[--color-primary]/50 transition"
        aria-label="Cycle theme"
      >
        <Sparkles className="w-5 h-5 text-[--color-primary]" />
        <span className="sr-only">Change theme</span>
      </motion.button>
    </div>
  );

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-[--color-bg-primary]/70 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] border-b border-white/5'
            : 'bg-transparent',
        ].join(' ')}
        role="banner"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <motion.button
            onClick={() => {
              navigate('home');
              setMobileOpen(false);
            }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text text-transparent">
              FOGSLY
            </span>
          </motion.button>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map(link => (
              <motion.button
                key={link.label}
                onClick={() => handleNavClick(link.route)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-sm font-medium text-[--color-text-primary]/80 hover:text-[--color-primary] transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <motion.button
                    onClick={handleProfileClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10"
                  >
                    <User className="w-5 h-5 text-[--color-text-primary]" />
                  </motion.button>
                  <Button variant="ghost" onClick={onLogout}>
                    <LogOut className="w-4 h-4" /> Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('auth')}>
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                  <Button onClick={() => navigate('auth')}>
                    <span>Sign Up</span>
                  </Button>
                </>
              )}
            </div>
            <div className="flex md:hidden items-center gap-2">
              <motion.button
                onClick={toggleMobile}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-[--color-bg-secondary]"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-40 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                key="panel"
                className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm h-screen bg-[--color-bg-primary] border-l border-[--color-border] flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[--color-border]">
                  <button
                    onClick={() => {
                      navigate('home');
                      setMobileOpen(false);
                    }}
                    className="text-lg font-bold bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text text-transparent"
                  >
                    FOGSLY
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileOpen(false)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                  <ul className="space-y-2">
                    {navLinks.map(link => (
                      <li key={link.label}>
                        <motion.button
                          onClick={() => handleNavClick(link.route)}
                          whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left hover:bg-white/[0.06] text-[--color-text-primary]"
                        >
                          {link.icon}
                          {link.label}
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Auth Buttons inside Sidebar */}
                <div className="p-5 border-t border-[--color-border] space-y-3">
                  {isLoggedIn ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleProfileClick}
                      >
                        <User className="w-4 h-4" /> Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={onLogout}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          navigate('auth');
                          setMobileOpen(false);
                        }}
                      >
                        <LogIn className="w-4 h-4" /> Log In
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          navigate('auth');
                          setMobileOpen(false);
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
};

export default Header;
