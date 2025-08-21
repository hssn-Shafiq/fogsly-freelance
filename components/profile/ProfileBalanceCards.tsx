import React, { useState, useEffect } from 'react';
import { Wallet, Coins, Play } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { getUserAdStats } from '../../firebase/services/adService';
import { UserAdStats } from '../../firebase/types/ads';
import { User } from '../../firebase/types/user';

interface BalanceCardProps {
  icon: React.ElementType;
  title: string;
  amount: string;
  description: string;
  cta: string;
  onClick?: () => void;
}

const BalanceCard = React.memo(({ icon: Icon, title, amount, description, cta, onClick }: BalanceCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4 pt-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[--color-text-secondary]">{title}</p>
          <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{amount}</p>
          <p className="text-xs text-[--color-text-secondary] mt-1">{description}</p>
        </div>
        <Icon className="w-6 h-6 text-[--color-text-secondary]/70"/>
      </div>
      <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={onClick}>
        {cta}
      </Button>
    </CardContent>
  </Card>
));

BalanceCard.displayName = 'BalanceCard';

interface ProfileBalanceCardsProps {
  currentUser: User | null;
  navigate?: (route: string) => void;
}

const ProfileBalanceCards = React.memo(({ currentUser, navigate }: ProfileBalanceCardsProps) => {
  const [userStats, setUserStats] = useState<UserAdStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const stats = await getUserAdStats(currentUser.uid);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStats();
  }, [currentUser]);

  const handleWatchAds = () => {
    navigate?.('watch-ads');
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal functionality
    console.log('Withdraw clicked');
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 pt-4">
              <div className="h-4 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-8 bg-[--color-bg-tertiary] rounded mb-2"></div>
              <div className="h-3 bg-[--color-bg-tertiary] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalBalance = userStats?.totalEarnings || 0;
  const todayEarnings = userStats?.availableBalance || 0; // Using available balance for today's earnings
  const adsWatched = userStats?.totalAdsWatched || 0;

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <BalanceCard 
        icon={Wallet} 
        title="Total Earnings" 
        amount={`$${(totalBalance * 0.1).toFixed(2)}`} 
        description={`$${todayEarnings.toFixed(2)} earned today`} 
        cta="Withdraw"
        onClick={handleWithdraw}
      />
      <BalanceCard 
        icon={Coins} 
        title="FOG Coins" 
        amount={`${Math.floor(totalBalance)} FOG`} 
        description={`≈ $${totalBalance.toFixed(2)}`} 
        cta="Exchange"
      />
      <BalanceCard 
        icon={Play} 
        title="Ads Watched" 
        amount={adsWatched.toString()} 
        description={`${userStats?.dailyWatchCount || userStats?.todaysCount || 0} watched today`} 
        cta="Watch More"
        onClick={handleWatchAds}
      />
    </div>
  );
});

ProfileBalanceCards.displayName = 'ProfileBalanceCards';

export default ProfileBalanceCards;
