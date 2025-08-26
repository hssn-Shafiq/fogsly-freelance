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
import WalletBalanceCard from '../components/wallet/WalletBalanceCard';
import FogslyRankBanner from '@/components/badges/FogslyRankBanner';
interface ProfilePageProps {
  navigate: (route: Route) => void;
  currentUser: FirebaseUser | null;
}

const ProfilePage = ({ navigate, currentUser }: ProfilePageProps) => {
  const { state, actions } = useProfileState(currentUser);

  const handleNavigateHome = () => navigate('home');
  const handleToggleEdit = () => actions.setIsEditing(!state.isEditing);
  const handleNavigateToSettings = () => actions.setActiveTab('settings');

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-4">

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
              onNavigateToSettings={handleNavigateToSettings}
              onAvatarUpload={actions.handleAvatarUpload}
              onCoverUpload={actions.handleCoverUpload}
              isSaving={state.isSaving}
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
                {/* Wallet Balance Card */}
                {/* {currentUser?.uid && (
                  <div className="mb-8">
                    <WalletBalanceCard
                      userId={currentUser.uid}
                      userName={currentUser.displayName || currentUser.email || 'User'}
                      navigate={navigate}
                    />
                    
                  </div>
                )} */}

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

        {/* Wallet Modals */}
        {/* {userWallet && (
          <ShareProfileModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            wallet={userWallet}
            userName={state.userProfile?.name || state.userProfile?.displayName || 'User'}
          />
        )}

        {walletBalance && currentUser?.uid && (
          <TransferCoinsModal
            isOpen={isTransferModalOpen}
            onClose={() => setIsTransferModalOpen(false)}
            currentUserId={currentUser.uid}
            balance={walletBalance}
            onTransferComplete={handleTransferComplete}
          />
        )} */}
      </div>
    </div>
  );
};

export default ProfilePage;
