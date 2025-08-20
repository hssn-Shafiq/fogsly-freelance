import React from 'react';
import { Linkedin, Twitter, Dribbble, Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { User as FirebaseUser, UserProfile } from '../../firebase/types/user';

interface ProfileSidebarProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const StatItem = React.memo(({ value, label }: { value: string | number; label: string }) => (
  <div>
    <p className="text-2xl font-bold text-[--color-text-primary]">{value}</p>
    <p className="text-xs text-[--color-text-secondary] uppercase tracking-wider">{label}</p>
  </div>
));

StatItem.displayName = 'StatItem';

const ProfileSidebar = React.memo(({ userProfile, currentUser }: ProfileSidebarProps) => {
  return (
    <aside className="lg:col-span-4 space-y-6">
      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">
            {userProfile?.bio || 'No bio available.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
          <StatItem value={userProfile?.stats?.rating || '4.95'} label="Rating" />
          <StatItem value={userProfile?.stats?.reviews || '0'} label="Reviews" />
          <StatItem value={userProfile?.stats?.projects || '0'} label="Projects" />
          <StatItem value={userProfile?.stats?.completionRate || '0%'} label="Completion" />
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(userProfile?.skills || ['React', 'TypeScript', 'Firebase']).map(skill => (
            <span 
              key={skill} 
              className="px-3 py-1 bg-[--color-bg-secondary] text-sm font-medium rounded-full"
            >
              {skill}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Social Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Socials</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <a 
            href={userProfile?.social?.linkedin || '#'} 
            aria-label="LinkedIn" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Linkedin size={24} />
          </a>
          <a 
            href={userProfile?.social?.twitter || '#'} 
            aria-label="Twitter" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Twitter size={24} />
          </a>
          <a 
            href={userProfile?.social?.dribbble || '#'} 
            aria-label="Dribbble" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Dribbble size={24} />
          </a>
          <a 
            href={userProfile?.social?.github || '#'} 
            aria-label="Github" 
            className="p-2 text-[--color-text-secondary] hover:text-[--color-primary] transition-colors"
          >
            <Github size={24} />
          </a>
        </CardContent>
      </Card>
    </aside>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';

export default ProfileSidebar;
