import React from 'react';
import { type Route } from '../types';
import { User as FirebaseUser } from '../firebase/types/user';
import {
  ProfileHeader,
  ProfileSidebar,
  ProfileBalanceCards,
  ProfileTabContent,
  useProfileState
} from '../components/profile';

interface ProfilePageProps {
  navigate: (route: Route) => void;
  currentUser: FirebaseUser | null;
}

const ProfilePage = ({ navigate, currentUser }: ProfilePageProps) => {
  const { state, actions } = useProfileState(currentUser);

  const handleNavigateHome = () => navigate('home');
  const handleToggleEdit = () => actions.setIsEditing(!state.isEditing);

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-24">
        
        {/* Loading State */}
        {state.isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[--color-primary]"></div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <ProfileHeader
              userProfile={state.userProfile}
              currentUser={currentUser}
              isEditing={state.isEditing}
              onNavigateHome={handleNavigateHome}
              onToggleEdit={handleToggleEdit}
            />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Sidebar */}
              <ProfileSidebar
                userProfile={state.userProfile}
                currentUser={currentUser}
              />
              
              {/* Right Content Area */}
              <main className="lg:col-span-8">
                {/* Balance Cards */}
                <ProfileBalanceCards 
                  currentUser={currentUser}
                  navigate={navigate}
                />

                {/* Tabs Content */}
                <ProfileTabContent
                  state={state}
                  actions={actions}
                  currentUser={currentUser}
                />
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
