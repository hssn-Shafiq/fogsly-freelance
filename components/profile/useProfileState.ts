import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';
import { getUserProfile, updateUserProfile } from '../../firebase/services/userService';
import { Tab, EditForm, ProfileState, ProfileActions } from './types';

export const useProfileState = (currentUser: FirebaseUser | null) => {
  const [state, setState] = useState<ProfileState>({
    activeTab: 'overview' as Tab,
    userProfile: null,
    isLoading: true,
    isEditing: false,
    editForm: {
      name: '',
      role: '',
      city: '',
      country: '',
      phone: '',
      bio: '',
      skills: [],
      social: {
        linkedin: '',
        twitter: '',
        dribbble: '',
        github: ''
      }
    },
    isFormInitialized: false,
    isSaving: false,
    newSkill: ''
  });

  // Memoized actions to prevent unnecessary re-renders
  const actions: ProfileActions = {
    setActiveTab: useCallback((tab: Tab) => {
      setState(prev => ({ ...prev, activeTab: tab }));
    }, []),

    setUserProfile: useCallback((profile: UserProfile | null) => {
      setState(prev => ({ ...prev, userProfile: profile }));
    }, []),

    setIsLoading: useCallback((loading: boolean) => {
      setState(prev => ({ ...prev, isLoading: loading }));
    }, []),

    setIsEditing: useCallback((editing: boolean) => {
      setState(prev => ({ ...prev, isEditing: editing }));
    }, []),

    setEditForm: useCallback((updater) => {
      setState(prev => ({ 
        ...prev, 
        editForm: typeof updater === 'function' ? updater(prev.editForm) : updater 
      }));
    }, []),

    setIsFormInitialized: useCallback((initialized: boolean) => {
      setState(prev => ({ ...prev, isFormInitialized: initialized }));
    }, []),

    setIsSaving: useCallback((saving: boolean) => {
      setState(prev => ({ ...prev, isSaving: saving }));
    }, []),

    setNewSkill: useCallback((skill: string) => {
      setState(prev => ({ ...prev, newSkill: skill }));
    }, []),

    handleFormChange: useCallback((field: string, value: string) => {
      setState(prev => ({
        ...prev,
        editForm: { ...prev.editForm, [field]: value }
      }));
    }, []),

    handleSocialChange: useCallback((platform: string, value: string) => {
      setState(prev => ({
        ...prev,
        editForm: {
          ...prev.editForm,
          social: { ...prev.editForm.social, [platform]: value }
        }
      }));
    }, []),

    handleSkillAdd: useCallback((skill: string) => {
      if (skill.trim() && !state.editForm.skills.includes(skill.trim())) {
        setState(prev => ({
          ...prev,
          editForm: {
            ...prev.editForm,
            skills: [...prev.editForm.skills, skill.trim()]
          }
        }));
      }
    }, [state.editForm.skills]),

    handleSkillRemove: useCallback((skillToRemove: string) => {
      setState(prev => ({
        ...prev,
        editForm: {
          ...prev.editForm,
          skills: prev.editForm.skills.filter(skill => skill !== skillToRemove)
        }
      }));
    }, []),

    handleCancelEdit: useCallback(() => {
      // Reset form to original values
      if (state.userProfile) {
        setState(prev => ({
          ...prev,
          isEditing: false,
          editForm: {
            name: prev.userProfile?.name || '',
            role: prev.userProfile?.role || '',
            city: prev.userProfile?.city || '',
            country: prev.userProfile?.country || '',
            phone: prev.userProfile?.phone || '',
            bio: prev.userProfile?.bio || '',
            skills: prev.userProfile?.skills || [],
            social: prev.userProfile?.social || {
              linkedin: '',
              twitter: '',
              dribbble: '',
              github: ''
            }
          }
        }));
      }
    }, [state.userProfile]),

    handleSaveProfile: useCallback(async () => {
      if (!currentUser?.uid) return;

      setState(prev => ({ ...prev, isSaving: true }));

      try {
        // Validation: all required fields
        const { name, role, city, country, phone } = state.editForm;
        if (!name.trim() || !role.trim() || !city.trim() || !country.trim() || !phone.trim()) {
          alert('Please fill in all required fields.');
          setState(prev => ({ ...prev, isSaving: false }));
          return;
        }

        const profileData = {
          name: name.trim(),
          role: role.trim(),
          city: city.trim(),
          country: country.trim(),
          phone: phone.trim(),
          bio: state.editForm.bio?.trim(),
          skills: state.editForm.skills,
          social: state.editForm.social
        };

        await updateUserProfile(currentUser.uid, profileData);
        
        // Update local state
        setState(prev => ({
          ...prev,
          userProfile: prev.userProfile ? { ...prev.userProfile, ...profileData } : null,
          isEditing: false,
          isSaving: false
        }));

        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, [currentUser?.uid, state.editForm])
  };

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setState(prev => ({ 
            ...prev, 
            userProfile: profile,
            isLoading: false
          }));
          
          // Initialize edit form if profile exists and form hasn't been initialized yet
          if (profile && !state.isFormInitialized) {
            setState(prev => ({
              ...prev,
              editForm: {
                name: profile.name || '',
                role: profile.role || '',
                location: profile.location || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                social: profile.social || {
                  linkedin: '',
                  twitter: '',
                  dribbble: '',
                  github: ''
                }
              },
              isFormInitialized: true
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchUserProfile();
  }, [currentUser?.uid, state.isFormInitialized]);

  return { state, actions };
};
