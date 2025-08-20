import React from 'react';
import { ArrowLeft, Edit2, MapPin, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  isEditing: boolean;
  onNavigateHome: () => void;
  onToggleEdit: () => void;
}

const ProfileHeader = React.memo(({ 
  userProfile, 
  currentUser, 
  isEditing, 
  onNavigateHome, 
  onToggleEdit 
}: ProfileHeaderProps) => {
  return (
    <Card className="mb-8 overflow-visible">
      <div 
        className="h-40 md:h-56 rounded-t-xl bg-cover bg-center relative" 
        style={{backgroundImage: `url(${userProfile?.coverUrl || 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80'})`}}
      >
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            onClick={onNavigateHome} 
            className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
          onClick={onToggleEdit}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 bg-[--color-card] flex flex-col lg:flex-row items-center lg:items-end relative">
        {/* Avatar */}
        <div className="absolute left-6 -top-16 lg:static lg:-mt-24">
          <div className="w-32 h-32 rounded-full bg-[--color-bg-tertiary] border-4 border-[--color-card] flex items-center justify-center text-5xl font-bold text-[--color-text-secondary] ring-4 ring-[--color-card]">
            {(userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1 text-center lg:text-left mt-10 lg:mt-0 lg:ml-6">
          <h1 className="text-3xl font-bold text-[--color-text-primary]">
            {(userProfile?.name || currentUser?.displayName || 'User').toUpperCase()}
          </h1>
          <p className="text-[--color-text-secondary]">{userProfile?.role || 'User'}</p>
          <div className="flex items-center justify-center lg:justify-start text-sm text-[--color-text-secondary] mt-1">
            <MapPin size={14} className="mr-1" />
            {userProfile?.city && userProfile?.country
              ? `${userProfile.city}, ${userProfile.country}`
              : 'Location not set'}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <Button variant="outline">Send Message</Button>
          <Button>Follow</Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
