import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import ProfileTabs from './ProfileTabs';
import { Tab, ProfileState, ProfileActions } from './types';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';

// Lazy load tab components for better performance
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const PortfolioTab = React.lazy(() => import('./tabs/PortfolioTab'));
const ReviewsTab = React.lazy(() => import('./tabs/ReviewsTab'));
const SettingsTab = React.lazy(() => import('./tabs/SettingsTab'));

interface ProfileTabContentProps {
  state: ProfileState;
  actions: ProfileActions;
  currentUser: FirebaseUser | null;
}

const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--color-primary]"></div>
  </div>
);

const ProfileTabContent = React.memo(({ state, actions, currentUser }: ProfileTabContentProps) => {
  const { activeTab, userProfile, editForm, isEditing, isSaving, newSkill } = state;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            userProfile={userProfile} 
            currentUser={currentUser} 
          />
        );
      case 'portfolio':
        return (
          <PortfolioTab 
            userProfile={userProfile} 
            currentUser={currentUser}
            onTabChange={actions.setActiveTab}
          />
        );
      case 'reviews':
        return (
          <ReviewsTab 
            userProfile={userProfile} 
            currentUser={currentUser} 
          />
        );
      case 'settings':
        return (
          <SettingsTab
            editForm={editForm}
            isEditing={isEditing}
            isSaving={isSaving}
            newSkill={newSkill}
            userProfile={userProfile}
            currentUser={currentUser}
            actions={actions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <ProfileTabs 
        activeTab={activeTab} 
        onTabChange={actions.setActiveTab} 
      />

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<TabLoadingSpinner />}>
              {renderTabContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
});

ProfileTabContent.displayName = 'ProfileTabContent';

export default ProfileTabContent;
