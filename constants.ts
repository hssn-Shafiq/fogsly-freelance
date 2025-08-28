import React from 'react';
import IconAiBot from './components/icons/IconAiBot';
import IconSecureLock from './components/icons/IconSecureLock';
import IconMarketplace from './components/icons/IconMarketplace';
import IconFogCoin from './components/icons/IconFogCoin';
import IconGlobe from './components/icons/IconGlobe';
import IconSupport from './components/icons/IconSupport';
import { AtomIcon } from './components/icons/AnimatedIcons/iconAtom';
import { BadgeCheck } from './components/icons/AnimatedIcons/IconBadge';

export const categories = [
  { name: 'Development & IT', icon: '💻', jobs: '1,245' },
  { name: 'Design & Creative', icon: '🎨', jobs: '892' },
  { name: 'Sales & Marketing', icon: '📈', jobs: '756' },
  { name: 'Writing & Translation', icon: '✍️', jobs: '543' },
  { name: 'Admin Support', icon: '📋', jobs: '432' },
  { name: 'Finance & Legal', icon: '💰', jobs: '321' },
];

export const featuredJobs = [
  { title: 'Website Development', budget: '$1,500', skills: ['React', 'Node.js'], type: 'Fixed Price' },
  { title: 'Logo Design', budget: '$300', skills: ['Logo', 'Branding'], type: 'Fixed Price' },
  { title: 'Social Media Manager', budget: '$800/mo', skills: ['Instagram', 'Content'], type: 'Part-time' },
];

export const topTalent = [
  { name: 'Alex Johnson', role: 'UX Designer', rating: '4.9', projects: 42, skills: ['Figma', 'UI/UX', 'Prototyping'], url: 'https://images.unsplash.com/photo-1610088441520-4352457e7095?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Sam Wilson', role: 'Fullstack Dev', rating: '4.8', projects: 35, skills: ['React', 'Node.js', 'TypeScript'], url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Taylor Smith', role: 'Content Writer', rating: '5.0', projects: 28, skills: ['Copywriting', 'SEO', 'Blogging'], url: 'https://plus.unsplash.com/premium_photo-1672239496290-5061cfee7ebb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVufGVufDB8MXwwfHx8MA%3D%3D' },
];

export const testimonials = [
  { 
    quote: "FOGSLY helped me triple my freelance income in just 6 months! The platform is intuitive and the community is amazing.", 
    author: "Sarah K.", 
    role: "Freelancer",
    stats: "Earns $8,500/mo",
    clientImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  { 
    quote: "Found the perfect developer for our project in under 48 hours. The vetting process saved us so much time.", 
    author: "Michael T.", 
    role: "Startup Founder",
    stats: "Hired 12 freelancers",
    clientImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YnVzaW5lc3MlMjBtZW58ZW58MHx8MHx8fDA%3D"
  },
  { 
    quote: "The hybrid model gives me both long-term projects and quick gigs. Plus, FOG Coins are a game-changer!", 
    author: "Jamal R.", 
    role: "Digital Marketer",
    stats: "500+ tasks completed",
    clientImage: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aGFwcHklMjBtZW58ZW58MHx8MHx8fDA%3D"
  },
];

export const benefits = [
    { 
      title: "AI-Powered Matching", 
      description: "Our algorithm connects you with ideal clients or freelancers in seconds",
      icon: AtomIcon
    },
    { 
      title: "Secure Payments", 
      description: "Escrow protection ensures you only pay for satisfactory work",
      icon: BadgeCheck
    },
    { 
      title: "Hybrid Marketplace", 
      description: "Get the best of both freelancing and on-demand services",
      icon: IconMarketplace
    },
    { 
      title: "FOG Coin Rewards", 
      description: "Earn crypto for activity and get discounts on platform fees",
      icon: IconFogCoin
    },
    { 
      title: "Global Talent Pool", 
      description: "Access top professionals from around the world",
      icon: IconGlobe
    },
    { 
      title: "24/7 Support", 
      description: "Dedicated team ready to help anytime",
      icon: IconSupport
    },
];