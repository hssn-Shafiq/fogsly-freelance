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
  HeadphonesIcon
} from 'lucide-react';
import { type Theme, type Route } from '../types';
import { Button } from './ui/Button';
import { User as FirebaseUser } from "../firebase/types/user";
import { getUserData } from '../firebase/services/userService';


interface HeaderProps {
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  navigate: (route: Route) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  currentUser: FirebaseUser | null;
  // Optional: decide whether to render a bottom nav bar on mobile
  enableBottomMobileBar?: boolean;
}

// const navLinks: { label: string; route: Route; icon: React.ReactNode }[] = [
//   { label: 'Dashboard', route: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
//   { label: 'Earnings', route: 'earnings-dashboard', icon: <TrendingUp className="w-5 h-5" /> },
//   { label: 'Events', route: 'events', icon: <Calendar className="w-5 h-5" /> },
//   { label: 'Watch Ads', route: 'watch-ads', icon: <PlayCircle className="w-5 h-5" /> },
//   { label: 'Pricing', route: 'pricing', icon: <BadgeDollarSign className="w-5 h-5" /> },
// ];
const navLinks: { label: string; route: Route; icon: React.ReactNode }[] = [
  { label: 'Dashboard', route: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Events', route: 'events', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Watch Ads', route: 'watch-ads', icon: <PlayCircle className="w-5 h-5" /> },
  { label: 'Pricing', route: 'pricing', icon: <BadgeDollarSign className="w-5 h-5" /> },
  { label: 'Support', route: 'customer-service', icon: <HeadphonesIcon className="w-5 h-5" /> },
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

    // Check if current user is admin
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

  console.log("current user is ", currentUser);
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add('overflow-hidden', 'touch-none');
    } else {
      document.documentElement.classList.remove('overflow-hidden', 'touch-none');
    }
  }, [mobileOpen]);

  // Close on ESC
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

    // Handle profile/admin navigation
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
      {/* Desktop (pill group) */}
      <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-[--color-bg-secondary]/70 backdrop-blur-sm">
        {themeSwatches.map(ts => (
          <motion.button
            key={ts.value}
            onClick={() => setCurrentTheme(ts.value)}
            className={`w-6 h-6 rounded-full transition-all border border-transparent ${currentTheme === ts.value
                ? 'ring-2 ring-[--color-primary] ring-offset-2 ring-offset-[--color-bg-secondary]'
                : 'hover:ring-2 hover:ring-[--color-primary]/50'
              } ${ts.colorClass}`}
            aria-label={`${ts.label} theme`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Mobile (compact single icon cycling) */}
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
          {/* Logo */}
          <motion.button
            onClick={() => { navigate('home'); setMobileOpen(false); }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-[--color-primary] rounded"
            aria-label="Go to homepage"
          >
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[--color-primary] via-[--color-primary] to-[--color-accent] bg-clip-text text-transparent group-hover:scale-[1.03] transition-transform">
              FOGSLY
            </span>
          </motion.button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map(link => (
              <motion.button
                key={link.label}
                onClick={() => handleNavClick(link.route)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-sm font-medium text-[--color-text-primary]/80 hover:text-[--color-primary] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] rounded"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[--color-primary] transition-all group-hover:w-full" />
              </motion.button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeSelector />

            {/* Desktop Auth / Profile */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <motion.button
                    onClick={handleProfileClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10 hover:border-[--color-primary]/50 transition"
                   aria-label={isAdmin ? "Admin Panel" : "Profile"}
                    title={isAdmin ? "Go to Admin Panel" : "Go to Profile"}
                  >
                    <User className="w-5 h-5 text-[--color-text-primary]" />
                  </motion.button>
                  <Button variant="ghost" onClick={onLogout} className="flex items-center gap-1">
                    <LogOut className="w-4 h-4" /> Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('auth')} className="flex items-center gap-1">
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                  <Button onClick={() => navigate('auth')} className="relative overflow-hidden group">
                    <span className="absolute inset-0 bg-gradient-to-r from-[--color-primary] to-[--color-accent] opacity-80 group-hover:opacity-100 transition" />
                    <span className="relative">Sign Up</span>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile auth quick actions (inline, not inside menu) */}
            <div className="flex md:hidden items-center gap-2">
              {isLoggedIn ? (
                <motion.button
                  onClick={() => navigate('profile')}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-[--color-bg-secondary]/70 border border-white/10 hover:border-[--color-primary]/50 transition"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5 text-[--color-text-primary]" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigate('auth')}
                  whileTap={{ scale: 0.9 }}
                  className="px-3 h-9 inline-flex items-center gap-1 rounded-full bg-[--color-primary] text-[--color-text-primary] text-white text-sm font-medium shadow-sm hover:bg-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
                  aria-label="Log in"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </motion.button>
              )}

              {/* Hamburger */}
              <motion.button
                onClick={toggleMobile}
                aria-expanded={mobileOpen}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-[--color-bg-secondary]/60 backdrop-blur-sm hover:border-[--color-primary]/50 transition"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay Panel */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              {/* Panel */}
              <motion.div
                key="panel"
                className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-[--color-bg-primary]/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
                  <button
                    onClick={() => { navigate('home'); setMobileOpen(false); }}
                    className="text-lg font-bold bg-gradient-to-r from-[--color-primary] to-[--color-accent] bg-clip-text text-transparent"
                  >
                    FOGSLY
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/5 transition"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[--color-text-primary]/50 mb-3">
                      Navigation
                    </p>
                    <ul className="space-y-2">
                      {navLinks.map(link => {
                        const active = false; // Insert logic if you track active route
                        return (
                          <li key={link.label}>
                            <motion.button
                              onClick={() => handleNavClick(link.route)}
                              whileTap={{ scale: 0.97 }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition group border border-transparent ${active
                                  ? 'bg-[--color-primary]/15 text-[--color-primary] border-[--color-primary]/30'
                                  : 'bg-white/[0.02] hover:bg-white/[0.06] text-[--color-text-primary]/90'
                                }`}
                            >
                              <span className="text-[--color-primary]">{link.icon}</span>
                              {link.label}
                              <span className="ml-auto opacity-0 group-hover:opacity-100 text-[--color-primary] transition">
                                →
                              </span>
                            </motion.button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-[--color-text-primary]/50 mb-3">
                      Theme
                    </p>
                    <div className="flex gap-3">
                      {themeSwatches.map(ts => (
                        <motion.button
                          key={ts.value}
                          onClick={() => setCurrentTheme(ts.value)}
                          whileTap={{ scale: 0.9 }}
                          className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center transition ${currentTheme === ts.value
                              ? 'border-[--color-primary] ring-2 ring-[--color-primary]/40'
                              : 'border-white/10 hover:border-[--color-primary]/50'
                            } ${ts.colorClass}`}
                          aria-label={`${ts.label} theme`}
                        >
                          {currentTheme === ts.value && (
                            <motion.div
                              layoutId="themeActive"
                              className="absolute inset-0 rounded-2xl ring-2 ring-[--color-primary] pointer-events-none"
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 p-5 space-y-4">
                  {isLoggedIn ? (
                    <>
                      <Button
                        onClick={() => {
                          navigate('profile');
                          setMobileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 justify-center"
                        variant="secondary"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Button>
                      <Button
                        onClick={() => {
                          onLogout();
                          setMobileOpen(false);
                        }}
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('auth');
                          setMobileOpen(false);
                        }}
                        className="w-full relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-[--color-primary] to-[--color-accent] opacity-90" />
                        <span className="relative flex items-center gap-2 justify-center font-medium">
                          Login
                        </span>
                      </Button>
                      <Button
                        onClick={() => {
                          navigate('auth');
                          setMobileOpen(false);
                        }}
                        className="w-full relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-[--color-primary] to-[--color-accent] opacity-90" />
                        <span className="relative flex items-center gap-2 justify-center font-medium">
                          Create Account
                        </span>
                      </Button>
                    </div>
                  )}
                  <p className="text-[10px] text-center text-[--color-text-primary]/40">
                    © {new Date().getFullYear()} FOGSLY. All rights reserved.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Optional Bottom Mobile Navigation */}
      {enableBottomMobileBar && (
        <div className="md:hidden fixed bottom-2 inset-x-0 z-40 flex justify-center pointer-events-none">
          <nav
            aria-label="Secondary mobile"
            className="pointer-events-auto mx-4 rounded-2xl bg-[--color-bg-primary]/85 backdrop-blur-xl border border-white/10 shadow-lg px-3 py-2 flex justify-between gap-1 w-full max-w-md"
          >
            {navLinks.map(link => {
              // If you have active route tracking, replace "false" with route match check.
              const active = false;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.route)}
                  className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition relative ${active
                      ? 'text-[--color-primary] bg-[--color-primary]/15'
                      : 'text-[--color-text-primary]/70 hover:text-[--color-text-primary]'
                    }`}
                >
                  <span className="w-5 h-5">
                    {React.cloneElement(link.icon as React.ReactElement, {
                      className: `w-5 h-5 ${active ? 'text-[--color-primary]' : 'text-[--color-text-primary]/70'
                        }`
                    })}
                  </span>
                  {link.label.split(' ')[0]}
                  {active && (
                    <motion.span
                      layoutId="mobileBottomActive"
                      className="absolute inset-0 rounded-xl ring-1 ring-[--color-primary]/40 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
            {isLoggedIn ? (
              <button
                onClick={() => navigate('profile')}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-[--color-text-primary]/70 hover:text-[--color-text-primary]"
              >
                <User className="w-5 h-5" />
                Me
              </button>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-[--color-primary] bg-[--color-primary]/15"
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
            )}
          </nav>
        </div>
      )}
      {/* Spacer so content not hidden behind fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;