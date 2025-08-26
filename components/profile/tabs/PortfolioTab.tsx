import React from 'react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { User as FirebaseUser, UserProfile } from '../../../firebase/types/user';
import { staticPortfolio, Tab } from '../types';

interface PortfolioTabProps {
  userProfile: UserProfile | null;
  currentUser: FirebaseUser | null;
  onTabChange: (tab: Tab) => void;
}

const PortfolioTab = React.memo(({ userProfile, currentUser, onTabChange }: PortfolioTabProps) => {
  // const portfolioData = userProfile?.portfolio || staticPortfolio;

  return (
    <div>
      {/* {portfolioData.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Your Portfolio</h1>
            <p className="text-lg text-[--color-text-secondary]">
              Showcase your work and skills to potential clients.
            </p>
          </div>
          {portfolioData.map(item => (
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
            onClick={() => onTabChange('settings')}
          >
            Add Portfolio Items
          </Button>
        </div>
      )} */}

      <div className="text-center mb-8">
        {/* <h1 className="text-4xl font-bold mb-4">Your Portfolio</h1> */}
        <p className="text-lg text-[--color-text-secondary]">
          Showcase your work and skills to potential clients. Coming soon..
        </p>
      </div>
    </div>
  );
});

PortfolioTab.displayName = 'PortfolioTab';

export default PortfolioTab;
