import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Theme, type Route } from '../types';
import { Button } from './ui/Button';
import { User } from 'lucide-react';

interface HeaderProps {
  currentTheme: Theme;
  setCurrentTheme: (theme: Theme) => void;
  navigate: (route: Route) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const navLinks: { label: string; route: Route }[] = [
  { label: 'Dashboard', route: 'dashboard' },
  { label: 'Events', route: 'events' },
  { label: 'Watch Ads', route: 'watch-ads' },
  { label: 'Pricing', route: 'pricing' },
];

const Header = ({ currentTheme, setCurrentTheme, navigate, isLoggedIn, onLogout }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (route: Route) => {
    if (route === 'dashboard' && !isLoggedIn) {
      navigate('auth');
    } else {
      navigate(route);
    }
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[--color-bg-primary]/80 backdrop-blur-md shadow-sm py-2' : 'py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.button
          onClick={() => navigate('home')}
          {...{
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
          }}
          className="flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <span className="text-xl font-bold text-[--color-primary]">FOGSLY</span>
        </motion.button>
        
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <motion.button
              key={link.label}
              onClick={() => handleNavClick(link.route)}
              className="text-[--color-text-primary] hover:text-[--color-primary] transition-colors text-sm font-medium"
              {...{
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 },
              }}
            >
              {link.label}
            </motion.button>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="flex space-x-1 p-1 bg-[--color-bg-secondary] rounded-full">
            {(['light', 'dark', 'desert'] as Theme[]).map((theme) => (
              <motion.button
                key={theme}
                onClick={() => setCurrentTheme(theme)}
                className={`w-5 h-5 rounded-full transition-all duration-300 ${currentTheme === theme ? 'ring-2 ring-offset-2 ring-offset-[--color-bg-secondary] ring-[--color-primary]' : ''} ${
                  theme === 'light' ? 'bg-gray-200' : 
                  theme === 'dark' ? 'bg-gray-700' : 'bg-orange-300'
                }`}
                aria-label={`${theme} theme`}
                {...{
                  whileHover: { scale: 1.1 },
                  whileTap: { scale: 0.9 },
                }}
              />
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <motion.button
                className="p-2 rounded-full hover:bg-[--color-bg-secondary] transition-colors"
                aria-label="View profile"
                {...{
                  whileHover: { scale: 1.1 },
                  whileTap: { scale: 0.9 },
                }}
                onClick={() => navigate('profile')}
              >
                <User className="w-5 h-5 text-[--color-text-primary]" />
              </motion.button>
              <Button variant="link" onClick={onLogout} className="hidden sm:inline-flex">Log Out</Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="link" onClick={() => navigate('auth')}>Log In</Button>
              <Button onClick={() => navigate('auth')}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;