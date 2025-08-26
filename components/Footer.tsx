import React from 'react';
import { Twitter, Linkedin, Youtube } from 'lucide-react';
import TiktokIcon from './TiktokIcon';
import { type Route } from '../types';

interface FooterProps {
  navigate: (route: Route) => void;
}

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
  { name: 'TikTok', icon: TiktokIcon, href: '#' },
];

const companyLinks: { name: string; route: Route }[] = [
  { name: 'About Us', route: 'about' },
  { name: 'Careers', route: 'careers' },
  { name: 'Press', route: 'press' },
  { name: 'Blog', route: 'blog' },
];

const platformLinks: { name: string; route: Route }[] = [
  { name: 'Features', route: 'features' },
  { name: 'Pricing', route: 'pricing' },
  { name: 'FOG Coins', route: 'fog-coins' },
  { name: 'API', route: 'api' },
];

const supportLinks: { name: string; route: Route }[] = [
  { name: 'Help Center', route: 'help-center' },
  { name: 'Community', route: 'community' },
  { name: 'Privacy Policy', route: 'privacy-policy' },
  { name: 'Terms', route: 'terms' },
];

const Footer = ({ navigate }: FooterProps) => {
  const FooterLink = ({ route, children }: { route: Route; children: React.ReactNode }) => (
    <button onClick={() => navigate(route)} className="text-left text-[--color-text-secondary] hover:text-[--color-primary] transition-colors">
      {children}
    </button>
  );
  
  return (
    <footer className="bg-[--color-bg-tertiary] py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-[--color-primary]">FOGSLY</span>
            </div>
            <p className="text-[--color-text-secondary] mb-4 max-w-xs">
              The future of freelance and on-demand services.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={`FOGSLY on ${name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[--color-text-primary] mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <FooterLink route={item.route}>{item.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[--color-text-primary] mb-4">Platform</h3>
            <ul className="space-y-2">
              {platformLinks.map((item) => (
                <li key={item.name}>
                  <FooterLink route={item.route}>{item.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[--color-text-primary] mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <FooterLink route={item.route}>{item.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[--color-border]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[--color-text-secondary] text-center text-sm">
              © {new Date().getFullYear()} FOGSLY. All rights reserved.
            </p>
            {/* <button 
              onClick={() => navigate('admin')}
              className="text-xs text-[--color-text-secondary] hover:text-[--color-primary] transition-colors opacity-60 hover:opacity-100"
            >
              Admin Panel
            </button> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;