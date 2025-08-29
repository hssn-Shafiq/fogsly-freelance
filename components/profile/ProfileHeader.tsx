import React, { useRef, useState } from 'react';
import { ArrowLeft, Edit2, MapPin, MoreVertical, Camera, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';
import { toast } from 'react-hot-toast';
import FogslyRankBanner from '../badges/FogslyRankBanner';

interface ProfileHeaderProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  isEditing: boolean;
  onNavigateHome: () => void;
  onToggleEdit: () => void;
  onNavigateToSettings: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onCoverUpload: (file: File) => Promise<void>;
  isSaving: boolean;
}

const ProfileHeader = React.memo(({
  userProfile,
  currentUser,
  isEditing,
  onNavigateHome,
  onToggleEdit,
  onNavigateToSettings,
  onAvatarUpload,
  onCoverUpload,
  isSaving
}: ProfileHeaderProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleCoverClick = () => {
    if (coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setIsAvatarUploading(true);
      onAvatarUpload(file).finally(() => {
        setIsAvatarUploading(false);
      });
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setIsCoverUploading(true);
      onCoverUpload(file).finally(() => {
        setIsCoverUploading(false);
      });
    }
  };



  return (
    <>
      <Card className="mb-8 overflow-visible">
        <div
          className="h-40 md:h-56 rounded-t-xl bg-cover bg-center relative"
          style={{ backgroundImage: `url(${userProfile?.coverUrl || 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80'})` }}
        >
          {/* Cover Upload Overlay */}
          {isCoverUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Uploading cover image...</p>
              </div>
            </div>
          )}

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
            onClick={onNavigateToSettings}
            disabled={isSaving || isAvatarUploading || isCoverUploading}
          >
            <a href="#profile-tabs"> <Edit2 className="w-4 h-4" /></a>
          </Button>

          {/* Cover Upload Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
            onClick={handleCoverClick}
            disabled={isSaving || isAvatarUploading || isCoverUploading}
          >
            <Camera className="w-4 h-4" />
          </Button>

          {/* Hidden Cover Input */}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        <div className="p-2 lg:p-6 bg-[--color-card] flex flex-col lg:flex-row items-center lg:items-end relative">
          {/* Avatar */}
          <div className="absolute left-1 -top-8 lg:static lg:-mt-24 relative">
            <div className="w-32 h-32 rounded-full bg-[--color-bg-tertiary] border-4 border-[--color-card] flex items-center justify-center text-5xl font-bold text-[--color-text-secondary] ring-4 ring-[--color-card] overflow-hidden   relative">
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                (userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase()
              )}

              {/* Avatar Upload Overlay */}
              {isAvatarUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}

            </div>

            {/* Avatar Edit Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-0 lg:bottom-10 left-10 bg-black/50 hover:bg-black text-white rounded-full w-6 h-6 shadow-lg"
              onClick={handleAvatarClick}
              disabled={isSaving || isAvatarUploading || isCoverUploading}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {/* Hidden Avatar Input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center lg:text-left mt-0 lg:mt-0 lg:ml-6 ">
            <h1 className="text-3xl font-bold text-[--color-text-primary] ">
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

          <div className="">
            {userProfile.rank ? (
              userProfile.rank <= 3 ? (
                <FogslyRankBanner rank={userProfile.rank} tier="legend" label="Fogsly Legend" compact />
              ) : (userProfile.rank > 3 && userProfile.rank <= 7) ? (
                <FogslyRankBanner rank={userProfile.rank} tier="master" label="Fogsly Master" compact />
              ) : (userProfile.rank > 7 && userProfile.rank <= 56) ? (
                <FogslyRankBanner rank={userProfile.rank} tier="vanguard" label="Fogsly Vanguard" compact />
              ) : (userProfile.rank > 56 && userProfile.rank <= 245) ? (
                <FogslyRankBanner rank={userProfile.rank} tier="earlybird" label="Fogsly EarlyBird" compact />
              ) : (userProfile.rank > 245 && userProfile.rank <= 678) ? (
                <FogslyRankBanner rank={userProfile.rank} tier="champion" label="Fogsly Champion" compact />
              ) : (
                <FogslyRankBanner rank={userProfile.rank} tier="rookie" label="Fogsly Rookie" compact />
              )
            ) : (
              <FogslyRankBanner rank={5} tier="rookie" label="Fogsly Rookie" compact />
            )}
            <div className="pt-4 buttons-follow flex items-center gap-2 mt-4 lg:mt-0">
              <Button variant="outline">Send Message</Button>
              <Button>Follow</Button>
              <Button variant="ghost" size="icon">
                <MoreVertical size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* <div className="demo-car">
          <div className="container flex p-5">
            <FogslyRankBanner rank={4} tier="legend" label="Fogsly Legend" compact />
            <FogslyRankBanner rank={4} tier="master" label="Fogsly Master" compact />
            <FogslyRankBanner rank={4} tier="vanguard" label="Fogsly Vanguard" compact />
            <FogslyRankBanner rank={4} tier="earlybird" label="Fogsly EarlyBird" compact />
            <FogslyRankBanner rank={4} tier="champion" label="Fogsly Champion" compact />
            <FogslyRankBanner rank={4} tier="rookie" label="Fogsly Rookie" compact />
          </div>
        </div> */}
      </Card>
    </>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
