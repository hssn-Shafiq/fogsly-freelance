import React from 'react';
import { motion } from 'framer-motion';
import { Tab } from './types';

interface ProfileTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'settings', label: 'Settings' },
];

const ProfileTabs = React.memo(({ activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="border-b border-[--color-border]" id="profile-tabs">
      <nav className="flex px-4 space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-3 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[--color-primary]' 
                : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-primary]" 
                layoutId="underline"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
});

ProfileTabs.displayName = 'ProfileTabs';

export default ProfileTabs;
