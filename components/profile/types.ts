import React from 'react';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';

export type Tab = 'overview' | 'portfolio' | 'reviews' | 'settings';

export interface ProfilePageProps {
  navigate: (route: string) => void;
  currentUser: FirebaseUser | null;
}

export interface EditForm {
  name: string;
  role: string;
  city: string;
  country: string;
  phone: string;
  bio: string;
  skills: string[];
  social: {
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
    github?: string;
  };
}

export interface ProfileState {
  activeTab: Tab;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isEditing: boolean;
  editForm: EditForm;
  isFormInitialized: boolean;
  isSaving: boolean;
  newSkill: string;
}

export interface ProfileActions {
  setActiveTab: (tab: Tab) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  setIsFormInitialized: (initialized: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setNewSkill: (skill: string) => void;
  handleFormChange: (field: string, value: string) => void;
  handleSocialChange: (platform: string, value: string) => void;
  handleSkillAdd: (skill: string) => void;
  handleSkillRemove: (skill: string) => void;
  handleCancelEdit: () => void;
  handleSaveProfile: () => void;
  handleAvatarUpload: (file: File) => Promise<void>;
  handleCoverUpload: (file: File) => Promise<void>;
}

// Static fallback data
export const staticPortfolio = [
  { id: 1, title: 'Sample Project', category: 'Web App', imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697320f64?w=500' }
];

export const staticReviews = [
  { id: 1, client: 'Sample Client', project: 'Sample Project', rating: 5, comment: 'Great work! Professional and timely delivery.' }
];

export const staticActivity = [
  { type: 'joined', content: 'Joined FOGSLY platform', time: 'Welcome aboard!' }
];
