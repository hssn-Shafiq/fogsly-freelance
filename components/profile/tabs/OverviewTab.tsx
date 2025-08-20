import React from 'react';
import { CheckCircle } from 'lucide-react';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { staticActivity } from '../types';

interface OverviewTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
}

const OverviewTab = React.memo(({ userProfile, currentUser }: OverviewTabProps) => {
  const activityData = userProfile?.activity || staticActivity;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-[--color-text-primary]">Recent Activity</h3>
      {activityData.length > 0 ? (
        <ul className="space-y-4">
          {activityData.map((item, index) => (
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
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
