import React from 'react';
import { User, Settings, Linkedin } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { EditForm, ProfileActions } from '../types';

// Memoized input components to prevent re-renders
const MemoizedInput = React.memo(({ id, label, value, onChange, disabled, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}) => (
  <div className="space-y-1">
    <Label htmlFor={id}>{label}</Label>
    <Input 
      id={id} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
));

const MemoizedTextarea = React.memo(({ id, label, value, onChange, disabled, placeholder }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}) => (
  <div className="space-y-1 sm:col-span-2">
    <Label htmlFor={id}>{label}</Label>
    <Textarea 
      id={id} 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      rows={4}
    />
  </div>
));

MemoizedInput.displayName = 'MemoizedInput';
MemoizedTextarea.displayName = 'MemoizedTextarea';

// SettingsSection component
const SettingsSection = React.memo(({ title, icon: Icon, children }: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 mr-3 text-[--color-primary]" />
      <h3 className="text-lg font-semibold text-[--color-text-primary]">{title}</h3>
    </div>
    <div className="pl-8 border-l-2 border-[--color-border]">
      {children}
    </div>
  </div>
));

SettingsSection.displayName = 'SettingsSection';

interface SettingsTabProps {
  editForm: EditForm;
  isEditing: boolean;
  isSaving: boolean;
  newSkill: string;
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  actions: ProfileActions;
}

const SettingsTab = React.memo(({ 
  editForm, 
  isEditing, 
  isSaving, 
  newSkill, 
  userProfile, 
  currentUser,
  actions
}: SettingsTabProps) => {
  return (
    <div className="space-y-8">
      <SettingsSection title="Profile Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemoizedInput
            id="name"
            label="Full Name"
            value={editForm.name || ''}
            onChange={(value) => actions.handleFormChange('name', value)}
            disabled={!isEditing}
          />
          <MemoizedInput
            id="email"
            label="Email"
            value={userProfile?.email || currentUser?.email || ''}
            onChange={() => {}} // Email is read-only
            disabled={true}
          />
          <MemoizedInput
            id="role"
            label="Role / Title"
            value={editForm.role || ''}
            onChange={(value) => actions.handleFormChange('role', value)}
            disabled={!isEditing}
            placeholder="e.g., Software Developer"
          />
          <MemoizedInput
            id="phone"
            label="Phone Number"
            value={editForm.phone || ''}
            onChange={(value) => actions.handleFormChange('phone', value)}
            disabled={!isEditing}
            placeholder="e.g., +92 300 1234567"
          />
          <MemoizedInput
            id="city"
            label="City"
            value={editForm.city || ''}
            onChange={(value) => actions.handleFormChange('city', value)}
            disabled={!isEditing}
            placeholder="e.g., Lahore"
          />
          <MemoizedInput
            id="country"
            label="Country"
            value={editForm.country || ''}
            onChange={(value) => actions.handleFormChange('country', value)}
            disabled={!isEditing}
            placeholder="e.g., Pakistan"
          />
          <MemoizedTextarea
            id="bio"
            label="About / Bio"
            value={editForm.bio || ''}
            onChange={(value) => actions.handleFormChange('bio', value)}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Skills" icon={Settings}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {editForm.skills.map((skill: string, index: number) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[--color-primary]/10 text-[--color-primary]"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => actions.handleSkillRemove(skill)}
                    className="ml-1 text-[--color-primary] hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => actions.setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    actions.handleSkillAdd(newSkill);
                    actions.setNewSkill('');
                  }
                }}
              />
              <Button 
                variant="outline"
                onClick={() => {
                  actions.handleSkillAdd(newSkill);
                  actions.setNewSkill('');
                }}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Social Links" icon={Linkedin}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemoizedInput
            id="linkedin"
            label="LinkedIn"
            value={editForm.social?.linkedin || ''}
            onChange={(value) => actions.handleSocialChange('linkedin', value)}
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/username"
          />
          <MemoizedInput
            id="twitter"
            label="Twitter"
            value={editForm.social?.twitter || ''}
            onChange={(value) => actions.handleSocialChange('twitter', value)}
            disabled={!isEditing}
            placeholder="https://twitter.com/username"
          />
          <MemoizedInput
            id="dribbble"
            label="Dribbble"
            value={editForm.social?.dribbble || ''}
            onChange={(value) => actions.handleSocialChange('dribbble', value)}
            disabled={!isEditing}
            placeholder="https://dribbble.com/username"
          />
          <MemoizedInput
            id="github"
            label="GitHub"
            value={editForm.social?.github || ''}
            onChange={(value) => actions.handleSocialChange('github', value)}
            disabled={!isEditing}
            placeholder="https://github.com/username"
          />
        </div>
      </SettingsSection>

      {isEditing ? (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={actions.handleCancelEdit}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={actions.handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => actions.setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';

export default SettingsTab;
