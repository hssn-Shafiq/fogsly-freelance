import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, User, Star, MapPin, Linkedin, Twitter, Dribbble, Github, Wallet, Coins, ArrowLeft, 
  MoreVertical, Edit2, Download, Bell, CreditCard, Settings, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { type Route } from '../types';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { User as FirebaseUser, UserProfile } from '../firebase/types/user';
import { getUserProfile, updateUserProfile } from '../firebase/services/userService';

// Static fallback data for portfolio, reviews, and activity
const staticPortfolio = [
  { id: 1, title: 'Sample Project', category: 'Web App', imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697320f64?w=500' }
];

const staticReviews = [
  { id: 1, client: 'Sample Client', project: 'Sample Project', rating: 5, comment: 'Great work! Professional and timely delivery.' }
];

const staticActivity = [
  { type: 'joined', content: 'Joined FOGSLY platform', time: 'Welcome aboard!' }
];

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
    <textarea 
      id={id} 
      rows={4} 
      className="w-full rounded-md border border-[--color-border] bg-[--color-bg-secondary] px-3 py-2 text-sm placeholder:text-[--color-text-secondary]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] disabled:opacity-50 disabled:cursor-not-allowed"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
));

// Enhanced Mock Data
const profile = {
  name: 'Alex Johnson',
  role: 'Senior UX Designer & Web Developer',
  location: 'San Francisco, CA',
  avatarUrl: '', // Will use a placeholder
  coverUrl: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80',
  bio: 'A passionate Senior UX Designer with over 8 years of experience in creating intuitive and engaging digital experiences. I specialize in user-centered design, prototyping, and collaborating with cross-functional teams to deliver impactful products that users love.',
  social: {
    linkedin: '#',
    twitter: '#',
    dribbble: '#',
    github: '#'
  },
  stats: {
    rating: '4.95',
    reviews: 124,
    projects: 42,
    completionRate: '98%',
  },
  skills: ['UI/UX Design', 'Prototyping', 'Figma', 'React', 'Webflow', 'User Research', 'Design Systems'],
  portfolio: [
    { id: 1, title: 'Project Alpha', category: 'Web App', imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697320f64?w=500' },
    { id: 2, title: 'Mobile Banking App', category: 'Mobile App', imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500' },
    { id: 3, title: 'E-commerce Redesign', category: 'E-commerce', imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=500' },
    { id: 4, title: 'SaaS Dashboard', category: 'SaaS', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500' },
  ],
  reviews: [
    { id: 1, client: 'TechCorp', project: 'Project Alpha', rating: 5, comment: 'Alex is an exceptional designer. His attention to detail and creative solutions were instrumental to our project\'s success.' },
    { id: 2, client: 'FinBank', project: 'Mobile Banking App', rating: 5, comment: 'Working with Alex was a pleasure. He transformed our complex requirements into a simple and elegant user interface.' },
    { id: 3, client: 'Shopify Plus', project: 'E-commerce Redesign', rating: 4, comment: 'Great communication and high-quality deliverables. We saw a significant improvement in user engagement after the redesign.' },
  ],
  activity: [
    { type: 'completed', content: 'Project "Mobile Banking App"', time: '2 days ago' },
    { type: 'review', content: 'Received a 5-star review from FinBank', time: '3 days ago' },
    { type: 'started', content: 'Started a new contract with Innovate Co.', time: '1 week ago' },
    { type: 'skill', content: 'Added "Design Systems" to skills', time: '2 weeks ago' },
  ]
};

// Memoized SettingsTab component to prevent re-renders and focus loss
interface SettingsTabProps {
  editForm: any;
  isEditing: boolean;
  isSaving: boolean;
  newSkill: string;
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  handleFormChange: (field: string, value: string) => void;
  handleSocialChange: (platform: string, value: string) => void;
  handleSkillAdd: (skill: string) => void;
  handleSkillRemove: (skill: string) => void;
  handleCancelEdit: () => void;
  handleSaveProfile: () => void;
  setIsEditing: (editing: boolean) => void;
  setNewSkill: (skill: string) => void;
}

const SettingsTab = React.memo(({ 
  editForm, 
  isEditing, 
  isSaving, 
  newSkill, 
  userProfile, 
  currentUser,
  handleFormChange,
  handleSocialChange,
  handleSkillAdd,
  handleSkillRemove,
  handleCancelEdit,
  handleSaveProfile,
  setIsEditing,
  setNewSkill 
}: SettingsTabProps) => {
  return (
    <div className="space-y-8">
      <SettingsSection title="Profile Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MemoizedInput
            id="name"
            label="Full Name"
            value={editForm.name || ''}
            onChange={(value) => handleFormChange('name', value)}
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
            onChange={(value) => handleFormChange('role', value)}
            disabled={!isEditing}
            placeholder="e.g., Software Developer"
          />
          <MemoizedInput
            id="location"
            label="Location"
            value={editForm.location || ''}
            onChange={(value) => handleFormChange('location', value)}
            disabled={!isEditing}
            placeholder="e.g., New York, USA"
          />
          <MemoizedTextarea
            id="bio"
            label="About / Bio"
            value={editForm.bio || ''}
            onChange={(value) => handleFormChange('bio', value)}
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
                    onClick={() => handleSkillRemove(skill)}
                    className="ml-1 text-[--color-primary] hover:text-red-500"
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
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSkillAdd(newSkill);
                    setNewSkill('');
                  }
                }}
              />
              <Button 
                variant="outline"
                onClick={() => {
                  handleSkillAdd(newSkill);
                  setNewSkill('');
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
            onChange={(value) => handleSocialChange('linkedin', value)}
            disabled={!isEditing}
            placeholder="https://linkedin.com/in/username"
          />
          <MemoizedInput
            id="twitter"
            label="Twitter"
            value={editForm.social?.twitter || ''}
            onChange={(value) => handleSocialChange('twitter', value)}
            disabled={!isEditing}
            placeholder="https://twitter.com/username"
          />
          <MemoizedInput
            id="dribbble"
            label="Dribbble"
            value={editForm.social?.dribbble || ''}
            onChange={(value) => handleSocialChange('dribbble', value)}
            disabled={!isEditing}
            placeholder="https://dribbble.com/username"
          />
          <MemoizedInput
            id="github"
            label="GitHub"
            value={editForm.social?.github || ''}
            onChange={(value) => handleSocialChange('github', value)}
            disabled={!isEditing}
            placeholder="https://github.com/username"
          />
        </div>
      </SettingsSection>

      {isEditing ? (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
});

SettingsTab.displayName = 'SettingsTab';

// SettingsSection component
const SettingsSection = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <div>
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 mr-3 text-[--color-primary]" />
      <h3 className="text-lg font-semibold text-[--color-text-primary]">{title}</h3>
    </div>
    <div className="pl-8 border-l-2 border-[--color-border]">
      {children}
    </div>
  </div>
);

type Tab = 'overview' | 'portfolio' | 'reviews' | 'settings';

interface ProfilePageProps {
  navigate: (route: Route) => void;
  currentUser: FirebaseUser | null;
}

const ProfilePage = ({ navigate, currentUser }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    location: '',
    bio: '',
    skills: [] as string[],
    social: {
      linkedin: '',
      twitter: '',
      dribbble: '',
      github: ''
    }
  });
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
          
          // Set edit form data if profile exists and form hasn't been initialized yet
          if (profile && !isFormInitialized) {
            setEditForm({
              name: profile.name || '',
              role: profile.role || '',
              location: profile.location || '',
              bio: profile.bio || '',
              skills: profile.skills || [],
              social: {
                linkedin: profile.social?.linkedin || '',
                twitter: profile.social?.twitter || '',
                dribbble: profile.social?.dribbble || '',
                github: profile.social?.github || ''
              }
            });
            setIsFormInitialized(true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser?.uid, isFormInitialized]); // Only depend on currentUser.uid and initialization state

  const handleSaveProfile = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    // Basic validation with safe handling of undefined values
    if (!editForm.name?.trim()) {
      alert('Name is required');
      return;
    }
    
    // Remove email validation since it's read-only and comes from userProfile
    
    setIsSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        name: editForm.name?.trim() || '',
        role: editForm.role?.trim() || '',
        location: editForm.location?.trim() || '',
        bio: editForm.bio?.trim() || '',
        skills: editForm.skills?.filter(skill => skill?.trim()) || [],
        social: {
          linkedin: editForm.social?.linkedin?.trim() || '',
          twitter: editForm.social?.twitter?.trim() || '',
          dribbble: editForm.social?.dribbble?.trim() || '',
          github: editForm.social?.github?.trim() || ''
        }
      });
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        name: editForm.name?.trim() || '',
        role: editForm.role?.trim() || '',
        location: editForm.location?.trim() || '',
        bio: editForm.bio?.trim() || '',
        skills: editForm.skills?.filter(skill => skill?.trim()) || [],
        social: {
          linkedin: editForm.social?.linkedin?.trim() || '',
          twitter: editForm.social?.twitter?.trim() || '',
          dribbble: editForm.social?.dribbble?.trim() || '',
          github: editForm.social?.github?.trim() || ''
        },
        updatedAt: new Date()
      } : null);
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [currentUser?.uid, editForm]);

  const handleCancelEdit = useCallback(() => {
    // Reset form to current profile data
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        role: userProfile.role || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || [],
        social: {
          linkedin: userProfile.social?.linkedin || '',
          twitter: userProfile.social?.twitter || '',
          dribbble: userProfile.social?.dribbble || '',
          github: userProfile.social?.github || ''
        }
      });
    }
    setIsEditing(false);
  }, [userProfile]);

  const handleFormChange = useCallback((field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSocialChange = useCallback((platform: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  }, []);

  const handleSkillAdd = useCallback((skill: string) => {
    if (skill.trim() && !editForm.skills.includes(skill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  }, [editForm.skills]);

  const handleSkillRemove = useCallback((skillToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  }, []);

  return (
    <div className="bg-[--color-bg-secondary] min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-24">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[--color-primary]"></div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <Card className="mb-8 overflow-visible">
          <div 
             className="h-40 md:h-56 rounded-t-xl bg-cover bg-center relative" 
             style={{backgroundImage: `url(${userProfile?.coverUrl || 'https://images.unsplash.com/photo-1554147090-e1221a04a025?w=800&q=80'})`}}
           >
             <div className="absolute top-4 left-4">
                <Button variant="ghost" onClick={() => navigate('home')} className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
              onClick={() => setIsEditing(!isEditing)}
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
            
            <div className="flex-1 text-center lg:text-left mt-16 lg:mt-0 lg:ml-6">
              <h1 className="text-3xl font-bold text-[--color-text-primary]">{userProfile?.name || currentUser?.displayName || 'User'}</h1>
              <p className="text-[--color-text-secondary]">{userProfile?.role || 'User'}</p>
              <div className="flex items-center justify-center lg:justify-start text-sm text-[--color-text-secondary] mt-1">
                <MapPin size={14} className="mr-1" /> {userProfile?.location || 'Location not set'}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 lg:mt-0">
                <Button variant="outline">Send Message</Button>
                <Button>Follow</Button>
                <Button variant="ghost" size="icon"><MoreVertical size={20} /></Button>
            </div>
          </div>
        </Card>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card>
                <CardHeader><CardTitle>About</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-[--color-text-secondary] leading-relaxed">{userProfile?.bio || 'No bio available.'}</p></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                    <StatItem value={userProfile?.stats?.rating || '4.95'} label="Rating" />
                    <StatItem value={userProfile?.stats?.reviews || '0'} label="Reviews" />
                    <StatItem value={userProfile?.stats?.projects || '0'} label="Projects" />
                    <StatItem value={userProfile?.stats?.completionRate || '0%'} label="Completion" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {(userProfile?.skills || ['React', 'TypeScript', 'Firebase']).map(skill => (
                        <span key={skill} className="px-3 py-1 bg-[--color-bg-secondary] text-sm font-medium rounded-full">{skill}</span>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Socials</CardTitle></CardHeader>
                <CardContent className="flex justify-around">
                    <a href={userProfile?.social?.linkedin || '#'} aria-label="LinkedIn" className="p-2 text-[--color-text-secondary] hover:text-[--color-primary]"><Linkedin size={24} /></a>
                    <a href={userProfile?.social?.twitter || '#'} aria-label="Twitter" className="p-2 text-[--color-text-secondary] hover:text-[--color-primary]"><Twitter size={24} /></a>
                    <a href={userProfile?.social?.dribbble || '#'} aria-label="Dribbble" className="p-2 text-[--color-text-secondary] hover:text-[--color-primary]"><Dribbble size={24} /></a>
                    <a href={userProfile?.social?.github || '#'} aria-label="Github" className="p-2 text-[--color-text-secondary] hover:text-[--color-primary]"><Github size={24} /></a>
                </CardContent>
            </Card>
          </aside>
          
          {/* Right Content Area */}
          <main className="lg:col-span-8">
            {/* Balances */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <BalanceCard icon={Wallet} title="Wallet Balance" amount="$1,234.56" description="+20.1% last month" cta="Withdraw"/>
                <BalanceCard icon={Coins} title="FOG Coins" amount="12,500 FOG" description="≈ $1,250.00" cta="Top Up"/>
            </div>

            {/* Tabs */}
            <Card>
              <div className="border-b border-[--color-border]">
                <nav className="flex px-4 space-x-2">
                  {(['overview', 'portfolio', 'reviews', 'settings'] as Tab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-3 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-[--color-primary]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[--color-primary]" {...{ layoutId: "underline" }} />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    {...{
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -10 },
                      transition: { duration: 0.2 },
                    }}
                  >
                    {activeTab === 'overview' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-[--color-text-primary]">Recent Activity</h3>
                        {(userProfile?.activity || staticActivity).length > 0 ? (
                          <ul className="space-y-4">
                            {(userProfile?.activity || staticActivity).map((item, index) => (
                              <li key={index} className="flex items-start">
                                <div className="p-2 bg-[--color-bg-tertiary] rounded-full mr-4 mt-1">
                                  <CheckCircle className="w-5 h-5 text-[--color-primary]" />
                                </div>
                                <div>
                                  <p className="text-[--color-text-primary]">{item.content}</p>
                                  <p className="text-sm text-[--color-text-secondary]">{item.time}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-[--color-text-secondary]">No recent activity to display.</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'portfolio' && (
                      <div>
                        {(userProfile?.portfolio || staticPortfolio).length > 0 ? (
                          <div className="grid sm:grid-cols-2 gap-6">
                            {(userProfile?.portfolio || staticPortfolio).map(item => (
                              <Card key={item.id} className="overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="aspect-video overflow-hidden">
                                  <img 
                                    src={`${item.imageUrl}&q=80&fit=crop&crop=entropy`} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                  />
                                </div>
                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-[--color-text-primary]">{item.title}</h3>
                                  <p className="text-sm text-[--color-text-secondary]">{item.category}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-[--color-text-secondary]">No portfolio items to display.</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => setActiveTab('settings')}
                            >
                              Add Portfolio Items
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'reviews' && (
                      <div>
                        {(userProfile?.reviews || staticReviews).length > 0 ? (
                          <div className="space-y-6">
                            {(userProfile?.reviews || staticReviews).map(review => (
                              <Card key={review.id} className="border-l-4 border-[--color-primary]/50">
                                <CardContent className="p-6">
                                  <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-[--color-bg-secondary] flex items-center justify-center font-bold text-[--color-text-secondary] mr-4">
                                      {review.client.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="font-semibold text-[--color-text-primary]">{review.client}</h4>
                                          <p className="text-sm text-[--color-text-secondary]">{review.project}</p>
                                        </div>
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-[--color-border]'}`} />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="mt-3 text-[--color-text-secondary] italic">"{review.comment}"</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-[--color-text-secondary]">No reviews to display.</p>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'settings' && (
                      <SettingsTab
                        editForm={editForm}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        newSkill={newSkill}
                        userProfile={userProfile}
                        currentUser={currentUser}
                        handleFormChange={handleFormChange}
                        handleSocialChange={handleSocialChange}
                        handleSkillAdd={handleSkillAdd}
                        handleSkillRemove={handleSkillRemove}
                        handleCancelEdit={handleCancelEdit}
                        handleSaveProfile={handleSaveProfile}
                        setIsEditing={setIsEditing}
                        setNewSkill={setNewSkill}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </main>
        </div>
          </>
        )}
      </div>
    </div>
  );
}


const StatItem = ({ value, label }: { value: string | number; label: string }) => (
    <div>
        <p className="text-2xl font-bold text-[--color-text-primary]">{value}</p>
        <p className="text-xs text-[--color-text-secondary] uppercase tracking-wider">{label}</p>
    </div>
);

const BalanceCard = ({ icon: Icon, title, amount, description, cta }: { icon: React.ElementType, title: string, amount: string, description: string, cta: string }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-[--color-text-secondary]">{title}</p>
                    <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{amount}</p>
                    <p className="text-xs text-[--color-text-secondary] mt-1">{description}</p>
                </div>
                <Icon className="w-6 h-6 text-[--color-text-secondary]/70"/>
            </div>
            <Button variant="link" className="p-0 h-auto mt-2 text-sm">{cta}</Button>
        </CardContent>
    </Card>
);

export default ProfilePage;